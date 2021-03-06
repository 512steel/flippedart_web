import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base'

import { Transactions } from './transactions.js';
//import { UserAttributes } from '../user-attributes/user-attributes.js';
import { updateRankByName as userAttributesUpdateRank } from '../user-attributes/methods.js';
import { ExchangeItems } from '../exchange-items/exchange-items.js';
import { updateRank as exchangeItemUpdateRank,
         lock as exchangeItemsLock,
         unlock as exchangeItemsUnlock,
         transfer as exchangeItemsTransfer } from '../exchange-items/methods.js';

import { insert as chatSessionInsert } from '../chat-sessions/methods.js';

import { createTransactionStateNotification } from '../notifications/methods.js';

import {
    POINTS_SYSTEM,
    TRANSACTION_STATES } from '../../ui/lib/globals.js';

import { throwError } from '../../ui/lib/temporary-alerts.js';

import { sendTransactionEventEmail } from './../../api/email/email-senders.js';


/***
 * TODO: put these states into a global variable like POINTS_SYSTEM
 *
 * NOTE: the transaction "states" are as follows:
 *
 *      "requested" - requester has "requested"
 *      "pending"  - requestee has "approved"
 *      "completed" - requestee has "completed"
 *      "declined" - requestee has "declined"
 *      "cancelled" - requester has "cancelled"
 */

//NOTE: "requesting" is tantamount to "inserting" a new transaction
//TODO: change itemIds to itemId - single item instead of array of items, which deprecates a wonky middleware feature.
export const requestTransaction = new ValidatedMethod({
    name: 'transaction.request',
    validate: new SimpleSchema({
        requesteeName: {type: String},
        itemIds: {
            type: [String],
            regEx: SimpleSchema.RegEx.Id,
            minCount: 1,
            maxCount: 1,
        },
    }).validator(),
    run({ requesteeName, itemIds }) {
        if (this.userId) {
            const requester = Meteor.users.findOne(this.userId);
            let requestee = Meteor.users.findOne({username: requesteeName});

            if (Meteor.isServer) {
                //a bit of wonkiness here, but if `findUserByUsername` runs on the client the method quits executing entirely
                requestee = Accounts.findUserByUsername(requesteeName);
            }

            if (requester && requestee && (requester._id != requestee._id)) {

                //Check that each item being requested is owned by the "requestee"
                const validItems = ExchangeItems.find(
                    {
                        _id: {
                            $in: itemIds,
                        },
                        $and: [
                            {ownerName: {$not: {$ne: requesteeName}}},  //using not->ne instead of eq due to a lack of minimongo support
                            {locked: false},
                            {available: true},
                        ]
                    });

                if (validItems.count() != itemIds.length) {
                    throwError('At least one item you\'ve requested is not able to be requested from this user.');

                    throw new Meteor.Error('transaction.request.invalid-items',
                        'At least one item you\'ve requested is not able to be requested from this user.');
                }

                const transaction = {
                    requesteeId: requestee._id,
                    requesteeName: requesteeName,
                    requesterId: requester._id,
                    requesterName: requester.username,
                    itemIds: itemIds,
                    state: 'requested',
                    createdAt: new Date(),
                };

                const newTransactionId = Transactions.insert(transaction);

                for (var i = 0; i < itemIds.length; i++) {
                    exchangeItemUpdateRank(itemIds[i], POINTS_SYSTEM.ExchangeItems.requested);
                }

                //TODO: it would be cleaner if the updateRank() and lock() funcitons both accepted an array of itemIds.
                //TODO: also, a user could abuse this by requesting another user's items, keeping them locked. Think about how to fix this (perhaps a log() time-restriction on re-requesting an item).
                exchangeItemsLock(itemIds);


                //TODO: create a new ChatSession from here
                chatSessionInsert(requester._id, requestee._id);

                createTransactionStateNotification(newTransactionId);

                sendTransactionEventEmail.call({
                    requesterId: requester._id,
                    requesterName: requester.username,
                    requesteeId: requestee._id,
                    requesteeName: requestee.username,
                    state: TRANSACTION_STATES.requested
                }, (res, err) => {
                    //TODO: error handling here
                });

                return newTransactionId;  //NOTE: this return is used for redirecting the user to the transaction page via FlowRouter.
            }
            else {
                if (Meteor.isServer) {
                    throwError('[invalid]Invalid users were included in this transaction.');
                    //throw new Meteor.Error('transaction.request.invalid',
                    //   'Invalid users included in this transaction.');
                }
            }
        }
        else {
            if (Meteor.isServer) {
                //TODO: throw an actual error here.
                console.log('[accessDenied]You must be signed in to request an item.')
            }
        }
    }
});

//Only the "requestee" can approve a transaction
export const approveTransaction = new ValidatedMethod({
    name: 'transaction.approve',
    validate: new SimpleSchema({
        transactionId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ transactionId }) {
        if (this.userId) {
            const transaction = Transactions.findOne(transactionId);

            if (transaction && (transaction.requesteeId == this.userId) && (transaction.state == 'requested')) {
                Transactions.update(transactionId,
                    {
                        $set : {state : 'pending'}
                    });

                //TODO: create a notification for the requester that their request has been approved
                createTransactionStateNotification(transactionId);

                sendTransactionEventEmail.call({
                    requesterId: transaction.requesterId,
                    requesterName: transaction.requesterName,
                    requesteeId: transaction.requesteeId,
                    requesteeName: transaction.requesteeName,
                    state: TRANSACTION_STATES.approved
                }, (res, err) => {
                    //TODO: error handling here
                });
            }
            else {
                console.log('Invalid transaction state change.');
            }
        }
        else {
            console.log('You must be signed in to do this.');
        }
    }
});

//Only the "requestee" can complete a transaction
export const completeTransaction = new ValidatedMethod({
    name: 'transaction.complete',
    validate: new SimpleSchema({
        transactionId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ transactionId }) {
        if (this.userId) {
            const transaction = Transactions.findOne(transactionId);

            if (transaction && (transaction.requesteeId == this.userId) && (transaction.state == 'pending')) {
                Transactions.update(transactionId,
                    {
                        $set : {state : 'completed'}
                    });

                // transfer ownership - the items are unlocked when they transfer
                exchangeItemsTransfer(transaction.itemIds, transaction.requesteeId, transaction.requesterId);

                // unlock all items so they may be re-requested
                exchangeItemsUnlock(transaction.itemIds);

                // update rank values
                for (var i = 0; i < transaction.itemIds.length; i++) {
                    exchangeItemUpdateRank(transaction.itemIds[i], POINTS_SYSTEM.ExchangeItems.completed);
                }

                userAttributesUpdateRank(transaction.requesteeName, POINTS_SYSTEM.UserAttributes.exchangeItemGive);
                userAttributesUpdateRank(transaction.requesterName, POINTS_SYSTEM.UserAttributes.exchangeItemAdd);


                //TODO: create a Notification for the requester that their request has been completed and they're the new item owners
                createTransactionStateNotification(transactionId);

                sendTransactionEventEmail.call({
                    requesterId: transaction.requesterId,
                    requesterName: transaction.requesterName,
                    requesteeId: transaction.requesteeId,
                    requesteeName: transaction.requesteeName,
                    state: TRANSACTION_STATES.completed
                }, (res, err) => {
                    //TODO: error handling here
                });
            }
        }
        else {
            console.log('[accessDenied]You must be signed in to request an item.');
        }
    }
});

//only the "requestee" can decline a transaction
export const declineTransaction = new ValidatedMethod({
    name: 'transaction.decline',
    validate: new SimpleSchema({
        transactionId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ transactionId }) {
        if (this.userId) {
            const transaction = Transactions.findOne(transactionId);

            if (transaction && (transaction.requesteeId == this.userId) && (transaction.state == 'requested' || transaction.state == 'pending')) {
                Transactions.update(transactionId,
                    {
                        $set : {state : 'declined'}
                    });

                //make the items available for anyone else to request.
                exchangeItemsUnlock(transaction.itemIds);

                //TODO: create a notification for the requester that their request has been declined
                createTransactionStateNotification(transactionId);

                sendTransactionEventEmail.call({
                    requesterId: transaction.requesterId,
                    requesterName: transaction.requesterName,
                    requesteeId: transaction.requesteeId,
                    requesteeName: transaction.requesteeName,
                    state: TRANSACTION_STATES.declined
                }, (res, err) => {
                    //TODO: error handling here
                });
            }
            else {
                console.log('Invalid transaction state change.');
            }
        }
        else {
            console.log('You must be signed in to do this.');
        }
    }
});

//only the "requester" may cancel a transaction
export const cancelTransaction = new ValidatedMethod({
    name: 'transaction.cancel',
    validate: new SimpleSchema({
        transactionId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ transactionId }) {
        if (this.userId) {
            const transaction = Transactions.findOne(transactionId);

            if (transaction && (transaction.requesterId == this.userId) && (transaction.state == 'requested' || transaction.state == 'pending')) {
                Transactions.update(transactionId,
                    {
                        $set : {state : 'cancelled'}
                    });

                //make the items available for anyone else to request.
                exchangeItemsUnlock(transaction.itemIds);

                //TODO: create a notification for the requester that their request has been cancelled
                createTransactionStateNotification(transactionId);

                sendTransactionEventEmail.call({
                    requesterId: transaction.requesterId,
                    requesterName: transaction.requesterName,
                    requesteeId: transaction.requesteeId,
                    requesteeName: transaction.requesteeName,
                    state: TRANSACTION_STATES.cancelled
                }, (res, err) => {
                    //TODO: error handling here
                });
            }
            else {
                console.log('Invalid transaction state change.');
            }
        }
        else {
            console.log('You must be signed in to do this.');
        }
    }
});


// Get list of all method names on Lists
const TRANSACTIONS_METHODS = _.pluck([
    requestTransaction,
    approveTransaction,
    completeTransaction,
    declineTransaction,
    cancelTransaction,
], 'name');

if (Meteor.isServer) {
    // Only allow 5 userPost operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(TRANSACTIONS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 1000);
}

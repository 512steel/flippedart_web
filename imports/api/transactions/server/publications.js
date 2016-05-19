/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Transactions } from '../transactions.js';
import { ExchangeItems } from '../../exchange-items/exchange-items.js';


//FIXME: remove these ".all" publications
Meteor.publish('transactions.all', function () {  //TODO: pass in "options" object for sorting/limit, and query these
    /*check(options, {
     sort: Object,
     limit: Number
     });*/

    return Transactions.find(
        {},
        {
            fields: Transactions.publicFields,
        }
    );
});


Meteor.publish('transactions.user', function(options) {
    check(options, {
        sort: Object
    });

    if (this.userId) {
        return Transactions.find(
            {
                $or: [
                    {
                        requesteeId: this.userId
                    },
                    {
                        requesterId: this.userId
                    }
                ]
            },
            {
                sort: options.sort,
            });
    }
});

Meteor.publish('transactions.single', function(transactionId) {
    check(transactionId, String);

    //TODO: test this
    if (this.userId) {
        return Transactions.find(
            {
                _id: transactionId,
                $or: [
                    {requesteeId: this.userId},
                    {requesterId: this.userId}
                ]
            });
    }
});

//TODO: move this to exchangeItems publications?
Meteor.publish('transactions.single.exchangeItems', function(transactionId) {
    check(transactionId, String);

    if (this.userId) {
        var transaction = Transactions.findOne(transactionId);
        if (transaction &&
            (transaction.requesteeId == this.userId || transaction.requesterId == this.userId)) {
            var itemIds = transaction.itemIds;
            return ExchangeItems.find({_id : {$in : itemIds}});
        }
    }
});


/*  Given "transactions.user" above, I'm not sure whether we'd need this

Meteor.publish('userTransactionsRequester', function(userId, options) {
    check(userId, String);
    check(options, {
        sort: Object
    });
    return Transactions.find({requesterId : userId});
});
Meteor.publish('userTransactionsRequestee', function(userId, options) {
    check(userId, String);
    check(options, {
        sort: Object
    });
    return Transactions.find({requesteeId :  userId});
});*/

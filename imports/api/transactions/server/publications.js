/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Transactions } from '../transactions.js';

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


Meteor.publish('transactions.user', function(username, options) {
    check(username, String);
    check(options, {
        sort: Object,
        limit: Number
    });
    return Transactions.find(
        {
            $or: [
                {
                    requesteeName: username
                },
                {
                    requesterName: username
                }
            ]
        }, options);
});

Meteor.publish('transactions.single', function(transactionId) {
    check(transactionId, String);
    return Transactions.find(transactionId);
});
Meteor.publish('transaction.single.exchangeItems', function(transactionId) {
    check(transactionId, String);

    var transaction = Transactions.findOne(transactionId);
    if (transaction) {
        var itemIds = transaction.itemIds;
        return items = ExchangeItems.find({_id : {$in : itemIds}});
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

import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';

class TransactionsCollection extends Mongo.Collection {
    insert(transaction, callback) {
        const ourTransaction = transaction;
        ourTransaction.createdAt = ourTransaction.createdAt || new Date();
        return result = super.insert(ourTransaction, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
    remove(selector, callback) {
        return result = super.remove(selector, callback);
    }
}

export const Transactions = new TransactionsCollection('Transactions');

// Deny all client-side updates since we will be using methods to manage this collection
Transactions.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

Transactions.schema = new SimpleSchema({
    requesteeId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    requesteeName: {
        type: String,
    },
    requesterId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    requesterName: {
        type: String,
    },
    itemIds: {
        type: [String],  //TODO: can SimpleSchema check each element of the array against its RegEx.Id?
    },
    state: {
        type: String,
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
    },
});

Transactions.attachSchema(Transactions.schema);

// This represents the keys from Transactions objects that should be published
// to the client. If we add secret properties to UserPost objects, don't list
// them here to keep them private to the server.
Transactions.publicFields = {
    //requesteeId: 1,
    requesteeName: 1,
    //requesterId: 1,
    requesterName: 1,
    itemIds: 1,
    state: 1,
    createdAt: 1
};

//TODO: build testing factory here
Factory.define('transaction', Transactions, {});


Transactions.helpers({
    //TODO: do we need an editableBy() here?
    editableBy: function(userId) {
        if (userId && Meteor.isClient) {
            //...
        }
        else if (userId && Meteor.isServer) {
            //...
        }
        else {
            return false;
        }
    }
});

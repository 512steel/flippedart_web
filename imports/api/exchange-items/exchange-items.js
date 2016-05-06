import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';

class ExchangeItemsCollection extends Mongo.Collection {
    insert(item, callback) {
        const ourItem = item;
        ourItem.createdAt = ourItem.createdAt || new Date();
        return result = super.insert(ourItem, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
    remove(selector, callback) {
        return result = super.remove(selector, callback);
    }
}

export const ExchangeItems = new ExchangeItemsCollection('ExchangeItems');

// Deny all client-side updates since we will be using methods to manage this collection
ExchangeItems.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

ExchangeItems.schema = new SimpleSchema({
    ownerId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    ownerName: {
        type: String,
    },
    title: {
        type: String,
        max: 200,
    },
    description: {
        type: String,
        max: 2000,
    },
    location: {
        type: String,
        max: 200,
        optional: true,
    },
    tag: {
        type: String,
        optional: true,
    },
    imageLinks: {
        type: [String],
        minCount: 1  //NOTE: all exchange items must include an image
    },
    mainImageLink: {
        type: String,
        optional: true,
        //regEx: SimpleSchema.RegEx.Url,  //TODO: make sure the cloudinary formatting works before turning this on
    },
    available: {
        type: Boolean,
        defaultValue: true,
    },
    locked: {
        type: Boolean,
    },
    addendums: {
        type: [String],
        optional: true,
    },
    rank: {
        type: Number,
    },
    pastOwnerNames: {
        type: [String],
        optional: true,  //todo: remove this line?
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
    },
});

ExchangeItems.attachSchema(ExchangeItems.schema);

// This represents the keys from UserPosts objects that should be published
// to the client. If we add secret properties to UserPost objects, don't list
// them here to keep them private to the server.
ExchangeItems.publicFields = {
    //ownerId: 1,  //
    ownerName: 1,
    title: 1,
    description: 1,
    location: 1,
    tag: 1,
    imageLinks: 1,
    mainImageLink: 1,
    available: 1,
    locked: 1,
    addendums: 1,
    //rank: 1,  //
    pastOwnerNames: 1,
    createdAt: 1,
};

//TODO: build testing factory here
Factory.define('exchangeItem', ExchangeItems, {});

/*
 NOTE: we need the editableBy helper to run differently in the client and server, due to
 Meteor's Method simulations on the client (which don't touch the server if the client fails).
 */
ExchangeItems.helpers({
    //TODO: include check for "locked"
    editableBy(ownerId) {
        if (Meteor.isClient && Meteor.user() && !this.locked) {
            return true;
        }
        /*
         'this.ownerId' is a little unclear here, although it does what we want it to
         do.  It checks that the exchangeItem exists, not that the current user exists.
         The latter is confirmed by the server-side variable 'this.userId', which is
         passed into this method.
        */
        else if (Meteor.isServer && this.ownerId && !this.locked) {
            return this.ownerId === ownerId;
        }
        else {
            return false;
        }
    }
});

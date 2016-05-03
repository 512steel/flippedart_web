import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';

class CommentsCollection extends Mongo.Collection {
    insert(comment, callback) {
        const ourComment = comment;
        ourComment.createdAt = ourComment.createdAt || new Date();
        return result = super.insert(ourComment, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
    remove(selector, callback) {
        return result = super.remove(selector, callback);
    }
}

export const Comments = new CommentsCollection('Comments');

// Deny all client-side updates since we will be using methods to manage this collection
Comments.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

Comments.schema = new SimpleSchema({
    userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    author: {
        type: String,
    },
    userPostId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    text: {
        type: String,
        max: 5000,
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
    },
});

Comments.attachSchema(Comments.schema);

// This represents the keys from Comments objects that should be published
// to the client. If we add secret properties to Comment objects, don't list
// them here to keep them private to the server.
Comments.publicFields = {
    //userId: 1,
    author: 1,
    text: 1,
    userPostId: 1,
    createdAt: 1,
};

//TODO: build testing factory here
Factory.define('comment', Comments, {});


/*
 NOTE: we need the editableBy helper to run differently in the client and server, due to
 Meteor's Method simulations on the client (which don't touch the server if the client fails).
 */
Comments.helpers({
    editableBy(userId) {
        if (Meteor.isClient && Meteor.user()) {
            return true;
        }
        else if (Meteor.isServer && this.userId) {
            return this.userId === userId;
        }
        else {
            return false;
        }
    }
});

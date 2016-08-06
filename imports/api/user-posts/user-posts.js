import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
import { Comments } from '../comments/comments.js';

class UserPostsCollection extends Mongo.Collection {
    insert(post, callback) {
        const ourPost = post;
        ourPost.createdAt = ourPost.createdAt || new Date();
        return result = super.insert(ourPost, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
    remove(selector, callback) {
        Comments.remove({ userPostId: selector });

        return result = super.remove(selector, callback);
    }
}

export const UserPosts = new UserPostsCollection('UserPosts');

// Deny all client-side updates since we will be using methods to manage this collection
UserPosts.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});


UserPosts.schema = new SimpleSchema({
    userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    author: {
        type: String,
    },
    location: {
        type: String,
        max: 100,
        optional: true,
    },
    commentsCount: {
        type: Number,
    },
    voters: {
        type: [String],
    },
    upvotes: {
        type: Number,
    },
    flaggers: {
        type: [String],
    },
    flags: {
        type: Number,
    },
    rank: {
        type: Number,
    },
    text: {
        type: String,
        max: 5000,
    },
    imageLinks: {
        type: [String],
    },
    tag: {
        type: String,
        max: 100,
        optional: true,
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
    },
    lastUpdated: {
        type: Date,
        optional: true,
    }
});

UserPosts.attachSchema(UserPosts.schema);

// This represents the keys from UserPosts objects that should be published
// to the client. If we add secret properties to UserPost objects, don't list
// them here to keep them private to the server.
UserPosts.publicFields = {
    //userId: 1,
    author: 1,
    location: 1,
    commentsCount: 1,
    voters: 1,
    upvotes: 1,
    flaggers: 1,
    flags: 1,
    text: 1,
    imageLinks: 1,
    tag: 1,
    createdAt: 1,
    lastUpdated: 1,
    rank: 1
};

//TODO: build testing factory here
Factory.define('userPost', UserPosts, {});


/*
 NOTE: we need the editableBy helper to run differently in the client and server, due to
 Meteor's Method simulations on the client (which don't touch the server if the client fails).
*/
UserPosts.helpers({
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

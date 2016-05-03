import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';

class NotificationsCollection extends Mongo.Collection {
    insert(notification, callback) {
        const ourNotification = notification;
        ourNotification.createdAt = ourNotification.createdAt || new Date();
        return result = super.insert(ourNotification, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
    remove(selector, callback) {
        return result = super.remove(selector, callback);
    }
}

export const Notifications = new NotificationsCollection('Notifications');

// Deny all client-side updates since we will be using methods to manage this collection
Notifications.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

/*
 NOTE: different notifications will have different fields filled in.
*/
Notifications.schema = new SimpleSchema({
    recipientId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    hasRead: {
        type: Boolean,
    },
    type: {
        type: String
    },
    text: {
        type: String,
        optional: true
    },
    userPostId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    commentId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    commenterName: {
        type: String,
        optional: true
    },
    chatSessionId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    imageLink: {
        type: String,
        //regEx: SimpleSchema.RegEx.Url,  //TODO: verify
        optional: true
    },
    chatMessageSenderId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    chatMessageSenderName: {
        type: String,
        optional: true
    },
    transactionId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true,
    },
    transactionRequesteeId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true,
    },
    transactionRequesteeName: {
        type: String,
        optional: true,
    },
    transactionRequesterId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true,
    },
    transactionRequesterName: {
        type: String,
        optional: true,
    },
    itemIds: {
        type: [String],
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
    },
});

Notifications.attachSchema(Notifications.schema);

// This represents the keys from UserPosts objects that should be published
// to the client. If we add secret properties to UserPost objects, don't list
// them here to keep them private to the server.
Notifications.publicFields = {
    //recipientId: 1,
    hasRead: 1,
    type: 1,
    text: 1,
    userPostId: 1,
    commentId: 1,
    commenterName: 1,
    chatSessionId: 1,
    imageLink: 1,
    //chatMessageSenderId: 1,
    chatMessageSenderName: 1,
    transactionId: 1,
    //transactionRequesteeId: 1,
    transactionRequesteeName: 1,
    //transactionRequesterId: 1,
    transactionRequesterName: 1,
    itemIds: 1,
    createdAt: 1,
};

//TODO: build testing factory here
Factory.define('notification', Notifications, {});


Notifications.helpers({
    editableBy : function(userId) {
        console.log('in notifications editableBy');
        if (userId && Meteor.isClient) {
            console.log('on client...');
            return true;
        }
        else if (userId && Meteor.isServer) {
            console.log('on server...');
            return this.recipientId === userId;
        }
        else {
            console.log('nope...');
            return false;
        }
    }
});

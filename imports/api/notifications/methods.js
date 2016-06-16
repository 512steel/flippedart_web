import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import { sanitizeHtml, sanitizeHtmlNoReturns } from '../../ui/lib/general-helpers.js';

import { Notifications } from './notifications.js';
import { UserPosts } from '../user-posts/user-posts.js';
import { Transactions } from '../transactions/transactions.js';
import { ChatSessions } from '../chat-sessions/chat-sessions.js';

import { POINTS_SYSTEM } from '../../ui/lib/globals.js';


//"requesting" is tantamount to "inserting" a new transaction
export const clearAllNotifications = new ValidatedMethod({
    name: 'notifications.clear.all',
    validate: new SimpleSchema({
        //...
    }).validator(),
    run({ }) {
        console.log('in method notifications.clear.all');

        if (this.userId) {

            /*
             FIXME: as elsewhere, update with multi doesn't seem to be working (still only updating
             one document at a time), so I'm deferring to the uglier forEach-loop solution below.
            */
            /*Notifications.update(
                {
                    recipientId: this.userId,
                    hasRead: false
                },
                {
                    $set: {
                        hasRead: true,

                    }
                },
                {
                    multi: true
                });*/

            const allUserNotifications = Notifications.find({
                recipientId: this.userId,
                hasRead: false
            });
            allUserNotifications.forEach( function(notification) {
                Notifications.update(notification._id,
                    {
                        $set: {
                            hasRead: true
                        }
                    });
            });

        }
        else {
            throw new Meteor.Error('notifications.clear.accessDenied',
                'You must be signed in to do this.');
        }
    }
});

export const clearSingleNotification = new ValidatedMethod({
    name: 'notifications.clear.single',
    validate: new SimpleSchema({
        notificationId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        }
    }).validator(),
    run({ notificationId }) {
        console.log('in method notifications.clear.single');

        if (this.userId) {
            const notification = Notifications.findOne(notificationId);

            if (!notification || !notification.editableBy(this.userId)) {
                throw new Meteor.Error('notifications.clear.accessDenied',
                    'You don\'t have permission to clear this notification.');
            }

            Notifications.update(notificationId,
                {
                    $set: {
                        hasRead: true,
                    }
                });
        }
        else {
            throw new Meteor.Error('notifications.clear.accessDenied',
                'You must be signed in to do this.');
        }
    }
});


/*
 NOTE: the rest of these should be server-only methods:
        -createComment
        -createChatMessage
        -createItemRequest / itemApprove / itemComplete / itemDecline / itemCancel
*/
export const createCommentNotification = (commentId, userPostId, commenterName) => {
    console.log('in server method createCommentNotification');

    if (Meteor.isServer) {

        const createCommentNotificationFunctionSchema = new SimpleSchema({
            commentId: {
                type: String,
                regEx: SimpleSchema.RegEx.Id,
            },
            userPostId: {
                type: String,
                regEx: SimpleSchema.RegEx.Id,
            },
            commenterName: {
                type: String,
            },
        });
        check({
            commentId: commentId,
            userPostId: userPostId,
            commenterName: commenterName
        }, createCommentNotificationFunctionSchema);

        commenterName = sanitizeHtmlNoReturns(commenterName);

        const userPost = UserPosts.findOne(userPostId);

        if (userPost && (commenterName != userPost.author)) {
            Notifications.insert({
                recipientId: userPost.userId,
                userPostId: userPostId,
                commentId: commentId,
                commenterName: commenterName,
                hasRead: false,
                type: 'comment',
                createdAt: new Date()
            });
        }
    }
};

export const createTransactionStateNotification = (transactionId) => {
    console.log('in server method createTransactionStateNotification');

    if (Meteor.isServer) {

        const createTransactionStateNotificationFunctionSchema = new SimpleSchema({
            transactionId: {
                type: String,
                regEx: SimpleSchema.RegEx.Id,
            },
        });
        check({
            transactionId: transactionId
        }, createTransactionStateNotificationFunctionSchema);

        const transaction = Transactions.findOne(transactionId);

        if (transaction) {
            var transactionType = ' ';
            switch (transaction.state) {
                case 'requested':
                    transactionType = "transactionRequested";
                    break;
                case 'pending':
                    transactionType = 'transactionApproved';
                    break;
                case 'completed':
                    transactionType = "transactionCompleted";
                    break;
                case 'declined':
                    transactionType = "transactionDeclined";
                    break;
                case 'cancelled':
                    transactionType = 'transactionCancelled';
                    break;
            }

            /*
             NOTE: depending on the state that the transaction is in, send a notification
             to either the requester _or_ the requestee.  Splitting up this logic also affords
             us to pass the unique "transactionType" into the Notification document rather than
             a generic type "transaction" for a more nuanced UI.
            */
            var recipientId = ' '
            if (transactionType == 'transactionRequested' ||
                transactionType == 'transactionCancelled') {
                recipientId = transaction.requesteeId;

            }
            else if (transactionType == 'transactionApproved' ||
                     transactionType == 'transactionCompleted' ||
                     transactionType == 'transactionDeclined') {
                recipientId = transaction.requesterId;
            }

            Notifications.insert({
                recipientId: recipientId,
                transactionId: transaction._id,
                transactionRequesteeId: transaction.requesteeId,
                transactionRequesteeName: transaction.requesteeName,
                transactionRequesterId: transaction.requesterId,
                transactionRequesterName: transaction.requesterName,
                itemIds: transaction.itemIds,
                hasRead: false,
                type: transactionType,
                createdAt: new Date()
            });
        }
    }
};

//TODO: add notification functions for new chatMessages/chatSessions
export const createChatMessageNotification = (chatMessage) => {
    console.log('in server method createChatMessageNotification');

    if (Meteor.isServer) {

        /*
         NOTE: check()ing these nested fields got way to wonky when mixed with SimpleSchema,
         so I just pulled them all out into separate variables.
        */
        const chatSessionId = chatMessage.chatSessionId;
        const text = sanitizeHtml(chatMessage.text);
        const imageLink = chatMessage.imageLink;
        const senderId = chatMessage.senderId;
        const senderUserName = sanitizeHtmlNoReturns(chatMessage.senderUserName);
        const createdAt = chatMessage.createdAt;

        const createChatMessageNotificationFunctionSchema = new SimpleSchema({
            chatSessionId: {
                    type: String,
                    regEx: SimpleSchema.RegEx.Id,
                },
            text: {
                    type: String,
                    optional: true,
                },
            imageLink: {
                    type: String,
                    //regEx: SimpleSchema.RegEx.Id,  //TODO
                    optional: true,
                },
            senderId: {
                    type: String,
                    regEx: SimpleSchema.RegEx.Id,
                },
            senderUserName: {
                    type: String,
                },
            createdAt: {
                    type: Date,
                },
        });
        check({
                chatSessionId: chatSessionId,
                text: text,
                imageLink: imageLink,
                senderId: senderId,
                senderUserName: senderUserName,
                createdAt: createdAt,
        }, createChatMessageNotificationFunctionSchema);


        const chatSession = ChatSessions.findOne(chatMessage.chatSessionId);

        if (chatSession) {

            // Keep the messages sorted to the correct senders
            if (chatSession.firstUserId == chatMessage.senderId) {
                Notifications.insert({
                    recipientId: chatSession.secondUserId,
                    chatSessionId: chatSession._id,
                    text: chatMessage.text,
                    imageLink: chatMessage.imageLink,
                    chatMessageSenderId: chatMessage.senderId,
                    chatMessageSenderName: chatMessage.senderUserName,
                    createdAt: chatMessage.createdAt,
                    hasRead: false,
                    type: 'chatMessage'
                });
            }
            else if (chatSession.secondUserId == chatMessage.senderId) {
                Notifications.insert({
                    recipientId: chatSession.firstUserId,
                    chatSessionId: chatSession._id,
                    text: chatMessage.text,
                    imageLink: chatMessage.imageLink,
                    chatMessageSenderId: chatMessage.senderId,
                    chatMessageSenderName: chatMessage.senderUserName,
                    createdAt: chatMessage.createdAt,
                    hasRead: false,
                    type: 'chatMessage'
                });
            }
        }
    }
    else {
        //TODO: should this be a new Meteor.Error?
        console.log('You aren\'t allowed to do this from the client.');
    }
};


// Get list of all method names on Lists
const NOTIFICATIONS_METHODS = _.pluck([
    clearAllNotifications,
    clearSingleNotification,
], 'name');

if (Meteor.isServer) {
    // Only allow 5 userPost operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(NOTIFICATIONS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 1000);
}
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import { sanitizeHtml } from '../../ui/lib/general-helpers.js';

import { ChatMessages } from './chat-messages.js';
import { ChatSessions } from '../chat-sessions/chat-sessions.js';

import { createChatMessageNotification } from '../notifications/methods.js';


//NOTE: a chat message must contain _at least_ text and imageLink, or both (but not neither)
export const insert = new ValidatedMethod({
    name: 'chatMessage.insert',
    validate: new SimpleSchema({
        chatSessionId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
        text: {
            type: String,
            max: 5000,  //TODO: see Model schema note
            optional: true,
        },
        imageLink: {
            type: String,
            //regEx: SimpleSchema.RegEx.Url,  //TODO: test with Cloudinary
            optional: true,
        }
    }).validator(),
    run({ chatSessionId, text, imageLink }) {
        console.log('in method chatMessage.insert');

        if (this.userId) {

            text = sanitizeHtml(text);

            if (text || imageLink) {

                const currentUser = Meteor.users.findOne(this.userId);
                const chatSession = ChatSessions.findOne(chatSessionId);

                if (currentUser) {
                    if (chatSession &&
                       (chatSession.firstUserName === currentUser.username ||
                       chatSession.secondUserName === currentUser.username)) {  //TODO: refactor checks like these into a ChatSession helper method, much like editableBy()

                        const chatMessage = {
                            chatSessionId: chatSessionId,
                            text: text ? text : ' ',
                            imageLink: imageLink ? imageLink : ' ',
                            senderId: this.userId,
                            senderUserName: currentUser.username,
                            createdAt: new Date(),
                        };

                        ChatMessages.insert(chatMessage);

                        if (Meteor.isServer) {
                            createChatMessageNotification(chatMessage);
                        }
                    }
                    else {
                        throw new Meteor.Error('chatMessage.insert.invalidSession',
                            'This is not a valid chatSession.');
                    }
                }
                else {
                    throw new Meteor.Error('chatMessage.insert.invalidUser',
                        'There is something wrong with the current user\'s credentials.');
                }
            }
            else {
                throw new Meteor.Error('chatMessage.insert.invalidInputs',
                    'You must provide at least text or an image along with your message.');
            }
        }
        else {
            throw new Meteor.Error('chatMessage.insert.accessDenied',
                'You must be signed in to send a chat message.');
        }
    }
});

export const deleteChatMessage = new ValidatedMethod({
    name: 'chatMessage.deleteChatMessage',
    validate: new SimpleSchema({
        chatMessageId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ chatMessageId }) {
        console.log('in method chatMessage.deleteChatMessage');

        const chatMessage = ChatMessages.findOne(chatMessageId);

        if (chatMessage && Meteor.isServer) {  //NOTE: since chatMessage.senderId isn't exposed as a publicField, this will fail on client.

            if (chatMessage.senderId == this.userId) {
                ChatMessages.remove(chatMessageId);
            }
            else {
                //TODO: what would be the appropriate error format for this?
                console.log('[accessDenied]User is not allowed to delete this chat message.');
            }
        }
    }
});


//TODO: chatMessageGlobalInsert method, only admin-callable, to handle announcements


// Get list of all method names on Comments
const CHAT_MESSAGES_METHODS = _.pluck([
    insert,
    deleteChatMessage,
], 'name');

if (Meteor.isServer) {
    // Only allow 5 comment operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(CHAT_MESSAGES_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 6, 1000);
}

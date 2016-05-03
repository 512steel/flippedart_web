import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';

class ChatSessionCollection extends Mongo.Collection {
    insert(chatSession, callback) {
        const ourChatSession = chatSession;
        ourChatSession.createdAt = ourChatSession.createdAt || new Date();
        return result = super.insert(ourChatSession, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
    remove(selector, callback) {
        return result = super.remove(selector, callback);
    }
}

export const ChatSessions = new ChatSessionCollection('ChatSessions');

// Deny all client-side updates since we will be using methods to manage this collection
ChatSessions.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

ChatSessions.schema = new SimpleSchema({
    firstUserId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    firstUserName: {
        type: String,
    },
    secondUserId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    secondUserName: {
        type: String,
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
    },
});

ChatSessions.attachSchema(ChatSessions.schema);

// This represents the keys from ChatSessions objects that should be published
// to the client. If we add secret properties to ChatSession objects, don't list
// them here to keep them private to the server.
ChatSessions.publicFields = {
    //firstUserId: 1,
    firstUserName: 1,
    //secondUserId: 1,
    secondUserName: 1,
    createdAt: 1,
};

//TODO: build testing factory here
Factory.define('chatSession', ChatSessions, {});

ChatSessions.helpers({
    //...
});

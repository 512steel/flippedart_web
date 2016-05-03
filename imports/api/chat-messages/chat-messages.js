import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';

class ChatMessageCollection extends Mongo.Collection {
    insert(chatMessage, callback) {
        const ourChatMessage = chatMessage;
        ourChatMessage.createdAt = ourChatMessage.createdAt || new Date();
        return result = super.insert(ourChatMessage, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
    remove(selector, callback) {
        return result = super.remove(selector, callback);
    }
}

export const ChatMessages = new ChatMessageCollection('ChatMessages');

// Deny all client-side updates since we will be using methods to manage this collection
ChatMessages.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

ChatMessages.schema = new SimpleSchema({
    chatSessionId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    text: {
        type: String,
        max: 5000,  //TODO: assess character limits like this
        optional: true,
    },
    imageLink: {
        type: String,
        //regEx: SimpleSchema.RegEx.Url  //TODO: test with Cloudinary package
        optional: true
    },
    senderId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    senderUserName: {
        type: String
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
    },
});

ChatMessages.attachSchema(ChatMessages.schema);

// This represents the keys from ChatMessages objects that should be published
// to the client. If we add secret properties to ChatMessage objects, don't list
// them here to keep them private to the server.
ChatMessages.publicFields = {
    chatSessionId: 1,
    text: 1,
    imageLink: 1,
    //senderId: 1,
    senderUserName: 1,
    createdAt: 1,
};

//TODO: build testing factory here
Factory.define('chatMessage', ChatMessages, {});

ChatMessages.helpers({
    //...
});
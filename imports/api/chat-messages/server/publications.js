/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { ChatMessages } from '../chat-messages.js';
import { ChatSessions } from '../../chat-sessions/chat-sessions.js';

Meteor.publish('chatMessages.all', function () {  //FIXME: this is for testing purposes only - remove
    return ChatMessages.find(
        {},
        {
            fields: ChatMessages.publicFields,
        }
    );
});

// "username" here refers to the username in the _route_ of the chatwindow, i.e. who the current user is chatting _with_
Meteor.publish('chatMessages.session', function(otherUsername, options) {  //TODO: use "options" to sort by createdAt
    check(otherUsername, String);
    check(options, {
        sort: Object,
        limit: Number
    });

    if (this.userId) {

        const currentUsername = Meteor.users.findOne(this.userId).username;

        // this query is borrowed from the chatSessions.insert() function
        const chatSession = ChatSessions.findOne(
            {
                $or: [
                    {
                        $and: [
                            {firstUserName: {$not: {$ne: currentUsername}}},
                            {secondUserName: {$not: {$ne: otherUsername}}},
                        ]
                    },
                    {
                        $and: [
                            {firstUserName: {$not: {$ne: otherUsername}}},
                            {secondUserName: {$not: {$ne: currentUsername}}},
                        ]
                    },
                ]
            },
            {
                fields: ChatSessions.publicFields,
            }
        );

        if (chatSession) {

            return ChatMessages.find(
                {
                    chatSessionId: chatSession._id,
                },
                {
                    sort: options.sort,
                    limit: options.limit,
                    fields: ChatMessages.publicFields,
                }
            );
        }
    }
});

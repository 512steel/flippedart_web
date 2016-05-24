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
Meteor.publish('chatMessages.session', function(username/*, options*/) {  //TODO: use "options" to sort by createdAt
    if (this.userId) {

        /****
         *
        //FIXME: where is "username" being used?
         *
         ****/

        // this query is borrowed from the chatSessions.insert() function
        const chatSession = ChatSessions.findOne(
            {
                $or: [
                    {
                        $and: [
                            {firstUserId: {$not: {$ne: requesteeId}}},
                            {secondUserId: {$not: {$ne: requesterId}}},
                        ]
                    },
                    {
                        $and: [
                            {firstUserId: {$not: {$ne: requesterId}}},
                            {secondUserId: {$not: {$ne: requesteeId}}},
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
                    //TODO: 'sort' and 'limit' options here
                    fields: ChatMessages.publicFields,
                }
            );
        }
    }
});

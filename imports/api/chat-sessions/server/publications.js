/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { ChatSessions } from '../chat-sessions.js';

Meteor.publish('chatSessions.all', function () {  //TODO: this is for testing purposes only - remove
    return ChatSessions.find(
        {},
        {
            fields: ChatSessions.publicFields,
        }
    );
});

Meteor.publish('chatSessions.user', function() {
    return ChatSessions.find(
        {
            $or: [
                {firstUserId: this.userId},
                {secondUserId: this.userId},
            ]
        },
        {
            fields: ChatSessions.publicFields,
        });
});

//NOTE: the equivalent of "chatSessions.single" is handled by the "chatMessages.session" pub.

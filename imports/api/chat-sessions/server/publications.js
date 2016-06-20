/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { ChatSessions } from '../chat-sessions.js';

/*Meteor.publish('chatSessions.all', function () {  //NOTE: these are for testing purposes only - remove on production
    return ChatSessions.find(
        {},
        {
            fields: ChatSessions.publicFields,
        }
    );
});*/

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


// "username" here refers to the username in the _route_ of the chatwindow, i.e. who the current user is chatting _with_
Meteor.publish('chatSession.single', function(otherUsername) {
    check(otherUsername, String);

    if (this.userId) {

        const otherUser = Accounts.findUserByUsername(otherUsername);
        if (otherUser) {
            otherUsername = otherUser.username;
        }

        const currentUsername = Meteor.users.findOne(this.userId).username;

        if (currentUsername) {
            // this query is borrowed from the chatSessions.insert() function
            return ChatSessions.find(
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
        }
    }
});
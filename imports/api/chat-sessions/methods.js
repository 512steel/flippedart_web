import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';

import { ChatSessions } from './chat-sessions.js';


// Server-only function to insert a new ChatSession
export const insert = (requesterId, requesteeId) => {
    console.log('in server method chatSessions.insert');

    if (Meteor.isServer) {
        const insertFunctionSchema = new SimpleSchema({
            requesterId: {
                type: String,
                regEx: SimpleSchema.RegEx.Id,
            },
            requesteeId: {
                type: String,
                regEx: SimpleSchema.RegEx.Id,
            },
        });
        check({
            requesterId: requesterId,
            requesteeId: requesteeId,
        }, insertFunctionSchema);

        const requester = Meteor.users.findOne(requesterId);
        const requestee = Meteor.users.findOne(requesteeId);

        //TODO: I believe this query works, but haven't tested it that thoroughly
        const chatSessionAlreadyExists = ChatSessions.findOne({
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
        });

        if (requester && requestee) {
            if (!chatSessionAlreadyExists) {
                const chatSession = {
                    firstUserId: requestee._id,
                    firstUserName: requestee.username,
                    secondUserId: requester._id,
                    secondUserName: requester.username,
                    createdAt: new Date()
                };

                //TODO: it'd be nice to use update() and upsert here instead of the craziness above, but whatever works...
                var chatSessionId = ChatSessions.insert(chatSession);
            }
            else {
                console.log('chatSession already exists.');
            }
        }
        else {
            throw new Meteor.Error('chatSessions.insert.invalidUsers',
                'One of the users in this chatSession is invalid.');
        }
    }
    else {
        console.log('You can\'t call this method from the client.');
    }
};

import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { RecentActivity } from './recent-activity.js';
import { UserPosts } from '../user-posts/user-posts.js';
import { Transactions } from '../transactions/transactions.js';
import { ChatSessions } from '../chat-sessions/chat-sessions.js';

import { RECENT_ACTIVITY_TYPES } from './../../ui/lib/globals.js';


/*
 NOTE: this should be a server-only method.
 */
export const createRecentActivity = (actorName, acteeName, actionType, link) => {
    if (Meteor.isServer) {
        const createRecentActivityFunctionSchema = new SimpleSchema({
            actorName: {
                type: String,
            },
            acteeName: {
                type: String,
                optional: true,
            },
            actionType: {
                type: String,
            },
            link: {
                type: String,
                regEx: SimpleSchema.RegEx.Url,
            },
        });
        check({
            actorName: actorName,
            acteeName: acteeName,
            actionType: actionType,
            link: link,
        }, createRecentActivityFunctionSchema);

        let actionText = "";
        if (actionType == RECENT_ACTIVITY_TYPES.like) {
            if (actorName != acteeName) {
                actionText = actorName + " liked " + acteeName + "'s post";
            }
            else {
                actionText = actorName + " liked a post";
            }
        }
        else if (actionType == RECENT_ACTIVITY_TYPES.comment) {
            if (actorName != acteeName) {
                actionText = actorName + " commented on " + acteeName + "'s post";
            }
            else {
                actionText = actorName + " commented on a post";
            }
        }
        else if (actionType == RECENT_ACTIVITY_TYPES.newPost) {
            actionText = actorName + " made a new post";
        }
        else if (actionType == RECENT_ACTIVITY_TYPES.newProject) {
            actionText = actorName + " added a new project";
        }
        else if (actionType == RECENT_ACTIVITY_TYPES.transactionComplete) {
            actionText = actorName + " exchanged their project with " + acteeName;
        }

        if (acteeName) {
            RecentActivity.insert({
                actorName: actorName,
                acteeName: acteeName,
                actionText: actionText,
                link: link,
                createdAt: new Date(),
            });
        }
        else {
            RecentActivity.insert({
                actorName: actorName,
                actionText: actionText,
                link: link,
                createdAt: new Date(),
            });
        }
    }
};

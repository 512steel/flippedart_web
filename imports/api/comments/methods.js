import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import { sanitizeHtml } from '../../ui/lib/general-helpers.js';

import { Comments } from './comments.js';
import { UserAttributes } from '../user-attributes/user-attributes.js';
import { updateRank } from '../user-attributes/methods.js';
import { UserPosts } from '../user-posts/user-posts.js';
import { decrementComments as userPostDecrementComments }
    from '../user-posts/methods.js';

import { createCommentNotification } from '../notifications/methods.js';

import { POINTS_SYSTEM } from '../../ui/lib/globals.js';


export const insert = new ValidatedMethod({
    name: 'comments.insert',
    validate: new SimpleSchema({
        userPostId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id
        },
        text: { type: String },
    }).validator(),
    run({ userPostId, text }) {
        if (this.userId) {
            console.log('in method comments.insert');

            text = sanitizeHtml(text);

            const user = Meteor.user();  //TODO: is this any more or less secure, server-side, than querying by this.userId?
            const userPost = UserPosts.findOne(userPostId);

            if (!userPost) {
                throw new Meteor.Error('comments.insert.invalid',
                    'You must comment on a valid post.');
            }
            if (!user) {
                throw new Meteor.Error('comments.insert.accessDenied',
                    'You must be signed in to do this.');
            }


            const comment = {
                userPostId: userPostId,
                text: text,
                userId: this.userId,
                author: user.username,
                createdAt: new Date(),
            };

            const newCommentId = Comments.insert(comment);

            UserPosts.update(userPostId,
                {
                    $inc: {
                        commentsCount: 1,
                        rank: POINTS_SYSTEM.UserPosts.comment,
                    }
                });

            //UserAttributes points system: do this after the fact
            const userAttributes = UserAttributes.findOne({userId: this.userId});

            if (userAttributes) {
                //Call the server-only method updateRank on UserAttributes, and remove points
                updateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.comment);
            }

            //TODO: create a Notification document for the post author, that someone commented on their post
            createCommentNotification(newCommentId, userPostId, user.username);
        }
        else {
            throw new Meteor.Error('comments.insert.accessDenied',
                'You need to be signed in to leave a comment.');
        }
    }
});

export const edit = new ValidatedMethod({
    name: 'comments.edit',
    validate: new SimpleSchema({
        commentId: { type: String, regEx: SimpleSchema.RegEx.Id },
        text: { type: String },
    }).validator(),
    run({ commentId, text }) {
        console.log('in method comments.edit');

        text = sanitizeHtml(text);

        const comment = Comments.findOne(commentId);

        if (!comment || !comment.editableBy(this.userId)) {
            /*
             NOTE: throwing a Meteor.Error will fail the client-side
             simulation, preventing the server-side Method from ever being run.
             So my hacky solution is to have a client-only editableBy(), which always
             returns true, and a server-only editableBy, which checks what it's
             supposed to.
             */

            throw new Meteor.Error('comments.edit.accessDenied',
                'You don\'t have permission to edit this comment.');
        }

        Comments.update(commentId,
            {
                $set: {
                    text: text
                }
            });
    }
});

export const deleteComment = new ValidatedMethod({
    name: 'comments.delete',
    validate: new SimpleSchema({
        commentId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id
        },
    }).validator(),
    run({ commentId }) {
        console.log('in method comments.delete');

        const comment = Comments.findOne(commentId);

        if (!comment || !comment.editableBy(this.userId)) {
            /*
             NOTE: throwing a Meteor.Error will fail the client-side
             simulation, preventing the server-side Method from ever being run.
             So my hacky solution is to have a client-only editableBy(), which always
             returns true, and a server-only editableBy, which checks what it's
             supposed to.
             */

            throw new Meteor.Error('comments.delete.accessDenied',
                'You don\'t have permission to delete this comment.');
        }

        Comments.remove(comment);

        userPostDecrementComments(comment.userPostId);

        //points system:
        const userAttributes = UserAttributes.findOne({userId: this.userId});
        if (userAttributes) {
            //Call the server-only method updateRank on UserAttributes, and remove points
            updateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.comment * -1);
        }
    }
});


// Get list of all method names on Comments
const COMMENTS_METHODS = _.pluck([
    insert,
    edit,
    deleteComment,
], 'name');

if (Meteor.isServer) {
    // Only allow 5 comment operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(COMMENTS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 1000);
}

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
                flaggers: [],
                flags: 0,
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

export const flag = new ValidatedMethod({
    name: 'comments.flag',
    validate: new SimpleSchema({
        commentId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ commentId }) {
        console.log('in method comments.flag');

        if (this.userId) {
            const flaggerName = Meteor.users.findOne(this.userId).username;

            var affected = Comments.update({
                    _id: commentId,
                    flaggers: {$ne: flaggerName}  //TODO: this works, but why is it "$ne" and not "$nin"?
                },
                {
                    $addToSet: {flaggers: flaggerName},
                    $inc: {flags: 1}
                });

            if (!affected) {
                throw new Meteor.Error('invalid', "You weren't able to flag that comment");
            }
            else {
                //TODO: import "throwError"/"throwWarning" methods from temporaryNotifications
                //throwWarning("You have flagged this comment as inappropriate.");
                console.log("You have flagged this comment as inappropriate.");
            }
        }
        else {
            //TODO: import "throwError"/"throwWarning"
            //throwError("You must be signed in to flag a comment.");
            console.log("You must be signed in to flag a comment.");
        }
    },
});

export const unflag = new ValidatedMethod({
    name: 'comments.unflag',
    validate: new SimpleSchema({
        commentId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ commentId }) {
        console.log('in method comments.unflag');

        if (this.userId) {
            const flaggerName = Meteor.users.findOne(this.userId).username;

            var affected = Comments.update({
                    _id: commentId,
                    flaggers: { $in: [flaggerName] },
                },
                {
                    $pull: {flaggers: flaggerName},
                    $inc: {flags: -1}
                });

            if (!affected) {
                console.log('[invalid] You weren\'t able to unflag that comment');

                //FIXME: what's the best error-throwing mechanism to use?  The below line, and for example
                //       the edit() method, will always throw an error during Meteor's client-side
                //       simulation of the Method, as flaggers (and in edit(), userId) is not made
                //       available to the client.  Console.logging is fine, but it clutters the console
                //       if someone were to look for it.
                //throw new Meteor.Error('invalid', "You weren't able to unflag that comment");
            }
        }
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
    flag,
    unflag,
    deleteComment,
], 'name');

if (Meteor.isServer) {
    // Only allow 1 comment operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(COMMENTS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 5000);
}

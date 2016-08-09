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
import { createRecentActivity } from './../recent-activity/methods.js';

import {
    POINTS_SYSTEM,
    COMMENT_EVENT_TYPES,
    RECENT_ACTIVITY_TYPES,
} from '../../ui/lib/globals.js';

import {
    throwError,
    throwWarning,
    throwSuccess } from '../../ui/lib/temporary-alerts.js';

import { sendCommentEventEmail } from './../email/email-senders.js';


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
            text = sanitizeHtml(text);

            const user = Meteor.users.findOne(this.userId);
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

            //UserAttributes points system: do this after the fact
            const userAttributes = UserAttributes.findOne({userId: this.userId});

            if (userAttributes) {
                //Call the server-only method updateRank on UserAttributes, and remove points
                updateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.comment);
            }

            createCommentNotification(newCommentId, userPostId, user.username);

            const link = "https://www.flippedart.org/" + userPost.author + "/posts/" + userPostId;
            createRecentActivity(user.username, userPost.author, RECENT_ACTIVITY_TYPES.comment, link)

            //Send email notifications to the user if their post has been commented on
            if (user.username != userPost.author) {
                if (userPost.commentsCount == 0) {
                    // send initial comment email
                    sendCommentEventEmail.call({
                        commenterName: user.username,
                        commenteeName: userPost.author,
                        userPostId: userPostId,
                        userPostText: userPost.text,
                        commentEventType: COMMENT_EVENT_TYPES.single
                    }, (err, res) => {
                        if (err) {
                            //TODO: error handling here
                            console.log('error sending the comment event email');
                            console.log(err);
                        }
                        else {
                            //success!
                        }
                    });
                }
                else if (userPost.commentsCount == 2) {  //TODO: this is set at 3 arbitrarily.  Basically, just so that the user doesn't get innundated with emails for every single comment.  We can make this more sophisticated if we start storing a "commenters" array in the UserPost documents.
                    // send multi-comments email
                    sendCommentEventEmail.call({
                        commenteeName: userPost.author,
                        userPostId: userPostId,
                        userPostText: userPost.text,
                        commentEventType: COMMENT_EVENT_TYPES.multiple
                    }, (err, res) => {
                        if (err) {
                            //TODO: error handling here
                            console.log('error sending the comment event email');
                            console.log(err);
                        }
                        else {
                            //success!
                        }
                    });
                }
            }

            UserPosts.update(userPostId,
                {
                    $inc: {
                        commentsCount: 1,
                        rank: POINTS_SYSTEM.UserPosts.comment,
                    }
                });
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
                    text: text,
                    lastUpdated: new Date()
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
                throwWarning("You have flagged this comment as inappropriate.");
            }
        }
        else {
            throwError("You must be signed in to flag a comment.");
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

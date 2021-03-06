import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';

import { UserPosts } from './user-posts.js';
import { UserAttributes } from '../user-attributes/user-attributes.js';
import { updateRank } from '../user-attributes/methods.js';

import { createRecentActivity } from './../recent-activity/methods.js';

import { sanitizeHtml, sanitizeHtmlNoReturns } from '../../ui/lib/general-helpers.js';

import {
    POINTS_SYSTEM,
    UPLOAD_LIMITS,
    RECENT_ACTIVITY_TYPES
} from '../../ui/lib/globals.js';

import {
    throwError,
    throwWarning } from '../../ui/lib/temporary-alerts.js';


export const insert = new ValidatedMethod({
    name: 'userPosts.insert',
    validate: new SimpleSchema({
        text: { type: String },
        tag: { type: String },
        imageLinks: {
            type: [String],
            //regEx: SimpleSchema.RegEx.Url,  //TODO: add this once Cloudinary is integrated
        },
    }).validator(),
    run({ text, tag, imageLinks }) {
        // using Meteor.user() seems untrustworthy.  This alternative isn't pretty but it's at least safe:
        var user = Meteor.users.findOne(this.userId);

        if (user) {

            text = sanitizeHtml(text);
            tag = sanitizeHtmlNoReturns(tag);

            //truncate the imageLinks array
            imageLinks = imageLinks.slice(0, UPLOAD_LIMITS.images);

            const userAttributes = UserAttributes.findOne({userId: this.userId});

            const userPost = {
                userId: this.userId,
                author: user.username,
                location: userAttributes ? userAttributes.location : ' ', //TODO - only add/show this if user's preference is to share location
                commentsCount: 0,
                voters: [],
                upvotes: 0,
                flaggers: [],
                flags: 0,
                rank: 0,
                text,
                imageLinks,
                tag,
                createdAt: new Date(),
            };

            const result = UserPosts.insert(userPost);

            const link = "https://www.flippedart.org/" + user.username + "/posts/" + result;
            createRecentActivity(user.username, null, RECENT_ACTIVITY_TYPES.newPost, link);

            //points system:
            if (userAttributes) {
                //Call the server-only method updateRank on UserAttributes
                updateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.post);
            }

            return result;
        }
        else {
            console.log("You need to be signed in to do this.");
        }
    },
});

export const edit = new ValidatedMethod({
    name: 'userPosts.edit',
    validate: new SimpleSchema({
        userPostId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
        text: { type: String },
        tag: { type: String },
        imageLinks: {
            type: [String],
            //regEx: SimpleSchema.RegEx.Url  //TODO
        },
    }).validator(),
    run({ userPostId, text, tag, imageLinks }) {
        text = sanitizeHtml(text);
        tag = sanitizeHtmlNoReturns(tag);

        const userPost = UserPosts.findOne(userPostId);

        if (!userPost || !userPost.editableBy(this.userId)) {
            /*
             NOTE: throwing a Meteor.Error will fail the client-side
             simulation, preventing the server-side Method from ever being run.
             So my hacky solution is to have a client-only editableBy(), which always
             returns true, and a server-only editableBy, which checks what it's
             supposed to.
            */

            throw new Meteor.Error('userPosts.edit.accessDenied',
                'You don\'t have permission to edit this post.');
        }

        if (imageLinks.length > 0 && imageLinks[0] == "none") {
            //If the client passed in "none" for image links, then keep the posts' previous images
            imageLinks = userPost.imageLinks;
        }

        UserPosts.update(userPostId,
            {
                //TODO: refer to exchangeItems.edit for allowing these fields to be optional.
                $set: {
                    text: text,
                    tag: tag,
                    imageLinks: imageLinks,
                    lastUpdated: new Date(),
                }
            });
    },
});

export const upvote = new ValidatedMethod({
    name: 'userPosts.upvote',
    validate: new SimpleSchema({
        userPostId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ userPostId }) {
        if (this.userId) {
            const voterName = Meteor.users.findOne(this.userId).username;

            var affected = UserPosts.update({
                    _id: userPostId,
                    voters: {$ne: voterName}  //TODO: this works, but why is it "$ne" and not "$nin"?
                },
                {
                    $addToSet: {voters: voterName},
                    $inc: {upvotes: 1, rank: POINTS_SYSTEM.UserPosts.upvote}
                });

            if (!affected) {
                throw new Meteor.Error('invalid', "You weren't able to upvote that post.");
            }
            else {
                const userPost = UserPosts.findOne(userPostId);

                if (userPost) {
                    const link = "https://www.flippedart.org/" + userPost.author + "/posts/" + userPostId;
                    createRecentActivity(voterName, userPost.author, RECENT_ACTIVITY_TYPES.like, link);
                }
            }
        }
    },
});

export const unUpvote = new ValidatedMethod({
    name: 'userPosts.unUpvote',
    validate: new SimpleSchema({
        userPostId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ userPostId }) {
        if (this.userId) {
            const voterName = Meteor.users.findOne(this.userId).username;

            var affected = UserPosts.update({
                    _id: userPostId,
                    voters: { $in: [voterName] }
                },
                {
                    $pull: {voters: voterName},
                    $inc: {upvotes: -1, rank: -1 * POINTS_SYSTEM.UserPosts.upvote}
                });

            if (!affected) {
                throw new Meteor.Error('invalid', "You weren't able to unUpvote that post.");
            }
        }
    },
});

export const flag = new ValidatedMethod({
    name: 'userPosts.flag',
    validate: new SimpleSchema({
        userPostId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ userPostId }) {
        if (this.userId) {
            const flaggerName = Meteor.users.findOne(this.userId).username;

            var affected = UserPosts.update({
                    _id: userPostId,
                    flaggers: {$ne: flaggerName}  //TODO: again, this works, but why is it "$ne" and not "$nin"?
                },
                {
                    $addToSet: {flaggers: flaggerName},
                    $inc: {flags: 1}
                });

            if (!affected) {
                throw new Meteor.Error('invalid', "You weren't able to flag that post");
            }
            else {
                throwWarning("You have flagged this post as inappropriate.");
            }
        }
        else {
            throwError("You must be signed in to flag a post.");
        }
    },
});

export const unflag = new ValidatedMethod({
    name: 'userPosts.unflag',
    validate: new SimpleSchema({
        userPostId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ userPostId }) {
        if (this.userId) {
            const flaggerName = Meteor.users.findOne(this.userId).username;

            var affected = UserPosts.update({
                    _id: userPostId,
                    flaggers: { $in: [flaggerName] },
                },
                {
                    $pull: {flaggers: flaggerName},
                    $inc: {flags: -1}
                });

            if (!affected) {
                console.log('[invalid] You weren\'t able to unflag that post');

                //FIXME: what's the best error-throwing mechanism to use?  The below line, and for example
                //       the edit() method, will always throw an error during Meteor's client-side
                //       simulation of the Method, as flaggers (and in edit(), userId) is not made
                //       available to the client.  Console.logging is fine, but it clutters the console
                //       if someone were to look for it.
                //throw new Meteor.Error('invalid', "You weren't able to unflag that post");
            }
        }
    }
});

export const deletePost = new ValidatedMethod({
    name: 'userPosts.deletePost',
    validate: new SimpleSchema({
        userPostId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ userPostId }) {
        const userPost = UserPosts.findOne(userPostId);

        if (!userPost || !userPost.editableBy(this.userId)) {
            /*
             NOTE: throwing a Meteor.Error will fail the client-side
             simulation, preventing the server-side Method from ever being run.
             So my hacky solution is to have a client-only editableBy(), which always
             returns true, and a server-only editableBy, which checks what it's
             supposed to.
             */

            throw new Meteor.Error('userPosts.delete.accessDenied',
                'You don\'t have permission to delete this post.');
        }

        UserPosts.remove(userPostId);

        //points system:
        const userAttributes = UserAttributes.findOne({userId: this.userId});
        if (userAttributes) {
            //Call the server-only method updateRank on UserAttributes, and remove points
            updateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.post * -1);
        }
    },
});

/*
 NOTE: this function, like UserAttributes' updateRank(), will only run properly when it
 is called by the server.  This ought to prevent fraudulent deletions from the client.
 */
export const decrementComments = (userPostId) => {

    const decrementCommentsFunctionSchema = new SimpleSchema({
        userPostId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        }
    });
    check({userPostId: userPostId}, decrementCommentsFunctionSchema);


    if (Meteor.isServer) {
        var affected = UserPosts.update(
            {
                _id: userPostId,
            },
            {
                $inc: {
                    commentsCount: -1,
                    rank: POINTS_SYSTEM.UserPosts.comment * -1,
                }
            }
        );

        if (!affected) {
            throw new Meteor.Error('invalid', "Comment count couldn't be decremented");
        }
    }
};


// Get list of all method names on UserPosts
const USERPOSTS_METHODS = _.pluck([
    insert,
    edit,
    upvote,
    unUpvote,
    flag,
    unflag,
    deletePost,
    //decrementComments,
], 'name');

if (Meteor.isServer) {
    // Only allow 2 userPost operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(USERPOSTS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 2500);
}

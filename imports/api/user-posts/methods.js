import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';

import { UserPosts } from './user-posts.js';
import { UserAttributes } from '../user-attributes/user-attributes.js';
import { updateRank } from '../user-attributes/methods.js';

export const insert = new ValidatedMethod({
    name: 'userPosts.insert',
    validate: new SimpleSchema({
        text: { type: String },
        tag: { type: String },
        imageLinks: { type: [String] },
    }).validator(),
    run({ text, tag, imageLinks }) {
        console.log('in method userPosts.insert');
        // using Meteor.user() seems untrustworthy.  This alternative isn't pretty but it's at least safe:
        var user = Meteor.users.findOne(this.userId);

        if (user) {
            //TODO: fix "sanitize" methods.
            //text = sanitizeString(text);
            //tag = sanitizeString(tag);

            //truncate and sanitize the imageLinks array
            imageLinks = imageLinks.slice(0, 4);
            /*
             for (var i = 0; i < userPostAttributes.imageLinks.length; i++) {
             userPostAttributes.imageLinks[i] = sanitizeLink(userPostAttributes.imageLinks[i]);
             }
             */

            const userAttributes = UserAttributes.findOne({userId: this.userId});

            const userPost = {
                userId: this.userId,
                author: user.username,
                location: userAttributes ? userAttributes.location : ' ', //TODO - only add/show this if user's preference is to share location
                //location: ' ',
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

            UserPosts.insert(userPost);

            console.log('points system?');
            console.log(userAttributes);
            //points system:
            if (userAttributes) {
                console.log('calling updateRank from userposts insert');

                //Call the server-only method updateRank on UserAttributes
                updateRankServer(userAttributes._id, 2);
            }
        }
        else {
            console.log("You need to be signed in to do this.");
        }
    },
});

export const edit = new ValidatedMethod({
    name: 'userPosts.edit',
    validate: new SimpleSchema({
        userPostId: { type: String },
        text: { type: String },
        tag: { type: String },
        imageLinks: { type: [String] },
    }).validator(),
    run({ userPostId, text, tag, imageLinks }) {
        console.log('in method userPosts.edit');

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

        UserPosts.update(userPostId,
            {
                $set: {
                    text: text,
                    tag: tag,
                    imageLinks: imageLinks,
                }
            }
        );
    },
});

export const upvote = new ValidatedMethod({
    name: 'userPosts.upvote',
    validate: new SimpleSchema({
        userPostId: { type: String },
    }).validator(),
    run({ userPostId }) {
        console.log('in method userPosts.upvote');
        if (this.userId) {
            var affected = UserPosts.update({
                    _id: userPostId,
                    voters: {$ne: this.userId}  //TODO: this works, but why is it "$ne" and not "$nin"?
                                                //ALSO: voters isn't a publicField, so why does not throw an error to the client like "unflag" and "edit"?
                },
                {
                    $addToSet: {voters: this.userId},
                    $inc: {upvotes: 1, rank: 2}
                });

            const userPost = UserPosts.findOne(userPostId);
            console.log(userPost);

            if (!affected) {
                throw new Meteor.Error('invalid', "You weren't able to upvote that post.");
            }
        }
    },
});

//TODO: add a method to "un-upvote", similar to "liking"/"unliking"


export const flag = new ValidatedMethod({
    name: 'userPosts.flag',
    validate: new SimpleSchema({
        userPostId: { type: String },
    }).validator(),
    run({ userPostId }) {
        console.log('in method userPosts.flag');
        if (this.userId) {
            var affected = UserPosts.update({
                    _id: userPostId,
                    flaggers: {$ne: this.userId}  //TODO: again, this works, but why is it "$ne" and not "$nin"?
                },
                {
                    $addToSet: {flaggers: this.userId},
                    $inc: {flags: 1}
                });

            const userPost = UserPosts.findOne(userPostId);
            console.log(userPost);

            if (!affected) {
                throw new Meteor.Error('invalid', "You weren't able to flag that post");
            }
            else {
                //TODO: import "throwError"/"throwWarning" methods from temporaryNotifications
                //throwWarning("You have flagged this post as inappropriate.");
                console.log("You have flagged this post as inappropriate.");
            }
        }
        else {
            //TODO: import "throwError"/"throwWarning"
            //throwError("You must be signed in to flag a post.");
            console.log("You must be signed in to flag a post.");
        }
    },
});

export const unflag = new ValidatedMethod({
    name: 'userPosts.unflag',
    validate: new SimpleSchema({
        userPostId: { type: String },
    }).validator(),
    run({ userPostId }) {
        console.log('in method userPosts.unflag');
        if (this.userId) {
            var affected = UserPosts.update({
                    _id: userPostId,
                    flaggers: { $in: [this.userId] },
                },
                {
                    $pull: {flaggers: this.userId},
                    $inc: {flags: -1}
                });

            const userPost = UserPosts.findOne(userPostId);
            console.log(userPost);
            console.log(this.userId);
            console.log(affected);

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

//FIXME: make this a server-only function a la UserAttributes' updateRank()
export const decrementComment = new ValidatedMethod({
    name: 'userPosts.decrementComment',
    validate: new SimpleSchema({
        userPostId: {type: String},
    }).validator(),
    run({ userPostId }) {
        console.log('in method userPosts.decrementComment');
        if (this.userId) {
            var affected = UserPosts.update(
                {
                    _id: userPostId,
                    //TODO: how do we prevent fraudulent deletions? (i.e. this should only be called when a comment is deleted.  Pass in Comment._id?)
                },
                {
                    $inc: {commentsCount: -1}
                }
            );

            if (!affected) {
                throw new Meteor.Error('invalid', "Comment count couldn't be decremented");
            }
        }
    }
});

//TODO: deletePost() ValidatedMethod


// Get list of all method names on UserPosts
const USERPOSTS_METHODS = _.pluck([
    insert,
    edit,
    upvote,
    flag,
    unflag,
    decrementComment,
    //TODO: deletePost
], 'name');

if (Meteor.isServer) {
    // Only allow 5 userPost operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(USERPOSTS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 1000);
}

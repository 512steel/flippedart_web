import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';

import { MakeProjects } from './make-projects.js';
import { UserAttributes } from '../user-attributes/user-attributes.js';
import { updateRank } from '../user-attributes/methods.js';

import { sanitizeHtml, sanitizeHtmlNoReturns } from '../../ui/lib/general-helpers.js';

import {
    POINTS_SYSTEM,
    UPLOAD_LIMITS,
} from '../../ui/lib/globals.js';

import {
    throwError,
    throwWarning } from '../../ui/lib/temporary-alerts.js';


export const insert = new ValidatedMethod({
    name: 'makeProjects.insert',
    validate: new SimpleSchema({
        makeProjectName: {
            type: String,
        },
        ingredients: {
            type: [String]
        },
        steps: {
            type: [Object],
            minCount: 1,
            maxCount: 50,
        },
        "steps.$.text": {
            type: String,
            max: 5000,
        },
        "steps.$.imageLinks": {
            type: [String],
            maxCount: UPLOAD_LIMITS.makeProjectStepImages,
        },
        coverImageLink: {
            type: String,
            optional: true,
        },
        //TODO: cap lengths etc. here
    }).validator(),
    run({ ingredients, steps, coverImageLink }) {
        let user = Meteor.users.findOne(this.userId);

        if (user) {

            //TODO: validate makeProjectName against forbidden names (for now, just "add")

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
                updateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.makeProjectAdd);
            }

            return result;
        }
        else {
            console.log("You need to be signed in to do this.");
        }
    },
});

export const edit = new ValidatedMethod({
    name: 'makeProjects.edit',
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

        //TODO: validate makeProjectName against forbidden names (for now, just "add")

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


export const approveMakeProject = new ValidatedMethod({
    name: 'makeProjects.approve',
    validate: new SimpleSchema({
        makeProjectId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ makeProjectId }) {

        // stuff

    },
});


export const deleteMakeProject = new ValidatedMethod({
    name: 'makeProjects.delete',
    validate: new SimpleSchema({
        makeProjectId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ makeProjectId }) {
        const userPost = UserPosts.findOne(makeProjectId);

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
            updateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.makeProjectAdd * -1);
        }
    },
});


// Get list of all method names on UserPosts
const MAKEPROJECTS_METHODS = _.pluck([
    insert,
    edit,
    approveMakeProject,
    deleteMakeProject,
], 'name');

if (Meteor.isServer) {
    // Only allow 2 userPost operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(MAKEPROJECTS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 2500);
}

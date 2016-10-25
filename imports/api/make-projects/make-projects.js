import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
import { Comments } from '../comments/comments.js';

import { UPLOAD_LIMITS } from './../../ui/lib/globals.js';

class MakeProjectsCollection extends Mongo.Collection {
    insert(makeProject, callback) {
        const ourProject = makeProject;
        ourProject.createdAt = ourProject.createdAt || new Date();
        return result = super.insert(ourProject, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
    remove(selector, callback) {

        //TODO: test this once these projects are "commentable"
        Comments.remove({ makeProjectId: selector });

        return result = super.remove(selector, callback);
    }
}

export const MakeProjects = new MakeProjectsCollection('MakeProjects');

// Deny all client-side updates since we will be using methods to manage this collection
MakeProjects.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});


//TODO: add a "rank" parameter, and sort MakeProjects according to their popularity in the publication.
/*
    MakeProject: {
        userId: String,
        author (name): String,
        makeProjectName: String,
        approved: Boolean,
        ingredients: [String],
        steps: [
            {
                text: String,
                imageLinks: [String]
            }
        ],
        coverImageLink: String,
        createdAt: Date,
        lastUpdated: Date
    }
*/
MakeProjects.schema = new SimpleSchema({
    userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    author: {
        type: String,
    },
    makeProjectName: {
        type: String,
    },
    approved: {
        type: Boolean,
    },
    ingredients: {
        type: [String],
        minCount: 1,
        maxCount: 100,
    },
    steps: {
        type: [Object],
        minCount: 1,
        maxCount: UPLOAD_LIMITS.makeProjectSteps,
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
    //TODO: validate length of all imageLinks

    createdAt: {
        type: Date,
        denyUpdate: true,
    },
    lastUpdated: {
        type: Date,
        optional: true,
    }
});

MakeProjects.attachSchema(MakeProjects.schema);

// This represents the keys from MakeProjects objects that should be published
// to the client. If we add secret properties to MakeProject objects, don't list
// them here to keep them private to the server.
MakeProjects.publicFields = {
    //userId: 1,
    author: 1,
    makeProjectName: 1,
    approved: 1,
    ingredients: 1,
    steps: 1,
    coverImageLink: 1,
    createdAt: 1,
    lastUpdated: 1,
};

//TODO: build testing factory here
Factory.define('makeProject', MakeProjects, {});


/*
 NOTE: we need the editableBy helper to run differently in the client and server, due to
 Meteor's Method simulations on the client (which don't touch the server if the client fails).
 */
MakeProjects.helpers({
    editableBy(userId) {

        //FIXME: this should also be admin-editable, regardless of the userId of the original poster.

        if (Meteor.isClient && Meteor.user()) {
            return true;
        }
        else if (Meteor.isServer && this.userId) {
            return this.userId === userId;
        }
        else {
            return false;
        }
    }
});

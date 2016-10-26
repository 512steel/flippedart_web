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
            max: 80,
        },
        ingredients: {
            type: String,
            max: 1000,
        },
        steps: {
            type: [Object],
            minCount: 1,
            maxCount: 50,
        },
        "steps.$.imageLinks": {
            type: [String],
            maxCount: UPLOAD_LIMITS.makeProjectStepImages,
        },
        "steps.$.text": {
            type: String,
            max: 5000,
        },
        coverImageLink: {
            type: String,
            optional: true,
        },
        //TODO: cap lengths etc. here
    }).validator(),
    run({ makeProjectName, ingredients, steps, coverImageLink }) {
        let user = Meteor.users.findOne(this.userId);

        if (user) {

            //sanitize inserted values
            makeProjectName = sanitizeHtmlNoReturns(makeProjectName);
            ingredients = sanitizeHtml(ingredients);
            steps.forEach(function(step, idx) {
                steps[idx].text = sanitizeHtml(steps[idx].text);
                steps[idx].imageLinks.forEach(function(link, idx2) {
                    steps[idx].imageLinks[idx2] = sanitizeHtmlNoReturns(steps[idx].imageLinks[idx2]);
                });
            });
            coverImageLink = sanitizeHtmlNoReturns(coverImageLink);


            // validate against all forbidden names (including all existing makeProject names, as well as "add")
            let allMakeProjectNames = MakeProjects.find({}, {
                fields: {
                    makeProjectName: 1,
                }
            }).fetch().map((el) => {
                return el.makeProjectName;
            });
            allMakeProjectNames.push('add');  //push all other potentially forbidden names here.)

            //TODO: also disallow special characters like slashes.

            if (_.contains(allMakeProjectNames, makeProjectName)) {
                throw new Meteor.Error('makeProject.insert.denied',
                    'Sorry, another project already exists with that name.');
            }

            const makeProject = {
                userId: this.userId,
                author: user.username,
                makeProjectName: makeProjectName,
                approved: false,
                approvedEdits: false,
                ingredients: ingredients,
                steps: steps,
                rank: 0,
                coverImageLink: coverImageLink,
                createdAt: new Date(),
            };

            const result = MakeProjects.insert(makeProject);

            const link = "https://www.flippedart.org/make/" + makeProjectName;
            //TODO: use this link to pass into an email sender to hello@flippedart.org for admin-approval.

            return result;
        }
        else {
            throw new Meteor.Error('makeProjects.insert.accessDenied',
                'You need to be signed in to do this.');
        }
    },
});

export const edit = new ValidatedMethod({
    name: 'makeProjects.edit',
    validate: new SimpleSchema({
        makeProjectId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
        makeProjectName: {
            type: String,
            max: 80,
        },
        ingredients: {
            type: String,
            max: 1000,
        },
        steps: {
            type: [Object],
            minCount: 1,
            maxCount: 50,
        },
        "steps.$.imageLinks": {
            type: [String],
            maxCount: UPLOAD_LIMITS.makeProjectStepImages,
        },
        "steps.$.text": {
            type: String,
            max: 5000,
        },
        coverImageLink: {
            type: String,
            optional: true,
        },
        //TODO: cap lengths etc. here
    }).validator(),
    run({ makeProjectId, makeProjectName, ingredients, steps, coverImageLink }) {

        let user = Meteor.users.findOne(this.userId);
        if (user) {
            //sanitize inserted values
            makeProjectId = sanitizeHtmlNoReturns(makeProjectId);
            makeProjectName = sanitizeHtmlNoReturns(makeProjectName);
            ingredients = sanitizeHtml(ingredients);
            steps.forEach(function(step, idx) {
                steps[idx].text = sanitizeHtml(steps[idx].text);
                steps[idx].imageLinks.forEach(function(link, idx2) {
                    steps[idx].imageLinks[idx2] = sanitizeHtmlNoReturns(steps[idx].imageLinks[idx2]);
                });
            });
            coverImageLink = sanitizeHtmlNoReturns(coverImageLink);


            // validate against all forbidden names (including all existing makeProject names, as well as "add")
            let allMakeProjectNames = MakeProjects.find({}, {
                fields: {
                    makeProjectName: 1,
                }
            }).fetch().map((el) => {
                return el.makeProjectName;
            });
            allMakeProjectNames.push('add');  //push all other potentially forbidden names here.)

            //TODO: also disallow special characters like slashes.

            if (_.contains(allMakeProjectNames, makeProjectName)) {
                throw new Meteor.Error('makeProject.insert.denied',
                    'Sorry, another project already exists with that name.');
            }

            MakeProjects.update(makeProjectId,
                {
                    //TODO: refer to exchangeItems.edit for allowing these fields to be optional.
                    $set: {
                        makeProjectName: makeProjectName,
                        ingredients: ingredients,
                        steps: steps,
                        coverImageLink: coverImageLink,
                        //approved: false,  //FIXME: use the "approvedEdits" flag to keep the old version active but before the new version is admin-approved.
                        lastUpdated: new Date(),
                    }
                });
        }
        else {
            throw new Meteor.Error('makeProjects.edit.accessDenied',
                'You need to be signed in to do this.');
        }
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

        if (Meteor.isServer && this.userId) {
            makeProjectId = sanitizeHtmlNoReturns(makeProjectId);

            const adminUser = Meteor.users.findOne(this.userId);
            if (_.contains(adminUser.roles, 'admin')) {
                const makeProject = MakeProjects.findOne(makeProjectId);

                if (!makeProject) {
                    throw new Meteor.Error('approval.denied',
                        'This makeProject doesn\'t exist');
                }
                else {
                    MakeProjects.update(makeProjectId,
                        {
                            $set: {
                                approved: !makeProject.approved  //Toggle the previous "approved" value
                            }
                        });

                    //TODO: upon approval, make a RecentActivity object and update the rank of the submitter's UserAttributes.
                    //TODO: points system
                    //TODO: send original author an email notifying them that their project has been approved.
                }
            }
        }
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
        const makeProject = MakeProjects.findOne(makeProjectId);

        if (!makeProject || !makeProject.editableBy(this.userId)) {
            // NOTE that makeProjects are editableBy admin users as well as the documents' original authors

            throw new Meteor.Error('makeProjects.delete.accessDenied',
                'You don\'t have permission to delete this project.');
        }

        MakeProjects.remove(makeProjectId);

        //TODO: points system
    },
});


// Get list of all method names on MakeProjects
const MAKEPROJECTS_METHODS = _.pluck([
    insert,
    edit,
    approveMakeProject,
    deleteMakeProject,
], 'name');

if (Meteor.isServer) {
    // Only allow 2 MakeProject operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(MAKEPROJECTS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 2500);
}

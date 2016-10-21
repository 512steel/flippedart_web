import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';
import { DocHead } from 'meteor/kadira:dochead';

import {
    UPLOAD_LIMITS,
    HEAD_DEFAULTS } from '../../lib/globals.js';

import {
    throwError,
    throwSuccess } from '../../lib/temporary-alerts.js';

import { MakeProjects } from '../../../api/make-projects/make-projects.js';
import {
    insert,
    edit,
    approveMakeProject,
    deleteMakeProject,
} from '../../../api/make-projects/methods.js';

import { Comments } from '../../../api/comments/comments.js';
import { UserAttributes } from '../../../api/user-attributes/user-attributes.js';

import './../../components/app-not-authorized.js';

import './make-projects-page.html';
import './make-project-card.html';
import './make-projects-list.html';
import './make-project-edit.html';
import './make-project-submit.html';

import './../photoTiles/photo-tiles-components.js';


//FIXME: could I just import ./../comments/comments-components.js' instead?  And do away with user-autocomplete-components?
import './../comments/comment-card.html';
import './../comments/comment_edit.html';
import './../comments/comment_submit.html';
import './../comments/comments-components.js';
import './../user-profile/user-autocomplete-components.html';


Template.make_projects_page.onCreated(function() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});

Template.make_project_card.onCreated(function() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});

Template.make_projects_list.onCreated(function() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});

Template.make_project_edit_page.onCreated(function() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});

Template.make_project_submit_page.onCreated(function() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});


Template.make_projects_page.onRendered(function() {

});

Template.make_project_card.onRendered(function() {

});

Template.make_projects_list.onRendered(function() {

});

Template.make_project_edit_page.onRendered(function() {

});

Template.make_project_submit_page.onRendered(function() {

});


Template.make_projects_page.helpers({

});

Template.make_project_card.helpers({

});

Template.make_projects_list.helpers({

});

Template.make_project_edit_page.helpers({

});

Template.make_project_submit_page.helpers({

});


Template.make_projects_page.events({

});

Template.make_project_card.events({

});

Template.make_projects_list.events({

});

Template.make_project_edit_page.events({

});

Template.make_project_submit_page.events({

});

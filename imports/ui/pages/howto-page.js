import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import { HEAD_DEFAULTS } from '../lib/globals.js';

import './howto-page.html';


Template.howto_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | How to use the site");
});

Template.howto_page.helpers({
    currentUsername: function() {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    }
});

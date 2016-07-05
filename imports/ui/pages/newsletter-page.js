import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import { HEAD_DEFAULTS } from '../lib/globals.js';

import './newsletter-page.html';


Template.newsletter_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | Newsletter");
});

//TODO: add email to SendGrid list
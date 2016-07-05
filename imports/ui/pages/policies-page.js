import { Template } from 'meteor/templating';
import { DocHead } from 'meteor/kadira:dochead';

import { HEAD_DEFAULTS } from '../lib/globals.js';

import './policies-page.html';


Template.policies_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | Policies");
});
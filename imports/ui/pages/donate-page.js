import { DocHead } from 'meteor/kadira:dochead';

import './donate-page.html';

import { HEAD_DEFAULTS } from '../lib/globals.js';


Template.donate_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | Support us");
});

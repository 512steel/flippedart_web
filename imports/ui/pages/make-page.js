import { DocHead } from 'meteor/kadira:dochead';

import './make-page.html';

import { HEAD_DEFAULTS } from '../lib/globals.js';


Template.make_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | Make stuff");
});

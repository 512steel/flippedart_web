import { DocHead } from 'meteor/kadira:dochead';

import './donate-page.html';

import { HEAD_DEFAULTS } from '../lib/globals.js';


Template.donate_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | Support us");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title + " | Support us"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/support"});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

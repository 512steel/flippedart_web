import { DocHead } from 'meteor/kadira:dochead';

import './make-page.html';

import { HEAD_DEFAULTS } from '../lib/globals.js';


Template.make_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | Make stuff");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title + " | Make stuff"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/make"});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

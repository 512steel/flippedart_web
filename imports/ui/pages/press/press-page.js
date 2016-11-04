import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import { HEAD_DEFAULTS } from './../../lib/globals.js';

import './press-page.html';


Template.press_page.onCreated(() => {
    DocHead.setTitle(HEAD_DEFAULTS.title_short + " | Press");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " | Press"});
    DocHead.addMeta({name: "og:description", content:  HEAD_DEFAULTS.description});
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/press"});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});


Template.press_page.onRendered(() => {

});


Template.press_page.helpers({

});
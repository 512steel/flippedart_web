import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import { HEAD_DEFAULTS } from './../lib/globals.js';

import './tiny-studio-page.html';


Template.tiny_studio_page.onCreated(() => {
    DocHead.setTitle(HEAD_DEFAULTS.title_short + " | Tiny Studio");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " | Tiny Studio"});
    DocHead.addMeta({name: "og:description", content: "The coolest mobile makerspace in town. " + HEAD_DEFAULTS.description_sans_des_moines});  //TODO: custom description here.
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/tiny-studio"});
    DocHead.addMeta({name: "og:image", content: "https://res.cloudinary.com/dwgim6or9/image/upload/v1/flippedart/cqfzvd3mu2oqp4pllnoz"});
    //DocHead.addMeta({name: "og:image:width", content: "1200"});
    //DocHead.addMeta({name: "og:image:height", content: "630"});
});


Template.tiny_studio_page.onRendered(() => {

});


Template.tiny_studio_page.helpers({

});
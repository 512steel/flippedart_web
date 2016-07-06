import { Template } from 'meteor/templating';
import { DocHead } from 'meteor/kadira:dochead';

import { HEAD_DEFAULTS } from '../lib/globals.js';

import './policies-page.html';


Template.policies_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | Policies");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title + " | Policies"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/policies"});
    DocHead.addMeta({name: "og:image", content: "http://res.cloudinary.com/dwgim6or9/image/upload/v1467765602/flippedart_og_image_3_qtkwew.png"});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});
import { DocHead } from 'meteor/kadira:dochead';

import './make-page.html';

import { HEAD_DEFAULTS } from '../lib/globals.js';


Template.make_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | Make stuff");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title + " | Make stuff"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/make"});
    DocHead.addMeta({name: "og:image", content: "http://res.cloudinary.com/dwgim6or9/image/upload/v1467765602/flippedart_og_image_3_qtkwew.png"});
});

import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { DocHead } from 'meteor/kadira:dochead';

import { HEAD_DEFAULTS } from './../../ui/lib/globals.js';


/*
 NOTE: these routes are accessible from the server to enable Fast Render.
*/


FlowRouter.triggers.enter([
    function() {
        DocHead.removeDocHeadAddedTags();
    }
]);

/* Static pages */
FlowRouter.route('/about', {
    subscriptions: function() {
        DocHead.setTitle(HEAD_DEFAULTS.title + " | About us");
        DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title + " | About us"});
        DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
        DocHead.addMeta({name: "og:type", content: "article"});
        DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/about"});
        DocHead.addMeta({name: "og:image", content: "http://res.cloudinary.com/dwgim6or9/image/upload/v1467765602/flippedart_og_image_3_qtkwew.png"});
    }
});

FlowRouter.route('/', {
    subscriptions: function() {
        this.register('myPost', Meteor.subscribe('userPosts.popular', 5));
        this.register('myPost', Meteor.subscribe('exchangeItems.popular', 6));
        this.register('myPost', Meteor.subscribe('userAttributes.popular', 12));

        DocHead.setTitle(HEAD_DEFAULTS.title + " | Home");
        DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title + " | Home"});
        DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
        DocHead.addMeta({name: "og:type", content: "website"});
        DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org"});
        DocHead.addMeta({name: "og:image", content: "http://res.cloudinary.com/dwgim6or9/image/upload/v1467765602/flippedart_og_image_3_qtkwew.png"});
    }
});

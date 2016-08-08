import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import { UserPosts } from '../../api/user-posts/user-posts.js';
import { ExchangeItems } from '../../api/exchange-items/exchange-items.js';
import { UserAttributes } from '../../api/user-attributes/user-attributes.js';

import { HEAD_DEFAULTS } from '../lib/globals.js';

import './home-page.html';


Template.home_page.onCreated(function() { // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userPosts.popular', 5);
        this.subscribe('exchangeItems.popular', 6);
        this.subscribe('userAttributes.popular', 12);
    });

    DocHead.setTitle(HEAD_DEFAULTS.title + " | Home");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title + " | Home"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
    DocHead.addMeta({name: "og:type", content: "website"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/about"});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

Template.home_page.onRendered(function() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            Meteor.setTimeout(function(){
                const el1 = new Foundation.Equalizer($('#home-equalized-1'));
                const el2 = new Foundation.Equalizer($('#home-equalized-2'));
                const el3 = new Foundation.Equalizer($('#home-equalized-3'));
                const el4 = new Foundation.Equalizer($('#home-equalized-4'));
                const el5 = new Foundation.Equalizer($('#home-equalized-5'));
                const el6 = new Foundation.Equalizer($('#home-equalized-6'));
                const el7 = new Foundation.Equalizer($('#home-equalized-7'));

                //const el8 = new Foundation.Reveal($('#newsletter-modal'));
            }, 50);
            Meteor.setTimeout(function(){
                const el1 = new Foundation.Equalizer($('#home-equalized-1'));
                const el2 = new Foundation.Equalizer($('#home-equalized-2'));
                const el3 = new Foundation.Equalizer($('#home-equalized-3'));
                const el4 = new Foundation.Equalizer($('#home-equalized-4'));
                const el5 = new Foundation.Equalizer($('#home-equalized-5'));
                const el6 = new Foundation.Equalizer($('#home-equalized-6'));
                const el7 = new Foundation.Equalizer($('#home-equalized-7'));

                //const el8 = new Foundation.Reveal($('#newsletter-modal'));
            }, 200);
            Meteor.setTimeout(function(){
                const el1 = new Foundation.Equalizer($('#home-equalized-1'));
                const el2 = new Foundation.Equalizer($('#home-equalized-2'));
                const el3 = new Foundation.Equalizer($('#home-equalized-3'));
                const el4 = new Foundation.Equalizer($('#home-equalized-4'));
                const el5 = new Foundation.Equalizer($('#home-equalized-5'));
                const el6 = new Foundation.Equalizer($('#home-equalized-6'));
                const el7 = new Foundation.Equalizer($('#home-equalized-7'));

                //const el8 = new Foundation.Reveal($('#newsletter-modal'));
            }, 1000);
            Meteor.setInterval(function(){
                const el1 = new Foundation.Equalizer($('#home-equalized-1'));
                const el2 = new Foundation.Equalizer($('#home-equalized-2'));
                const el3 = new Foundation.Equalizer($('#home-equalized-3'));
                const el4 = new Foundation.Equalizer($('#home-equalized-4'));
                const el5 = new Foundation.Equalizer($('#home-equalized-5'));
                const el6 = new Foundation.Equalizer($('#home-equalized-6'));
                const el7 = new Foundation.Equalizer($('#home-equalized-7'));

                //const el8 = new Foundation.Reveal($('#newsletter-modal'));
            }, 1500);
        }
    });

    Meteor.setTimeout(function(){
        if (FlowRouter.getQueryParam("explore")) {
            //TODO: re-activate this once there is more activity on the site.
            //$('body, html').animate({scrollTop: $('#home-page-explore').offset().top}, 500);
        }
    }, 750);
});

Template.home_page.onDestroyed(function() {
});

Template.home_page.helpers({
    currentUsername: function() {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    },
    topUserPosts: function() {
        return UserPosts.find({});
    },
    topProjects: function() {
        return ExchangeItems.find({});
    },
    topUserAttributes: function() {
        //FIXME: this is giving odd results on the client.
        return UserAttributes.find({rank:{$gt:0}},{sort:{rank:-1}});
    }
});

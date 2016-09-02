import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import { UserPosts } from '../../api/user-posts/user-posts.js';
import { ExchangeItems } from '../../api/exchange-items/exchange-items.js';
import { UserAttributes } from '../../api/user-attributes/user-attributes.js';
import { RecentActivity } from '../../api/recent-activity/recent-activity.js';

import { HEAD_DEFAULTS } from '../lib/globals.js';

import './home-page.html';


Template.home_page.onCreated(function() { // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userPosts.popular', 5);
        this.subscribe('exchangeItems.popular', 6);
        this.subscribe('userAttributes.popular', 12);

        this.subscribe('recentActivity.feed');
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
        let el1 = new Foundation.Equalizer($('#home-equalized-1'));
        let el2 = new Foundation.Equalizer($('#home-equalized-2'));
        let el3 = new Foundation.Equalizer($('#home-equalized-3'));
        let el4 = new Foundation.Equalizer($('#home-equalized-4'));
        let el5 = new Foundation.Equalizer($('#home-equalized-5'));
        let el6 = new Foundation.Equalizer($('#home-equalized-6'));
        let el7 = new Foundation.Equalizer($('#home-equalized-7'));
        let el8 = new Foundation.Equalizer($('#home-equalized-8'));
        let el9 = new Foundation.Equalizer($('#home-equalized-9'));
        if (this.subscriptionsReady()) {
            Meteor.setTimeout(function(){
                el1 = new Foundation.Equalizer($('#home-equalized-1'));
                el2 = new Foundation.Equalizer($('#home-equalized-2'));
                el3 = new Foundation.Equalizer($('#home-equalized-3'));
                el4 = new Foundation.Equalizer($('#home-equalized-4'));
                el5 = new Foundation.Equalizer($('#home-equalized-5'));
                el6 = new Foundation.Equalizer($('#home-equalized-6'));
                el7 = new Foundation.Equalizer($('#home-equalized-7'));
                el8 = new Foundation.Equalizer($('#home-equalized-8'));
                el9 = new Foundation.Equalizer($('#home-equalized-9'));

                //const el8 = new Foundation.Reveal($('#newsletter-modal'));
            }, 50);
            Meteor.setTimeout(function(){
                el1 = new Foundation.Equalizer($('#home-equalized-1'));
                el2 = new Foundation.Equalizer($('#home-equalized-2'));
                el3 = new Foundation.Equalizer($('#home-equalized-3'));
                el4 = new Foundation.Equalizer($('#home-equalized-4'));
                el5 = new Foundation.Equalizer($('#home-equalized-5'));
                el6 = new Foundation.Equalizer($('#home-equalized-6'));
                el7 = new Foundation.Equalizer($('#home-equalized-7'));
                el8 = new Foundation.Equalizer($('#home-equalized-8'));
                el9 = new Foundation.Equalizer($('#home-equalized-9'));

                //const el8 = new Foundation.Reveal($('#newsletter-modal'));
            }, 200);
            Meteor.setTimeout(function(){
                el1 = new Foundation.Equalizer($('#home-equalized-1'));
                el2 = new Foundation.Equalizer($('#home-equalized-2'));
                el3 = new Foundation.Equalizer($('#home-equalized-3'));
                el4 = new Foundation.Equalizer($('#home-equalized-4'));
                el5 = new Foundation.Equalizer($('#home-equalized-5'));
                el6 = new Foundation.Equalizer($('#home-equalized-6'));
                el7 = new Foundation.Equalizer($('#home-equalized-7'));
                el8 = new Foundation.Equalizer($('#home-equalized-8'));
                el9 = new Foundation.Equalizer($('#home-equalized-9'));

                //const el8 = new Foundation.Reveal($('#newsletter-modal'));
            }, 1000);
            Meteor.setInterval(function(){
                el1 = new Foundation.Equalizer($('#home-equalized-1'));
                el2 = new Foundation.Equalizer($('#home-equalized-2'));
                el3 = new Foundation.Equalizer($('#home-equalized-3'));
                el4 = new Foundation.Equalizer($('#home-equalized-4'));
                el5 = new Foundation.Equalizer($('#home-equalized-5'));
                el6 = new Foundation.Equalizer($('#home-equalized-6'));
                el7 = new Foundation.Equalizer($('#home-equalized-7'));
                el8 = new Foundation.Equalizer($('#home-equalized-8'));
                el9 = new Foundation.Equalizer($('#home-equalized-9'));

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

    $(window).resize(_.debounce(() => {
        //...
    }, 100));
    $(window).resize();
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
    },
    recentActivityItems: function() {
        return RecentActivity.find({}, {sort: {createdAt: -1}});
    },
});

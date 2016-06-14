import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { UserPosts } from '../../api/user-posts/user-posts.js';
import { ExchangeItems } from '../../api/exchange-items/exchange-items.js';

import './home-page.html';


Template.home_page.onCreated(function() {// Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userPosts.popular', 5);
        this.subscribe('exchangeItems.popular', 6);
    });
});

Template.home_page.onRendered(function() {

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
        if (FlowRouter.getQueryParam("explore")) {
            $('body, html').animate({scrollTop: $('#home-page-explore').offset().top}, 600);
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
    }
});

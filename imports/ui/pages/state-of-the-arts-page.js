import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import { Comments } from './../../api/comments/comments.js';

import { HEAD_DEFAULTS } from '../lib/globals.js';

import './state-of-the-arts-page.html';

import './../components/comments/comment-card.html';
import './../components/comments/comment_edit.html';
import './../components/comments/comment_submit.html';
import './../components/comments/comments-components.js';


Template.state_of_the_arts_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title_short + " | State of the Arts");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " | State of the Arts"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});  //TODO: custom description here.
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/state-of-the-arts"});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.skyline_image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});

    this.getPageName = () => {
        return 'state-of-the-arts';
    };

    this.commentsSubscription = null;
    this.autorun(() => {
        // Subscriptions go in here
        this.commentsSubscription = Meteor.subscribeWithPagination('comments.commentablePage', this.getPageName(), {sort: {createdAt: 1}}, 15);
    });
});

Template.state_of_the_arts_page.helpers({
    comments: () => {
        console.log(Template.instance().getPageName());
        return Comments.find({pageName: Template.instance().getPageName()});
    },
    pageName: () => {
        return Template.instance().getPageName();
    }
});

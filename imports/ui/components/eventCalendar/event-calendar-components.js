import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import {
    HEAD_DEFAULTS,
} from '../../lib/globals.js';

import './event-calendar-page.html';
import './event-calendar-listing.html';
import './event-calendar-edit.html';
import './event-calendar-submit.html';


Template.event_calendar_page.onCreated(() => {
    DocHead.setTitle(HEAD_DEFAULTS.title_short + " | Calendar");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " | Calendar"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});  //TODO: custom description here.
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/calendar"});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

Template.event_calendar_listing.onCreated(() => {
    DocHead.setTitle(HEAD_DEFAULTS.title_short + " | Event");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " | Event"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});  //TODO: custom description here.
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/calendar"});  //FIXME: use flowRouter to get current event slug
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});


Template.event_calendar.onCreated(() => {

});


Template.event_calendar.onRendered(() => {

});


Template.event_calendar_page.helpers({

});


Template.event_calendar_page.events({

});

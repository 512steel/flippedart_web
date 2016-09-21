import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';
import { DocHead } from 'meteor/kadira:dochead';

import {
    HEAD_DEFAULTS,
} from '../../lib/globals.js';

import './event-calendar-page.html';
import './event-calendar-edit.html';
import './event-calendar-submit.html';
import './event-calendar-single-event.html';
import './event-calendar-single-date.html';


Template.event_calendar_page.onCreated(function() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });

    DocHead.setTitle(HEAD_DEFAULTS.title_short + " | Calendar");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " | Calendar"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});  //TODO: custom description here.
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/calendar"});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

Template.event_calendar_single_date_page.onCreated(function() {
    this.getCalendarDate = () => FlowRouter.getParam('MMDDYY');
    this.getCalendarDateString = () => moment(this.getCalendarDate(), "MM-DD-YY").format("MMM Do, YYYY");

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });

    DocHead.setTitle(HEAD_DEFAULTS.title_short + " | Events for " + this.getCalendarDateString());
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " | Events for " + this.getCalendarDateString()});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});  //TODO: custom description here.
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/calendar/" + this.getCalendarDate()});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

Template.event_calendar_single_event_page.onCreated(function() {
    this.getCalendarDate = () => FlowRouter.getParam('MMDDYY');
    this.getCalendarDateString = () => moment(this.getCalendarDate(), "MM-DD-YY").format("MMM Do, YYYY");
    this.getEventName = () => FlowRouter.getParam('eventName');

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });

    DocHead.setTitle(HEAD_DEFAULTS.title_short + " | " + this.getEventName() + " | Events");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " | " + this.getEventName() + " | Events"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});  //TODO: custom description here.
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/calendar/" + this.getCalendarDate() + "/" + this.getEventName()});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});  //FIXME: change this to the event cover image, if there is one.
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});


Template.event_calendar_page.helpers({

});

Template.event_calendar_single_date_page.helpers({
    eventDateString: () => {
        return Template.instance().getCalendarDateString();
    }
    //TODO: return subbed event objects
});

Template.event_calendar_single_event_page.helpers({
    eventName: () => {
        return Template.instance().getEventName();
    }
    //TODO: return subbed event object
});


Template.event_calendar_page.events({

});

Template.event_calendar_single_date_page.events({

});

Template.event_calendar_single_event_page.events({

});

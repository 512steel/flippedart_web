import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';
import { DocHead } from 'meteor/kadira:dochead';

import {
    HEAD_DEFAULTS,
} from '../../lib/globals.js';

import {
    throwError,
    throwSuccess } from '../../lib/temporary-alerts.js';

import { CalendarEvents } from '../../../api/calendar-events/calendar-events.js';
import {
    insert,
    edit,
    deleteCalendarEvent
} from '../../../api/calendar-events/methods.js';

import './event-calendar-page.html';
import './event-calendar-add-page.html';
import './event-calendar-edit.html';
import './event-calendar-submit.html';
import './event-calendar-single-event.html';
import './event-calendar-single-date.html';
import './event-calendar-single-event-small.html';


Template.event_calendar_page.onCreated(function() {

    // Subscriptions go in here
    this.autorun(() => {
        //FIXME: pull currently-selected month and year
        this.subscribe('calendarEvents.upcoming', 10);  //TODO: page events

        if (FlowRouter.getRouteName() == 'eventCalendar.past') {
            this.subscribe('calendarEvents.past', 10);  //TODO: page events

            Session.set('isPastSelected', true);
        }
        else {
            Session.set('isPastSelected', false);
        }
    });

    let currentDate = new Date();
    this.getUpcomingCalendarEvents = () => {
        return CalendarEvents.find(
            {
                eventDateFormatted: {
                    $gte: currentDate
                }
            },
            {
                sort: {
                    eventDateFormatted: 1
                    //FIXME: sort by start times secondarily
                },
            });
    };
    this.getPastCalendarEvents = () => {
        return CalendarEvents.find(
            {
                eventDateFormatted: {
                    $lt: currentDate
                }
            },
            {
                sort: {
                    eventDateFormatted: -1
                    //FIXME: sort by start times secondarily
                },
            });
    };

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

    this.getYesterdayMMDDYY = () => moment(this.getCalendarDate(), 'MM-DD-YY').subtract(1, 'days').format('MM-DD-YY');
    this.getYesterdayDateString = () => moment(this.getYesterdayMMDDYY(), "MM-DD-YY").format("MMM Do");
    this.getTomorrowMMDDYY = () => moment(this.getCalendarDate(), 'MM-DD-YY').add(1, 'days').format('MM-DD-YY');
    this.getTomorrowDateString = () => moment(this.getTomorrowMMDDYY(), "MM-DD-YY").format("MMM Do");

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('calendarEvents.date', this.getCalendarDate());
    });

    this.getDailyCalendarEvents = () => {
        return CalendarEvents.find({});
    };

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
    this.getNameSlug = () => FlowRouter.getParam('nameSlug');
    this.getCurrentEvent = () => {
        return CalendarEvents.findOne({});
    };


    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('calendarEvents.single', this.getCalendarDate(), this.getEventName(), this.getNameSlug())

        //Re-run DocHead call after the event is loaded
        let currentEvent = this.getCurrentEvent();
        if (currentEvent) {
            DocHead.removeDocHeadAddedTags();

            DocHead.setTitle(HEAD_DEFAULTS.title_short + " Events | " + this.getEventName());
            DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " Events | " + this.getEventName()});
            DocHead.addMeta({name: "og:description", content: currentEvent.description + " | " + HEAD_DEFAULTS.description});  //TODO: custom description here.
            DocHead.addMeta({name: "og:type", content: "article"});
            DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/calendar/" + this.getCalendarDate() + "/" + this.getEventName() + "/" + this.getNameSlug()});
            DocHead.addMeta({name: "og:image", content: currentEvent.imageLink ? Cloudinary._helpers.url(currentEvent.imageLink, {'secure':true}) : HEAD_DEFAULTS.image});  //NOTE: this is the only major change in DocHead
            DocHead.addMeta({name: "og:image:width", content: "1200"});
            DocHead.addMeta({name: "og:image:height", content: "630"});
        }
    });

    DocHead.setTitle(HEAD_DEFAULTS.title_short + " Events | " + this.getEventName());
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " Events | " + this.getEventName()});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});  //TODO: custom description here.
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/calendar/" + this.getCalendarDate() + "/" + this.getEventName() + "/" + this.getNameSlug()});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

Template.event_calendar_single_event_edit.onCreated(function() {
    this.getCalendarDate = () => FlowRouter.getParam('MMDDYY');
    //this.getCalendarDateString = () => moment(this.getCalendarDate(), "MM-DD-YY").format("MMM Do, YYYY");
    this.getEventName = () => FlowRouter.getParam('eventName');
    this.getNameSlug = () => FlowRouter.getParam('nameSlug');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('calendarEvents.single', this.getCalendarDate(), this.getEventName(), this.getNameSlug())
    });

    this.getCurrentEvent = () => {
        return CalendarEvents.findOne({});
    };

    Session.set('isEventUploading', false);

    DocHead.setTitle(HEAD_DEFAULTS.title_short + " | " + this.getEventName() + " | Edit Event");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " | " + this.getEventName() + " | Edit Event"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});  //TODO: custom description here.
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/calendar/" + this.getCalendarDate() + "/" + this.getEventName() + "/" + this.getNameSlug() + "/edit"});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});  //FIXME: change this to the event cover image, if there is one.
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

Template.event_calendar_submit.onCreated(function userPostSubmitOnCreated() {
    Session.set('isEventUploading', false);

    // Subscriptions go in here
    this.autorun(() => {

    });
});


Template.event_calendar_page.onRendered(function() {
    autosize($('textarea'));
});

Template.event_calendar_single_date_page.onRendered(function() {

});

Template.event_calendar_single_event_page.onRendered(function() {

});

Template.event_calendar_single_event_edit.onRendered(function() {
    var Pikaday = require('pikaday');
    var picker = new Pikaday({
        field: document.getElementById('datepicker-edit-event'),
        format: 'MM-DD-YY'
    });

    Meteor.setTimeout(function() {  //DOM doesn't render immediately.  This whole jquery plugin workflow is unintuitive...
        var timepicker = require('./../../../../node_modules/jquery-timepicker/jquery.timepicker.js');  // wtf.
        $('#startTime').timepicker({
            timeFormat: 'hh:mm p',
            interval: 30,
            minTime: '12:00am',  //FIXME: times loop around to the back when a new one is selected
            maxTime: '11:30pm',
            dropdown: true,
            scrollbar: true,
            change: function(time) {
                //...
            }
        });
        $('#endTime').timepicker({
            timeFormat: 'hh:mm p',
            interval: 30,
            minTime: '12:00am',  //FIXME: times loop around to the back when a new one is selected
            maxTime: '11:30pm',
            dropdown: true,
            scrollbar: true,
            change: function(time) {
                //...
            }
        });
    }, 500);
});

Template.event_calendar_submit.onRendered(function() {
    this.accordion = new Foundation.Accordion($('.accordion'));  //FIXME: this works here, but would make mroe semantic sense in each of calendar_event_submit's containing templates.

    var Pikaday = require('pikaday');
    var picker = new Pikaday({
        field: document.getElementById('datepicker'),
        format: 'MM-DD-YY'
    });

    Meteor.setTimeout(function() {  //DOM doesn't render immediately.  This whole jquery plugin workflow is unintuitive...
        var timepicker = require('./../../../../node_modules/jquery-timepicker/jquery.timepicker.js');  // wtf.
        $('#startTime').timepicker({
            timeFormat: 'hh:mm p',
            interval: 30,  //FIXME: times loop around to the back when a new one is selected
            dynamic: true,
            dropdown: true,
            scrollbar: true,
            change: function(time) {
                //...
            }
        });
        $('#endTime').timepicker({
            timeFormat: 'hh:mm p',
            interval: 30,  //FIXME: times loop around to the back when a new one is selected
            dynamic: true,
            dropdown: true,
            scrollbar: true,
            change: function(time) {
                //...
            }
        });
    }, 500);
});


Template.event_calendar_page.helpers({
    upcomingCalendarEvents: () => {
        return Template.instance().getUpcomingCalendarEvents();
    },
    pastCalendarEvents: () => {
        return Template.instance().getPastCalendarEvents();
    },

    isPastSelected: () => {
        return Session.get('isPastSelected');
    },

    //NOTE: these are relics from the old calendar, but will be useful once I add date-headers to the calendarEvents lists
    equalsDate: (mmddyy, dd) => {
        //remove potential hyphens in the date first
        let newDate = mmddyy.toString().replace(/\-+/g, '');
        let validDate = /^\d{6}$/.test(newDate);
        if (validDate) {
            return dd == newDate.slice(2,4);
        }
    },
    dayToFormatted: (dd) => {
        let month = Session.get('currentCalendarMonth');
        return moment(month + '-' + dd).format('MMM Do');
    },
    dayToMMDDYY: (day) => {
        //NOTE: this is for linking to individual days given the day of the month (design needed to see if this is even necessary)
        day = day < 10 ? '0' + day : day.toString();

        let currentMonth = Session.get('currentCalendarMonth');
        currentMonth = currentMonth < 10 ? '0' + currentMonth : currentMonth.toString();

        let currentYear = Session.get('currentCalendarYear');
        currentYear = currentYear < 10 ? '0' + currentYear : currentYear.toString();

        return currentMonth + day + currentYear;
    }
});

Template.event_calendar_single_date_page.helpers({
    eventDateString: () => {
        return Template.instance().getCalendarDateString();
    },
    events: () => {
        return Template.instance().getDailyCalendarEvents();
    },
    yesterdayMMDDYY: () => {
        return Template.instance().getYesterdayMMDDYY();
    },
    yesterdayDateString: () => {
        return Template.instance().getYesterdayDateString();
    },
    tomorrowMMDDYY: () => {
        return Template.instance().getTomorrowMMDDYY();
    },
    tomorrowDateString: () => {
        return Template.instance().getTomorrowDateString();
    }
});

Template.event_calendar_single_event_page.helpers({
    eventName: () => {
        return Template.instance().getEventName();
    },
    eventDateString: () => {
        return Template.instance().getCalendarDateString();
    },
    event: () => {
        return Template.instance().getCurrentEvent();
    },
    ownEvent: function () {
        let currentEvent = Template.instance().getCurrentEvent();

        if (Meteor.user() && currentEvent && Meteor.user().username == Template.instance().getCurrentEvent().authorName) {
            return true;
        }
        else return false;
    },
    relativeTimeCopy: function(event) {
        if (event) {
            let newDate = event.eventDate.toString().replace(/\-+/g, '');
            let validDate = /^\d{6}$/.test(newDate);
            if (validDate) {
                //TODO: also validate startTime/endTime with regex?

                let eventMomentStart = moment(newDate + " " + event.startTime, "MMDDYY hh:mm a");
                let eventMomentEnd = moment(newDate + " " + event.endTime, "MMDDYY hh:mm a");
                let nowMoment = moment();

                let startDiff = nowMoment.diff(eventMomentStart);
                let endDiff = nowMoment.diff(eventMomentEnd);
                if (startDiff <= 0) {
                    //happening soon
                    return 'This event is happening ' + eventMomentStart.from(nowMoment) + '.';
                }
                else if (startDiff > 0 && endDiff < 0) {
                    //happening now
                    return 'This event is happening now.';
                }
                else if (endDiff >= 0) {
                    //already happened
                    return 'This event happened ' + eventMomentStart.from(nowMoment) + '.';
                }
            }
        }
    }
});

Template.event_calendar_single_event_edit.helpers({
    event: () => {
        return Template.instance().getCurrentEvent();
    },
    ownEvent: function () {
        let currentEvent = Template.instance().getCurrentEvent();

        if (Meteor.user() && currentEvent && Meteor.user().username == Template.instance().getCurrentEvent().authorName) {
            return true;
        }
        else return false;
    },
    isUploading: function () {
        return Session.get('isEventUploading');
    },
    uploadingCopy: function () {
        let tempPercentTotal = 0;
        if (Cloudinary.collection.findOne()) {
            let count = Cloudinary.collection.find().count();

            Cloudinary.collection.find().forEach((file) => {
                tempPercentTotal += file.percent_uploaded;
            });
            tempPercentTotal = Math.round(tempPercentTotal/count);

            return Number.isNaN(tempPercentTotal) ? "Uploading..." : "Uploading: " + tempPercentTotal + "%";
        }
        else return "Uploading...";
    },
});

Template.event_calendar_submit.helpers({
    isUploading: function () {
        return Session.get('isEventUploading');
    },
    uploadingCopy: function () {
        let tempPercentTotal = 0;
        if (Cloudinary.collection.findOne()) {
            let count = Cloudinary.collection.find().count();

            Cloudinary.collection.find().forEach((file) => {
                tempPercentTotal += file.percent_uploaded;
            });
            tempPercentTotal = Math.round(tempPercentTotal/count);

            return Number.isNaN(tempPercentTotal) ? "Uploading..." : "Uploading: " + tempPercentTotal + "%";
        }
        else return "Uploading...";
    },
});


Template.event_calendar_page.events({

});

Template.event_calendar_single_date_page.events({

});

Template.event_calendar_single_event_page.events({
    'click .share-event-facebook': function (e) {
        e.preventDefault();
        const currentEvent = Template.instance().getCurrentEvent();
        const shareUrl = 'https://www.flippedart.org/calendar/' + currentEvent.eventDate + '/' + currentEvent.eventName + '/' + currentEvent.nameSlug;

        FB.ui({
            method: 'share',
            href: shareUrl,
            mobile_iframe: true
        }, function (response) {
        });
    },
    'click .calendar-event-delete-button': function(e) {
        e.preventDefault();

        if (confirm("Are you sure you want to delete this event?")) {
            deleteCalendarEvent.call({
                eventId: Template.instance().getCurrentEvent()._id
            }, (err, res) => {
                if (err) {
                    throwError(err.reason);
                }
                else {
                    FlowRouter.go('eventCalendar.upcoming');
                }

            });
        }
    }
});

Template.event_calendar_single_event_edit.events({
    'submit form.calendar-event-edit': function(e) {
        e.preventDefault();

        if (!Meteor.user()) {
            throwError("You must be signed in to edit an event.");
        }

        let currentEvent = CalendarEvents.findOne({});

        if (currentEvent) {
            var imageLinks = [];

            $(".calendar-event-edit input[type='file']").each(function () {
                var files = this.files;

                for (var i = 0; i < files.length; i++) {
                    if (files[i].size > 6000000) {
                        throwError("Sorry, your image is bigger than the 6MB upload limit");
                        return;
                    }
                }

                if (files.length > 1) {  //NOTE: for now, just allow one photo per event (open to changing this, though).
                    throwError("Sorry, you are trying to upload " + files.length.toString() + " images.  The maximum you can upload is " + 1 + ".");
                }
                else if (files.length > 0) {
                    //user is uploading an image
                    Session.set('isEventUploading', true);

                    var fileIndex = 0;
                    Cloudinary.upload(files, {
                        folder: "flippedart",
                        upload_preset: "limitsize"
                    }, function (error, result) {
                        if (error) {
                            throwError(error.reason);
                        }

                        //FIXME - since Cloudinary.upload() is asynchronous there's no way to check if there's an error before submitting the userPost and it will likely hang on `null.public_id`

                        imageLinks.push(result.public_id);

                        fileIndex++;  //hack to only insert the post after all photos are uploaded

                        if (fileIndex >= files.length) {

                            let eventName = $(e.target).find('[name=calendarEventName]').val();
                            let eventDate = $(e.target).find('[name=calendarEventDate]').val();

                            edit.call({
                                eventId: currentEvent._id,
                                eventName: eventName,
                                eventDate: eventDate,
                                startTime: $(e.target).find('[name=calendarEventStartTime]').val(),
                                endTime: $(e.target).find('[name=calendarEventEndTime]').val(),
                                description: $(e.target).find('[name=calendarEventDescription]').val(),
                                location: $(e.target).find('[name=calendarEventLocation]').val(),
                                imageLink: imageLinks[0],  //NOTE: only using one photo per calendar event, for now
                            }, (err, res) => {
                                if (err) {
                                    throwError(err.reason);
                                    Session.set('isEventUploading', false);
                                }
                                else {
                                    Session.set('isEventUploading', false);

                                    FlowRouter.go('eventCalendar.singleEvent',
                                        {MMDDYY: res.newDate, eventName: res.newName, nameSlug: res.newSlug}
                                    );

                                    //FIXME: this currently doesn't work, i.e. accomplish the goal of being able to click the back button after changing the event name or date and go to the new event's URL's edit page.
                                    /*
                                    FlowRouter.withReplaceState(function() {
                                        FlowRouter.setParams({MMDDYY: res.newDate, eventName: res.newName, nameSlug: res.newSlug});
                                    });
                                    */
                                }
                            });
                        }
                    });
                }
                else {
                    //no images

                    let eventName = $(e.target).find('[name=calendarEventName]').val();
                    let eventDate = $(e.target).find('[name=calendarEventDate]').val();

                    edit.call({
                        eventId: currentEvent._id,
                        eventName: eventName,
                        eventDate: eventDate,
                        startTime: $(e.target).find('[name=calendarEventStartTime]').val(),
                        endTime: $(e.target).find('[name=calendarEventEndTime]').val(),
                        description: $(e.target).find('[name=calendarEventDescription]').val(),
                        location: $(e.target).find('[name=calendarEventLocation]').val(),
                        imageLink: " ",
                    }, (err, res) => {
                        if (err) {
                            throwError(err.reason);
                            Session.set('isEventUploading', false);
                        }
                        else {
                            Session.set('isEventUploading', false);

                            FlowRouter.go('eventCalendar.singleEvent',
                                {MMDDYY: res.newDate, eventName: res.newName, nameSlug: res.newSlug}
                            );

                            //FIXME: this currently doesn't work, i.e. accomplish the goal of being able to click the back button after changing the event name or date and go to the new event's URL's edit page.
                            /*
                            FlowRouter.withReplaceState(function() {
                                FlowRouter.setParams({MMDDYY: res.newDate, eventName: res.newName, nameSlug: res.newSlug});
                            });
                            */
                        }
                    });
                }
            });
        }
    },
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
    'change input#eventFileUpload'(e) {
        e.preventDefault();

        /*
         Source: http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
         */
        var $input = $('input#eventFileUpload');
        var $label = $input.next('label');
        var labelVal = $label.html();
        var fileName = '';

        if (e.target.files && e.target.files.length > 1) {
            fileName = ( e.target.getAttribute('data-multiple-caption') || '' ).replace('{count}', e.target.files.length);
        }
        else if (e.target.value) {
            fileName = e.target.value.split('\\').pop();
        }

        if (fileName) {
            $label.find('span').html(fileName);
        }
        else {
            $label.html(labelVal);
        }
    },
    'blur #datepicker-edit-event': (e, target) => {
        //
    },
});

Template.event_calendar_submit.events({
    'submit form.calendar-event-submit': function (e) {
        e.preventDefault();

        if (!Meteor.user()) {
            throwError("You need to be signed in to add an event.");
        }

        var imageLinks = [];

        $(".calendar-event-submit input[type='file']").each(function () {
            var files = this.files;

            for (var i = 0; i < files.length; i++) {
                if (files[i].size > 6000000) {
                    throwError("Sorry, your image is bigger than the 6MB upload limit");
                    return;
                }
            }

            if (files.length > 1) {  //NOTE: for now, just allow one photo per event (open to changing this, though).
                throwError("Sorry, you are trying to upload " + files.length.toString() + " images.  The maximum you can upload is " + 1 + ".");
            }
            else if (files.length > 0) {
                //user is uploading an image
                Session.set('isEventUploading', true);

                var fileIndex = 0;
                Cloudinary.upload(files, {
                    folder: "flippedart",
                    upload_preset: "limitsize"
                }, function (error, result) {
                    if (error) {
                        throwError(error.reason);
                    }

                    //FIXME - since Cloudinary.upload() is asynchronous there's no way to check if there's an error before submitting the userPost and it will likely hang on `null.public_id`

                    imageLinks.push(result.public_id);

                    /*var errors = validateUserPost(userPost);
                     if (errors.text) {
                     return Session.set('userPostSubmitErrors', errors);
                     }*/

                    fileIndex++;  //hack to only insert the post after all photos are uploaded

                    if (fileIndex >= files.length) {

                        let eventName = $(e.target).find('[name=calendarEventName]').val();
                        let eventDate = $(e.target).find('[name=calendarEventDate]').val();

                        insert.call({
                            authorName: Meteor.user().username,
                            eventName: eventName,
                            eventDate: eventDate,
                            startTime: $(e.target).find('[name=calendarEventStartTime]').val(),
                            endTime: $(e.target).find('[name=calendarEventEndTime]').val(),
                            description: $(e.target).find('[name=calendarEventDescription]').val(),
                            location: $(e.target).find('[name=calendarEventLocation]').val(),
                            imageLink: imageLinks[0],  //NOTE: only using one photo per calendar event, for now
                        }, (err, res) => {
                            if (err) {
                                throwError(err.reason);
                                Session.set('isEventUploading', false);
                            }
                            else {
                                Session.set('isEventUploading', false);

                                FlowRouter.go('eventCalendar.singleEvent',
                                    {MMDDYY: res.eventDate, eventName: res.eventName, nameSlug: res.nameSlug}
                                );
                            }
                        });
                    }
                });
            }
            else {
                //no images

                let eventName = $(e.target).find('[name=calendarEventName]').val();
                let eventDate = $(e.target).find('[name=calendarEventDate]').val();

                insert.call({
                    authorName: Meteor.user().username,
                    eventName: eventName,
                    eventDate: eventDate,
                    startTime: $(e.target).find('[name=calendarEventStartTime]').val(),
                    endTime: $(e.target).find('[name=calendarEventEndTime]').val(),
                    description: $(e.target).find('[name=calendarEventDescription]').val(),
                    location: $(e.target).find('[name=calendarEventLocation]').val(),
                    imageLink: " ",
                }, (err, res) => {
                    if (err) {
                        throwError(err.reason);
                    }
                    else {
                        Session.set('isEventUploading', false);

                        FlowRouter.go('eventCalendar.singleEvent',
                            {MMDDYY: res.eventDate, eventName: res.eventName, nameSlug: res.nameSlug}
                        );
                    }
                });
            }
        });
    },
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
    'change input#eventFileUpload'(e) {
        e.preventDefault();

        /*
         Source: http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
         */
        var $input = $('input#eventFileUpload');
        var $label = $input.next('label');
        var labelVal = $label.html();
        var fileName = '';

        if (e.target.files && e.target.files.length > 1) {
            fileName = ( e.target.getAttribute('data-multiple-caption') || '' ).replace('{count}', e.target.files.length);
        }
        else if (e.target.value) {
            fileName = e.target.value.split('\\').pop();
        }

        if (fileName) {
            $label.find('span').html(fileName);
        }
        else {
            $label.html(labelVal);
        }
    },
    'blur #datepicker': (e, target) => {
        //
    },
});

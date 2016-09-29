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
} from '../../../api/calendar-events/methods.js';

import './event-calendar-page.html';
import './event-calendar-edit.html';
import './event-calendar-submit.html';
import './event-calendar-single-event.html';
import './event-calendar-single-date.html';


Template.event_calendar_page.onCreated(function() {

    let hash = FlowRouter.current().context.hash;
    if (hash
        && /^\d{2}\-\d{2}$/.test(hash)
        && parseInt(hash.slice(0,2)) <= 12) {  //NOTE: the bookmarkable hash URLs come in the format MM-YY

        Session.set('currentCalendarMonth', parseInt(hash.slice(0,2)));  //NOTE: Moment months are zero-indexed
        Session.set('currentCalendarYear', parseInt(hash.slice(3,5)));  //NOTE: We only want the last two digits of the year
    }
    else {
        Session.set('currentCalendarMonth', moment().month() + 1);  //NOTE: Moment months are zero-indexed
        Session.set('currentCalendarYear', moment().year() % 1000);  //NOTE: We only want the last two digits of the year
    }

    // Subscriptions go in here
    this.autorun(() => {
        //FIXME: pull currently-selected month and year
        this.subscribe('calendarEvents.byMonth', Session.get('currentCalendarMonth'), Session.get('currentCalendarYear'));
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
    this.getNameSlug = () => FlowRouter.getParam('nameSlug');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('calendarEvents.single', this.getCalendarDate(), this.getEventName(), this.getNameSlug())
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

Template.event_calendar_submit.onCreated(function userPostSubmitOnCreated() {
    Session.set('isEventUploading', false);

    // Subscriptions go in here
    this.autorun(() => {

    });
});


Template.event_calendar_page.onRendered(function() {
    autosize($('textarea'));

    this.resizeCalendarBoxes = _.throttle(() => {
        let containerWidth = $('.event-calendar-container').width();

        let boxWidth =  ~~(containerWidth/7);  //NOTE: truncate down with "~~" and prevent off-by-one pixel width bugs

        $('.calendar-box').css({'width': boxWidth - 1, 'height': boxWidth * 2});
        $('.truncate-event-name').css('width', boxWidth - 15);  //NOTE: the "-15" accounts for padding in the box, but could be more precise
    }, 20);
    $(window).resize(this.resizeCalendarBoxes);

    //NOTE: dumb bug if this method is instantly called on render.
    Meteor.setTimeout(
        this.resizeCalendarBoxes,
        20
    );
});

Template.event_calendar_single_date_page.onRendered(function() {

});

Template.event_calendar_single_event_page.onRendered(function() {

});


Template.event_calendar_page.helpers({
    calendarEvents: () => {
        return CalendarEvents.find({});
    },
    selectedMonthName: () => {
        return moment(Session.get('currentCalendarMonth'), "MM").format("MMMM");
    },
    selectedYear: () => {
        return moment(Session.get('currentCalendarYear'), "YY").format("YYYY");
    },
    numberOfDaysInMonth: () => {
        return moment(Session.get('currentCalendarMonth') + '-' + Session.get('currentCalendarYear'), "MM-YY").daysInMonth();
    },
    numberOfPrependedDays: () => {
        //get the number of "grayed out" days to display before the first of the month on the top row.  This could be 0-6 days.
        return moment(Session.get('currentCalendarMonth') + '-' + '01' + '-' + Session.get('currentCalendarYear'), 'MM-DD-YY').day();
    },
    numberOfAppendedDays: () => {
        //get the number of "grayed out" days to display after the last of the month on the bottom row.  This could be 0-6 days.
        let daysInMonth = moment(Session.get('currentCalendarMonth') + '-' + Session.get('currentCalendarYear'), "MM-YY").daysInMonth();
        return 6 - moment(Session.get('currentCalendarMonth') + '-' + daysInMonth + '-' + Session.get('currentCalendarYear'), 'MM-DD-YY').day();

    },
    equalsDate: (mmddyy, dd) => {
        //remove potential hyphens in the date first
        let newDate = mmddyy.toString().replace(/\-+/g, '');
        let validDate = /^\d{6}$/.test(newDate);
        if (validDate) {
            return dd == newDate.slice(2,4);
        }
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
    }
    //TODO: return subbed event objects
});

Template.event_calendar_single_event_page.helpers({
    eventName: () => {
        return Template.instance().getEventName();
    },
    event: () => {
        return CalendarEvents.findOne({});
    }
    //TODO: return subbed event object
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
    'click .js-event-calendar-prev-month': function(e) {
        let currentMonth = Session.get('currentCalendarMonth');
        let currentYear = Session.get('currentCalendarYear');

        if (currentMonth <= 1) {
            Session.set('currentCalendarMonth', 12);
            Session.set('currentCalendarYear', currentYear - 1);

            //Make each month bookmarkable
            currentMonth = Session.get('currentCalendarMonth');
            currentYear = Session.get('currentCalendarYear');
            window.location.hash = '#' + (currentMonth < 10 ? '0' + currentMonth : currentMonth) + '-' + currentYear;
        }
        else {
            Session.set('currentCalendarMonth', currentMonth - 1);

            //Make each month bookmarkable
            currentMonth = Session.get('currentCalendarMonth');
            window.location.hash = '#' + (currentMonth < 10 ? '0' + currentMonth : currentMonth) + '-' + currentYear;
        }

        Meteor.setTimeout(
            Template.instance().resizeCalendarBoxes,
            50
        );
    },
    'click .js-event-calendar-next-month': function(e) {
        let currentMonth = Session.get('currentCalendarMonth');
        let currentYear = Session.get('currentCalendarYear');

        if (currentMonth >= 12) {
            Session.set('currentCalendarMonth', 1);
            Session.set('currentCalendarYear', currentYear + 1);

            //Make each month bookmarkable
            currentMonth = Session.get('currentCalendarMonth');
            currentYear = Session.get('currentCalendarYear');
            window.location.hash = '#' + (currentMonth < 10 ? '0' + currentMonth : currentMonth) + '-' + currentYear;
        }
        else {
            Session.set('currentCalendarMonth', currentMonth + 1);

            //Make each month bookmarkable
            currentMonth = Session.get('currentCalendarMonth');
            window.location.hash = '#' + (currentMonth < 10 ? '0' + currentMonth : currentMonth) + '-' + currentYear;
        }

        Meteor.setTimeout(
            Template.instance().resizeCalendarBoxes,
            50
        );
    }
});

Template.event_calendar_single_date_page.events({

});

Template.event_calendar_single_event_page.events({

});

Template.event_calendar_submit.events({
    'submit form.calendar-event-submit': function (e) {
        e.preventDefault();

        if (!Meteor.user()) {
            throwError("You must be signed in to add an event.");
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
                        console.log('err 1');
                        console.log(err);
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
                                console.log('err 2');
                                console.log(err);
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
                        console.log('err 3');
                        console.log(err);
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
});

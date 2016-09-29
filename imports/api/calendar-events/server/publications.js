/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { CalendarEvents } from '../calendar-events.js';


Meteor.publish('calendarEvents.all', function () {

    //NOTE: publishing "all" events is for admin use only
    if (!this.userId) {
        return;
    }

    const adminUser = Meteor.users.findOne(this.userId);
    if (!_.contains(adminUser.roles, 'admin')) {
        return;
    }

    return CalendarEvents.find(
        {},
        {
            fields: CalendarEvents.publicFields
        });
});

Meteor.publish('calendarEvents.byMonth', function(month, year) {
    //NOTE: this is a specific query that could probably be a lot more efficient/cleaner...
    // it takes a date in the format of MMDDYY

    check(month, Number);
    check(year, Number);

    //NOTE: the .slice(-2) operation prepends a 0 to all single-digit months, to avoid a sometimes-weird regex bug
    let regex = new RegExp('^(' + ('0' + month).slice(-2) + ').*(' + year + ')$');

    return CalendarEvents.find(
        {
            eventDate: {
                $regex: regex
            }
        },
        {
            sort: {
                eventDate: 1
                //TODO: sort by start times secondarily
            },
            fields: CalendarEvents.publicFields
        }
    )
});

Meteor.publish('calendarEvents.date', function(/*...*/) {

    //...

});

Meteor.publish('calendarEvents.user', function(username, options) {
    check(username, String);
    check(options, {
        sort: Object,
        limit: Number
    });

    //unnecessary at this point

});

Meteor.publish('calendarEvents.single', function(eventDate, eventName, nameSlug) {
    check(eventDate, String);
    check(eventName, String);
    check(nameSlug, String);

    return CalendarEvents.find(
        {
            eventDate: eventDate,
            eventName: eventName,
            nameSlug: nameSlug
        },
        {
            fields: CalendarEvents.publicFields,
        }
    );
});
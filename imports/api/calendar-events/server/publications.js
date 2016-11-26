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

    //NOTE: this takes a date in the format of MMDDYY *or* MM-DD-YY
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

                //FIXME: sort by start times secondarily
            },
            fields: CalendarEvents.publicFields
        }
    )
});

Meteor.publish('calendarEvents.date', function(eventDate) {
    check(eventDate, String);

    let newDate = eventDate.toString().replace(/\-+/g, '');
    let validDate = /^\d{6}$/.test(newDate);

    if (validDate) {
        let mm = newDate.slice(0,2);
        let dd = newDate.slice(2,4);
        let yy = newDate.slice(4,6);

        let regex = new RegExp('^(' + mm + ').*(' + dd + ').*(' + yy + ')$');

        return CalendarEvents.find(
            {
                eventDate: {
                    $regex: regex
                }
            },
            {
                //FIXME: sort by startTime

                fields: CalendarEvents.publicFields
            }
        );
    }

});

Meteor.publish('calendarEvents.user', function(username, options) {
    check(username, String);
    check(options, {
        sort: Object,
        limit: Number
    });

    //TODO: query to list on user's profile

});

Meteor.publish('calendarEvents.single', function(eventDate, eventName, nameSlug) {
    check(eventDate, String);
    check(eventName, String);
    check(nameSlug, String);


    //TODO: query with a regex on eventDate to include results with and without hyphens?
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

//TODO: page the below two publications
Meteor.publish('calendarEvents.upcoming', function(limit) {
    check(limit, Number);

    let currentDate = new Date();

    Counts.publish(this, 'calendarEvents.upcoming.count', CalendarEvents.find({eventDateFormatted: {$gte: currentDate}}), { noReady: true });

    return CalendarEvents.find(
        {
            eventDateFormatted: {
                $gte: currentDate
            }
        },
        {
            sort: {
                eventDateFormatted: 1
                //TODO: sort by start times secondarily
            },
            limit: limit,
            fields: CalendarEvents.publicFields,
        });
});

Meteor.publish('calendarEvents.past', function(limit) {
    check(limit, Number);

    let currentDate = new Date();

    Counts.publish(this, 'calendarEvents.past.count', CalendarEvents.find({eventDateFormatted: {$lt: currentDate}}), { noReady: true });

    return CalendarEvents.find(
        {
            eventDateFormatted: {
                $lt: currentDate
            }
        },
        {
            sort: {
                eventDateFormatted: -1
                //TODO: sort by start times secondarily
            },
            limit: limit,
            fields: CalendarEvents.publicFields,
        });
});

Meteor.publish('calendarEvents.fromDate', function(limit) {
    check(limit, Number);

    let currentDate = new Date();

    //TODO: get upcoming events, from currentDate, up to limit.  If limit isn't reached, get past events backward from currentDate
});

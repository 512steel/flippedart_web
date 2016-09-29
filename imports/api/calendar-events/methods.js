import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import { sanitizeHtml } from '../../ui/lib/general-helpers.js';

import { CalendarEvents } from './calendar-events.js';
import { UserAttributes } from '../user-attributes/user-attributes.js';
import { updateRank } from '../user-attributes/methods.js';

import {
    POINTS_SYSTEM,
    RECENT_ACTIVITY_TYPES,
} from '../../ui/lib/globals.js';

import {
    throwError,
    throwWarning,
    throwSuccess } from '../../ui/lib/temporary-alerts.js';


//TODO: Add "like", "unlike", "rsvp", and "unrsvp" methods
//TODO: add the ability to comment on events, just like projects/pages


export const insert = new ValidatedMethod({
    name: 'calendarEvents.insert',
    validate: new SimpleSchema({
        authorName: {
            type: String,
        },
        eventName: {
            type: String,
            max: 500,
        },
        eventDate: {
            type: String,
            max: 10
        },
        startTime: {
            type: String,
            max: 20,
        },
        endTime: {
            type: String,
            max: 20,
        },
        description: {
            type: String,
            max: 5000,
        },
        location: {
            type: String,
            max: 200,
        },
        imageLink: {
            type: String,
            max: 200,
            optional: true
        },
    }).validator(),
    run({ authorName, eventName, eventDate, startTime, endTime, description, location, imageLink}) {
        if (this.userId) {
            authorName = sanitizeHtml(authorName);
            eventName = sanitizeHtml(eventName);
            eventDate = sanitizeHtml(eventDate);
            startTime = sanitizeHtml(startTime);
            endTime = sanitizeHtml(endTime);
            description = sanitizeHtml(description);
            location = sanitizeHtml(location);
            imageLink = imageLink.trim() ? sanitizeHtml(imageLink) : imageLink;

            // validate that the date is in the proper MMDDYY or MM-DD-YY format here
            const newDate = eventDate.replace(/\-+/g, '');
            let validDate = /^\d{6}$/.test(newDate);

            if (!validDate) {
                throw new Meteor.Error('calendarEvents.insert.accessDenied', '[Invalid date]');
            }

            let isAdmin = false;
            const adminUser = Meteor.users.findOne(this.userId);
            if (_.contains(adminUser.roles, 'admin')) {
                isAdmin = true;
            }

            //TODO: search for calendarEvents on the same date with the same name, and auto-increment nameSlug
            let conflictingEvent = CalendarEvents.find(
                {
                    eventDate: eventDate,
                    eventName: eventName
                },
                {
                    sort: { nameSlug: -1 },
                    limit: 1
                }).fetch();

            if (conflictingEvent.length) {
                currentSlug = Number(conflictingEvent[0].nameSlug);
                var nameSlug = isNaN(currentSlug) ? 1 : Number(conflictingEvent[0].nameSlug) + 1;
            }

            const calendarEvent = {
                authorId: this.userId,
                authorName: authorName,
                isAuthorAdmin: isAdmin,
                eventName: eventName,
                eventDate: eventDate,
                //eventDateFormatted: eventDateFormatted,
                startTime: startTime,
                endTime: endTime,
                description: description,
                location: location,
                imageLink: imageLink,
                createdAt: new Date(),
                nameSlug: nameSlug ? nameSlug : 1
            };


            const newCalendarEventId = CalendarEvents.insert(calendarEvent);

            //UserAttributes points system: do this after the fact
            const userAttributes = UserAttributes.findOne({userId: this.userId});
            if (userAttributes) {
                //Call the server-only method updateRank on UserAttributes, and remove points
                updateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.calendarEventAdd);
            }

            const link = "https://www.flippedart.org/calendar/" + eventDate + "/" + eventName;
            //TODO: add a calendar event RecentActivity: createRecentActivity(...);

            return calendarEvent;
        }
        else {
            throw new Meteor.Error('calendarEvents.insert.accessDenied',
                'You need to be signed in to add a calendar event.');
        }
    }
});

export const edit = new ValidatedMethod({
    name: 'calendarEvents.edit',
    validate: new SimpleSchema({
        commentId: { type: String, regEx: SimpleSchema.RegEx.Id },
        text: { type: String },
    }).validator(),
    run({ commentId, text }) {
        text = sanitizeHtml(text);

        const comment = Comments.findOne(commentId);

        if (!comment || !comment.editableBy(this.userId)) {
            /*
             NOTE: throwing a Meteor.Error will fail the client-side
             simulation, preventing the server-side Method from ever being run.
             So my hacky solution is to have a client-only editableBy(), which always
             returns true, and a server-only editableBy, which checks what it's
             supposed to.
             */

            throw new Meteor.Error('comments.edit.accessDenied',
                'You don\'t have permission to edit this comment.');
        }

        Comments.update(commentId,
            {
                $set: {
                    text: text,
                    lastUpdated: new Date()
                }
            });
    }
});


export const deleteCalendarEvent = new ValidatedMethod({
    name: 'calendarEvents.delete',
    validate: new SimpleSchema({
        commentId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id
        },
    }).validator(),
    run({ commentId }) {
        const comment = Comments.findOne(commentId);

        if (!comment || !comment.editableBy(this.userId)) {
            /*
             NOTE: throwing a Meteor.Error will fail the client-side
             simulation, preventing the server-side Method from ever being run.
             So my hacky solution is to have a client-only editableBy(), which always
             returns true, and a server-only editableBy, which checks what it's
             supposed to.
             */

            throw new Meteor.Error('comments.delete.accessDenied',
                'You don\'t have permission to delete this comment.');
        }

        Comments.remove(comment);

        userPostDecrementComments(comment.userPostId);

        //points system:
        const userAttributes = UserAttributes.findOne({userId: this.userId});
        if (userAttributes) {
            //Call the server-only method updateRank on UserAttributes, and remove points
            updateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.comment * -1);
        }
    }
});


// Get list of all method names on Comments
const COMMENTS_METHODS = _.pluck([
    insert,
    edit,
    deleteCalendarEvent,
], 'name');

if (Meteor.isServer) {
    // Only allow 1 comment operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(COMMENTS_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 5000);
}

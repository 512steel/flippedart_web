import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';

class CalendarEventsCollection extends Mongo.Collection {
    insert(event, callback) {
        const ourEvent = event;
        ourEvent.createdAt = ourEvent.createdAt || new Date();
        return result = super.insert(ourEvent, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
    remove(selector, callback) {
        return result = super.remove(selector, callback);
    }
}

export const CalendarEvents = new CalendarEventsCollection('CalendarEvents');

// Deny all client-side updates since we will be using methods to manage this collection
CalendarEvents.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

CalendarEvents.schema = new SimpleSchema({
    authorId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    authorName: {
        type: String,
    },
    isAuthorAdmin: {
        type: Boolean,
    },
    eventName: {
        type: String,
        max: 500,
    },
    eventDate: {
        type: String,
        max: 10,
    },
    eventDateFormatted: {
        type: Date,
        optional: true  //TODO: get rid of this once formatting code is written for the insert() method
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
    createdAt: {
        type: Date,
        denyUpdate: true,
    },
    lastUpdated: {
        type: Date,
        optional: true,
    },

    //NOTE: an event will have this field if the eventName and eventDate both collide with an existing event.
    nameSlug: {
        type: String,
        optional: true
    },
});

CalendarEvents.attachSchema(CalendarEvents.schema);

// This represents the keys from CalendarEvents objects that should be published
// to the client. If we add secret properties to CalendarEvent objects, don't list
// them here to keep them private to the server.
CalendarEvents.publicFields = {
    //authorId: 1,
    authorName: 1,
    isAuthorAdmin: 1,
    eventName: 1,
    eventDate: 1,
    eventDateFormatted: 1,
    startTime: 1,
    endTime: 1,
    description: 1,
    location: 1,
    imageLink: 1,
    createdAt: 1,
    lastUpdated: 1,
    nameSlug: 1,
};

//TODO: build testing factory here
Factory.define('calendarEvent', CalendarEvents, {});


/*
 NOTE: we need the editableBy helper to run differently in the client and server, due to
 Meteor's Method simulations on the client (which don't touch the server if the client fails).
 */
CalendarEvents.helpers({
    editableBy(userId) {
        if (Meteor.isClient && Meteor.user()) {
            return true;
        }
        else if (Meteor.isServer && this.authorId) {
            //NOTE: "this" refers to the document, NOT to the current signed-in user.  Hence "this.authorId" instead of "this.userId"
            return this.authorId === userId;
        }
        else {
            return false;
        }
    }
});

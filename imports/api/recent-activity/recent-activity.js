import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';

class RecentActivityCollection extends Mongo.Collection {
    insert(activity, callback) {
        const ourActivity = activity;
        ourActivity.createdAt = ourActivity.createdAt || new Date();
        return result = super.insert(ourActivity, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
    remove(selector, callback) {
        return result = super.remove(selector, callback);
    }
}

export const RecentActivity = new RecentActivityCollection('RecentActivity');

// Deny all client-side updates since we will be using methods to manage this collection
RecentActivity.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

/*
 NOTE: some actions don't have an "actee".
 */
RecentActivity.schema = new SimpleSchema({
    actorName: {
        type: String,
    },
    acteeName: {
        type: String,
        optional: true,
    },
    actionText: {
        type: String,
    },
    link: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
    },
    createdAt: {
        type: Date,
        denyUpdate: true,
    },
});

RecentActivity.attachSchema(RecentActivity.schema);

// This represents the keys from UserPosts objects that should be published
// to the client. If we add secret properties to UserPost objects, don't list
// them here to keep them private to the server.
RecentActivity.publicFields = {
    actorNmae: 1,
    acteeName: 1,
    actionText: 1,
    link: 1,
    createdAt: 1,
};

//TODO: build testing factory here
Factory.define('activity', RecentActivity, {});


RecentActivity.helpers({
    //...
});

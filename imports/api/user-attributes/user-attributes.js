import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';

class UserAttributesCollection extends Mongo.Collection {
    insert(attributes, callback) {
        const ourAttributes = attributes;
        ourAttributes.createdAt = ourAttributes.createdAt || new Date();
        return result = super.insert(ourAttributes, callback);
    }
    update(selector, modifier) {
        return result = super.update(selector, modifier);
    }
}

export const UserAttributes = new UserAttributesCollection('UserAttributes');

// Deny all client-side updates since we will be using methods to manage this collection
UserAttributes.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

UserAttributes.schema = new SimpleSchema({
    userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    username: {
        type: String,
    },
    location: {
        type: String,
        max: 100,
        optional: true,
    },
    bio: {
        type: String,
        max: 20000,
        optional: true,
    },
    profilePhotoLink: {
        type: String,
        optional: true,
        //regEx: SimpleSchema.RegEx.Url, //TODO: check on format of Cloudinary package before turning this on.
    },
    itemsPreviouslyOwned: {
        type: [String],
    },
    rank: {
        type: Number,
    },
    createdAt: {
        type: Date,
        //denyUpdate: true,  //Had to comment this out due to upserting.
    },
});

UserAttributes.attachSchema(UserAttributes.schema);

// This represents the keys from UserAttributes objects that should be published
// to the client. If we add secret properties to UserAttributes objects, don't list
// them here to keep them private to the server.
UserAttributes.publicFields = {
    //userId: 1,
    username: 1,
    location: 1,
    bio: 1,
    profilePhotoLink: 1,
    itemsPreviouslyOwned: 1,
    rank: 1,
    createdAt: 1,
};

//TODO: build testing factory here
Factory.define('userAttributes', UserAttributes, {});

/*
 NOTE: This doesn't need to get split a la UserPosts.helpers because we aren't throwing
 a Meteor.Error in the UserAttributes edit() Method.
*/
UserAttributes.helpers({
    editableBy(userId) {
        if (!this.userId) {
            return false;
        }

        return this.userId === userId;
    },
});

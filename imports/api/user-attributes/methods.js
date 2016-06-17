import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';
import { sanitizeHtml, sanitizeHtmlNoReturns } from '../../ui/lib/general-helpers.js';

import { UserAttributes } from './user-attributes.js';

export const insert = new ValidatedMethod({
    name: 'userAttributes.insert',
    validate: new SimpleSchema({
        bio: { type: String },
        location: { type: String },
        profilePhotoLink: { type: String },
    }).validator(),
    run({ bio, location, profilePhotoLink }) {
        if (this.userId) {

            bio = sanitizeHtml(bio);
            location = sanitizeHtmlNoReturns(location);
            profilePhotoLink = sanitizeHtmlNoReturns(profilePhotoLink);

            const user = Meteor.users.findOne(this.userId);

            if (user) {  // this check is likely superfluous, but stranger things have happened.
                const defaults = defaultTexts(user.username);

                const userAttributes = {
                    userId: user._id,
                    username: user.username,
                    bio: bio.trim() ? bio : defaults.bio,
                    location: location.trim() ? location : defaults.location,
                    profilePhotoLink: profilePhotoLink.trim() ? profilePhotoLink : defaults.profilePhotoLink,
                    itemsPreviouslyOwned: [],
                    rank: 0,
                    createdAt: new Date(),
                };

                /*
                 NOTE: the "upsert" option wasn't actually inserting anything into the
                 database, hence the need for the if-else block to do a regular ol' insert
                 in case there are no UserAttributes associated with the current user.
                 Ideally we'd rely on just the update-upsert method, but as it stands it's
                 not much more than a fallback in case the user does something wonky.
                 */
                if (!UserAttributes.findOne({userId: user._id})) {
                    UserAttributes.insert(userAttributes);
                }
                else {
                    UserAttributes.update(
                        { userId: user._id },  //TODO: switch to "username" after removing publicField?
                        {
                            $set: userAttributes
                        },
                        { upsert: true }
                    );
                }
            }
        }
    },
});

export const edit = new ValidatedMethod({
    name: 'userAttributes.edit',
    validate: new SimpleSchema({
        bio: { type: String },
        location: { type: String },
        profilePhotoLink: { type: String },
    }).validator(),
    run({ bio, location, profilePhotoLink }) {
        if (this.userId) {

            bio = sanitizeHtml(bio);
            location = sanitizeHtmlNoReturns(location);
            profilePhotoLink = sanitizeHtmlNoReturns(profilePhotoLink);

            const userAttributes = UserAttributes.findOne({userId: this.userId});

            if (!userAttributes || !userAttributes.editableBy(this.userId)) {
                /*
                 NOTE: this will fail on the client, even if it's an honest user, because
                 above we have to query UserAttributes with userId.  So we can't throw a
                 Meteor.Error.  There is another workaround, query Meteor.users to get
                 the username of this.userId, and then query UserAttributes off of that.
                 If it comes to it that's what I ought to switch to, in order to maintain
                 consistency with how UserPosts handles editing a post.
                */
                console.log('[access denied] You don\'t have permission to edit this information.');
                //throw new Meteor.Error('userPosts.edit.accessDenied',
                //    'You don\'t have permission to edit this post.');
            }
            else {
                UserAttributes.update(
                    {
                        userId: this.userId
                    },
                    {
                        $set: {
                            bio: bio.trim() ? bio : userAttributes.bio,
                            location: location.trim() ? location : userAttributes.location,
                            profilePhotoLink: profilePhotoLink.trim() ? profilePhotoLink : userAttributes.profilePhotoLink,
                        }
                    },
                    { upsert: true }
                );
            }
        }
    }
});


//NOTE: this has been replaced with updateRank below, a server-only method
/*export const updateRank = new ValidatedMethod({
    name: 'userAttributes.updateRank',
    validate: new SimpleSchema({
        userAttributesId: { type: String },
        amount: { type: Number },
    }).validator(),
    run({ userAttributesId, amount }) {
        console.log('in method userAttributes.updateRank');
        console.log(this.connection);

        if ( this.connection == null ) {
            console.log('increasing rank');
            //FIXME: how do we prevent fraudulent points from being added?  Either from the user themself or from other users?
            UserAttributes.update(
                {
                    _id: userAttributesId,
                },
                {
                    $inc: {rank: amount}
                }
            );
        }
        else {
            console.log('did not increase rank');
        }
    }
});*/


const defaultTexts = (username) => {
    return {
        bio:  username + ' hasn\'t entered their bio yet.',
        location: username + ' hasn\'t entered their location yet.',
        profilePhotoLink: 'https://res.cloudinary.com/dwgim6or9/image/upload/v1447227436/anonymous-user_aw4wxr.png',
    }
};

//NOTE: This function will only work when called from the server, limiting the chance of fraudulent points.
export const updateRank = (userAttributesId, amount) => {
    const updateRankFunctionSchema = new SimpleSchema({
        userAttributesId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
        amount: {
            type: Number
        }
    });
    check({
        userAttributesId: userAttributesId,
        amount: amount,
    }, updateRankFunctionSchema);


    if (Meteor.isServer) {
        UserAttributes.update(
            {
                _id: userAttributesId,
            },
            {
                $inc: {rank: amount}
            }
        );
    }
};
//TODO: clean up this convenience method and the one above it
export const updateRankByName = (userAttributesName, amount) => {
    userAttributesName = sanitizeHtmlNoReturns(userAttributesName);

    const updateRankByNameFunctionSchema = new SimpleSchema({
        userAttributesName: {
            type: String
        },
        amount: {
            type: Number
        }
    });
    check({
        userAttributesName: userAttributesName,
        amount: amount,
    }, updateRankByNameFunctionSchema);


    if (Meteor.isServer) {
        UserAttributes.update(
            {
                username: userAttributesName,
            },
            {
                $inc: {rank: amount}
            }
        );
    }
};


// Get list of all method names on UserAttributes
const USERATTRIBUTES_METHODS = _.pluck([
    insert,
    edit,
    //updateRank,
    //updateRankByName,
], 'name');

if (Meteor.isServer) {
    // Only allow 5 userPost operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(USERATTRIBUTES_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 1000);
}

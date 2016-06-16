import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import { sanitizeHtml, sanitizeHtmlNoReturns } from '../../ui/lib/general-helpers.js';

import { ExchangeItems } from './exchange-items.js';
import { UserAttributes } from '../user-attributes/user-attributes.js';
import { updateRank as userAttributesUpdateRank } from '../user-attributes/methods.js';

import { POINTS_SYSTEM, UPLOAD_LIMITS } from '../../ui/lib/globals.js';


//NOTE: insert() is a server-only method, so that only insertMany() can be called from the client (for DDP rate limiting)
export const insert = (title, description, imageLinks, available, tag, userId) => {
    console.log('in server method insert.');

    const insertFunctionSchema = new SimpleSchema({
        title: {
            type: String
        },
        description: {
            type: String
        },
        imageLinks: {
            type: [String],
            //regEx: SimpleSchema.RegEx.Url,  //TODO: confirm with Cloudinary before turning this on.
            minCount: 1,
            maxCount: UPLOAD_LIMITS.images
        },
        available: {
            type: Boolean,
            defaultValue: true
        },
        tag: {
            type: String,
            optional: true
        },
        userId: {
            //NOTE: this.userId needs to be passed in from the ValidatedMethod, since the server-only method isn't a Meteor one.
            type: String,
            regEx: SimpleSchema.RegEx.Id
        }
    });
    check({
        title: title,
        description: description,
        imageLinks: imageLinks,
        available: available,
        tag: tag,
        userId: userId,
    }, insertFunctionSchema);

    title = sanitizeHtmlNoReturns(title);
    description = sanitizeHtml(description);
    tag = sanitizeHtmlNoReturns(tag);

    if (Meteor.isServer) {
        var userAttributes = UserAttributes.findOne({userId: userId});

        if (userAttributes) {
            const exchangeItem = {
                ownerId: userId,
                ownerName: userAttributes.username,
                title: title,
                description: description,
                location: userAttributes.location ? userAttributes.location : ' ',
                tag: tag ? tag : ' ',
                imageLinks: imageLinks,
                mainImageLink: imageLinks.length ? imageLinks[0] : ' ',  //TODO: allow user to select mainImageLink
                available: available,
                locked: false,
                addendums: [],
                addendumAuthors: [],
                rank: 0,
                pastOwnerNames: [],
                createdAt: new Date(),
            };

            ExchangeItems.insert(exchangeItem);

            //points system:
            userAttributesUpdateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.exchangeItemAdd);
        }
        else {
            //FIXME
            console.log('You need to update your user profile before adding a project.');
        }
    }
    else {
    }
};

export const insertMany = new ValidatedMethod({
    name: 'exchangeItems.insertMany',
    validate: new SimpleSchema({
        itemArray: {
            type: [Object],
            minCount: 1,
            maxCount: UPLOAD_LIMITS.projects,
        },
        "itemArray.$.title": {
            type: String,
        },
        "itemArray.$.description": {
            type: String,
        },
        "itemArray.$.tag": {
            type: String,
            optional: true,
        },
        "itemArray.$.available": {
            type: Boolean,
            defaultValue: true,
        },
        "itemArray.$.imageLinks": {
            type: [String],
            minCount: 1,
            maxCount: UPLOAD_LIMITS.images
        },
    }).validator(),
    run({ itemArray }) {
        if (this.userId) {
            const userId = this.userId;

            itemArray.forEach(function(item) {
                insert(item.title, item.description, item.imageLinks, item.available, item.tag, userId);
            });
        }
    },
});

export const edit = new ValidatedMethod({
    name: 'exchangeItems.edit',
    validate: new SimpleSchema({
        exchangeItemId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
        title: {
            type: String,
            optional: true
        },
        description: {
            type: String,
            optional: true
        },
        location: {
            type: String,
            optional: true,
        },
        imageLinks: {
            type: [String],
            optional: true  //NOTE: it's not necessary to re-add an image, even though at least one is required to be there for an exchangeItem.
        },
        available: {
            type: Boolean,
            optional: true },
        tag: {
            type: String,
            optional: true
        },
    }).validator(),
    run({ exchangeItemId, title, description, location, imageLinks, available, tag }) {
        if (this.userId) {
            console.log('in method exchangeItems.insert');

            title = title ? sanitizeHtmlNoReturns(title) : title;
            description = description ? sanitizeHtml(description) : description;
            location = location ? sanitizeHtmlNoReturns(location) : location;
            tag = tag ? sanitizeHtmlNoReturns(tag) : tag;

            //truncate the imageLinks array
            if (imageLinks)
                imageLinks = imageLinks.slice(0, UPLOAD_LIMITS.images);

            const exchangeItem = ExchangeItems.findOne(exchangeItemId);

            if (!exchangeItem || !exchangeItem.editableBy(this.userId)) {
                /*
                 NOTE: throwing a Meteor.Error will fail the client-side
                 simulation, preventing the server-side Method from ever being run.
                 So my hacky solution is to have a client-only editableBy(), which always
                 returns true, and a server-only editableBy, which checks what it's
                 supposed to.
                 */

                console.log(exchangeItem);
                throw new Meteor.Error('exchangeItems.edit.accessDenied',
                    'You don\'t have permission to edit this item.');
            }

            const isFirstOwner = !exchangeItem.pastOwnerNames.length;

            ExchangeItems.update(exchangeItemId,
                {
                    $set: {
                        title: (title && isFirstOwner) ? title : exchangeItem.title,
                        description: (description && isFirstOwner) ? description : exchangeItem.description,
                        location: location ? location : exchangeItem.location,
                        //imageLinks: (imageLinks && imageLinks.length) ? imageLinks : exchangeItem.imageLinks,  //TODO: items MUST have a least one image link
                        available: available,
                        tag: tag ? tag : exchangeItem.tag,
                    }
                });

            // A little wonky, but this pushes any subsequent owners' descriptions as "addendums" rather
            // than allowing them to edit the description that the original owner gave.
            if (description && !isFirstOwner) {

                const isLastAddendumAuthor = (exchangeItem.addendumAuthors &&
                                              exchangeItem.addendumAuthors.length &&
                                              exchangeItem.addendumAuthors.length == exchangeItem.addendums.length &&
                                              exchangeItem.ownerName == exchangeItem.addendumAuthors[exchangeItem.addendumAuthors.length-1]);

                //Allow a user to edit their own addendum
                if (isLastAddendumAuthor) {
                    ExchangeItems.update(exchangeItem._id,
                        {
                            $pop: {
                                addendums: 1
                            }
                        });
                    ExchangeItems.update(exchangeItem._id,
                        {
                            $push: {
                                addendums: description
                            }
                        });
                }
                else {
                    ExchangeItems.update(exchangeItem._id,
                        {
                            $push: {
                                addendums: description,
                                addendumAuthors: exchangeItem.ownerName,
                            }
                        });
                }
            }
        }
        else {
            console.log('[accessDenied] You must be signed in to edit an item.');
        }
    }
});

export const deleteItem = new ValidatedMethod({
    name: 'exchangeItems.deleteItem',
    validate: new SimpleSchema({
        exchangeItemId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
    }).validator(),
    run({ exchangeItemId }) {
        console.log('in method exchangeItems.deleteItem');

        if (this.userId) {

            //TODO: think about whether it's appropriate to let a user to delete a locked item that they own (since it's in transit)

            const exchangeItem = ExchangeItems.findOne(exchangeItemId);

            if (!exchangeItem || !exchangeItem.editableBy(this.userId)) {
                /*
                 NOTE: throwing a Meteor.Error will fail the client-side
                 simulation, preventing the server-side Method from ever being run.
                 So my hacky solution is to have a client-only editableBy(), which always
                 returns true, and a server-only editableBy, which checks what it's
                 supposed to.
                 */

                throw new Meteor.Error('exchangeItems.delete.accessDenied',
                    'You don\'t have permission to delete this item.');
            }

            ExchangeItems.remove(exchangeItemId);

            //points system:
            const userAttributes = UserAttributes.findOne({userId: this.userId});
            if (userAttributes) {
                //Call the server-only method updateRank on UserAttributes, and remove points
                userAttributesUpdateRank(userAttributes._id, POINTS_SYSTEM.UserAttributes.exchangeItemAdd * -1);
            }

            //TODO: use Cloudinary method to delete image from Cloudinary (won't affect app performance,
            // but it prevents my Cloudinary account from getting bogged down with deleted images.
        }
        else {
            console.log('[accessDenied] You must be signed in to edit an item.');
        }
    },
});


/*
 NOTE: the below methods - lock, unlock, transfer, updateRank - are server-callable
 only in order to limit fraudulent and non-UI-based updates from the client.
*/

export const lock = (itemIds) => {
    console.log('in server method exchangeItems.lock');

    const lockFunctionSchema = new SimpleSchema({
        itemIds: {
            type: [String],
            regEx: SimpleSchema.RegEx.Id,
            minCount: 1,
        }
    });
    check({itemIds: itemIds}, lockFunctionSchema);

    if (Meteor.isServer) {
        /*
         FIXME: the "multi: true" option doesn't seem to be working, so I opted for
         the uglier hack below.
        */
        /*ExchangeItems.update(
            {
                _id: {
                    $in: itemIds,
                }
            },
            {
                $set: {
                    locked: true,
                }
            },
            {
                multi: true,
            });*/

        for (var i = 0; i < itemIds.length; i++) {
            ExchangeItems.update(itemIds[i], {$set: {locked: true}});
        }
    }
};

export const unlock = (itemIds) => {
    console.log('in server method exchangeItems.unlock');

    const unlockFunctionSchema = new SimpleSchema({
        itemIds: {
            type: [String],
            regEx: SimpleSchema.RegEx.Id,
            minCount: 1,
        }
    });
    check({itemIds: itemIds}, unlockFunctionSchema);

    if (Meteor.isServer) {
        /*
         FIXME: the "multi: true" option doesn't seem to be working, so for the
         moment I opted for the uglier for-loop hack below.
        */
        /*ExchangeItems.update(
            {
                _id: {
                    $in: itemIds,
                }
            },
            {
                $set: {
                    locked: false,
                }
            },
            {
                multi: true,
            });*/

        for (var i = 0; i < itemIds.length; i++) {
            ExchangeItems.update(itemIds[i], {$set: {locked: false}});
        }
    }
};

export const transfer = (itemIds, oldOwnerId, newOwnerId) => {
    console.log('in server method exchangeItems.transfer');

    const transferFunctionSchema = new SimpleSchema({
        itemIds: {
            type: [String],
            regEx: SimpleSchema.RegEx.Id,
            minCount: 1,
        },
        oldOwnerId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
        newOwnerId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        }
    });
    check({
        itemIds: itemIds,
        oldOwnerId: oldOwnerId,
        newOwnerId: newOwnerId,
    }, transferFunctionSchema);

    if (Meteor.isServer) {
        console.log('in isServer check');

        const oldOwner = Meteor.users.findOne(oldOwnerId);
        const newOwner = Meteor.users.findOne(newOwnerId);

        if (oldOwner && newOwner) {
            console.log('is oldOwner and newOwner:');

            //TODO: remove this for-loop and use a single update() with 'multi: true'
            for (var i = 0; i < itemIds.length; i++) {
                const item = ExchangeItems.findOne(itemIds[i]);
                if (item && item.ownerId == oldOwner._id) {  //NOTE: this second check is not necessary, but adds security/prevents wonkiness in some edge cases.

                    //NOTE: Mongo doesn't allow multiple update operators ($push and $set) in the same update() call
                    ExchangeItems.update(itemIds[i],
                        {
                            $set: {
                                ownerId : newOwner._id,
                                ownerName: newOwner.username,
                            }
                        });
                    ExchangeItems.update(itemIds[i],
                        {
                            $push: {pastOwnerNames : item.ownerName},
                        });

                    UserAttributes.update(
                        {
                            userId: oldOwner._id
                        },
                        {
                            $push: {itemsPreviouslyOwned : item._id},
                        });
                }
            }
        }
    }
};

//TODO: it'd be cleaner in other methods.js files to have this accept an array of itemIds
export const updateRank = (itemId, amount) => {
    console.log('in method exchangeItems.updateRank');

    const updateRankFunctionSchema = new SimpleSchema({
        itemId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id,
        },
        amount: {
            type: Number,
        },
    });
    check({
        itemId: itemId,
        amount: amount,
    }, updateRankFunctionSchema);

    if (Meteor.isServer) {
        ExchangeItems.update(
            {
                _id: itemId,
            },
            {
                $inc: {rank: amount}
            }
        );
    }
};


// Get list of all method names on Lists
const USERATTRIBUTES_METHODS = _.pluck([
    //insert,
    insertMany,
    edit,
    deleteItem,
    //lock,
    //unlock,
    //transfer,
    //updateRank,
], 'name');

//FIXME: if entering a lot of exchangeItems at once, we might not want this restriction.
if (Meteor.isServer) {
    // Only allow 5 exchangeItem operations per connection per second
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains(USERATTRIBUTES_METHODS, name);
        },

        // Rate limit per connection ID
        connectionId() { return true; },
    }, 5, 1000);
}

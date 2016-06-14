/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { ExchangeItems } from '../exchange-items.js';


//FIXME: remove these ".all" publications
Meteor.publish('exchangeItems.all', function () {  //TODO: pass in "options" object for sorting/limit, and query these
    /*check(options, {
     sort: Object,
     limit: Number
     });*/

    return ExchangeItems.find(
        {},
        {
            fields: ExchangeItems.publicFields,
        }
    );
});

Meteor.publish('exchangeItems.user', function(username, options, limit) {
    check(username, String);
    check(options, {
        sort: Object
    });
    check(limit, Number);

    Counts.publish(this, 'exchangeItems.user.count', ExchangeItems.find({ownerName: username}), { noReady: true });

    return ExchangeItems.find(
        {
            ownerName : username
        },
        {
            sort: options.sort,
            limit: limit,
            fields: ExchangeItems.publicFields
        });
});

Meteor.publish('exchangeItems.single', function(exchangeItemId) {
    check(exchangeItemId, String);
    return ExchangeItems.find(
        {
            _id: exchangeItemId
        },
        {
            fields: ExchangeItems.publicFields,
        });
});

Meteor.publish('exchangeItems.popular', function (limit) {  //TODO: pass in "options" object for sorting/limit, and query these
    check(limit, Number);

    return ExchangeItems.find(
        {},
        {
            sort: {rank: -1},
            limit: limit,
            fields: ExchangeItems.publicFields,
        }
    );
});

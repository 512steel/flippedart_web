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

Meteor.publish('exchangeItems.user', function(username, options) {
    check(username, String);
    check(options, {
        sort: Object
    });

    return ExchangeItems.find(
        {
            ownerName : username
        },
        {
            sort: options.sort,
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
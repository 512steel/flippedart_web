/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { ExchangeItems } from '../notifications.js';


Meteor.publish('notifications.user', function () { //TODO: sort by createdAt
    return Notifications.find({
        recipientId: this.userId
    });
});

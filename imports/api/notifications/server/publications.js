/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Notifications } from '../notifications.js';


Meteor.publish('notifications.user', function () { //TODO: sort by createdAt
    return Notifications.find(
        {
            recipientId: this.userId,
            hasRead: false  //TODO: for a more nuanced list of notifications, comment this out and adjust the UI for a notification with hasRead : true
        },
        {
            fields: Notifications.publicFields,
        });
});

import { Template } from 'meteor/templating';

import { TemporaryNotifications } from '../lib/temporary-alerts.js';

import './temporary_notifications.html';


Template.temporary_notifications.helpers({
    temporaryNotifications: function() {
        return TemporaryNotifications.find();
    }
});

Template.temporary_notification_single.onRendered(function() {
    var notification = this.data;
    Meteor.setTimeout(function() {
        TemporaryNotifications.remove(notification._id);
    }, 5000);
});

Template.temporary_notification_single.events({
    'click .temporary-alert-close': function(e) {
        e.preventDefault();

        TemporaryNotifications.remove(this._id);
    }
});

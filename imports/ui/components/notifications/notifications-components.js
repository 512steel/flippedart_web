import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { pathFor } from 'meteor/arillo:flow-router-helpers';
import { DocHead } from 'meteor/kadira:dochead';


import { Notifications } from '../../../api/notifications/notifications.js';
import {
    clearSingleNotification,
    clearAllNotifications } from '../../../api/notifications/methods.js';

import { HEAD_DEFAULTS } from '../../lib/globals.js';

import './notification-card.html';
import './notifications-page.html';


Template.notification_card.onCreated(function () {

});

Template.notifications_page.onCreated(function() {
    this.subscribe('notifications.user', {sort: {createdAt: -1}});

    var titleString = "Notifications | " + HEAD_DEFAULTS.title_short;
    DocHead.setTitle(titleString);
    DocHead.addMeta({name: "og:title", content: titleString});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/notifications"});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

Template.notification_card.helpers({
    notificationText: function() {
        if (this) {
            switch (this.type) {
                case 'comment':
                    return this.commenterName + ' has commented on your post';
                    break;

                case 'chatMessage':
                    return this.chatMessageSenderName + ' has sent you a message';
                    break;

                case 'transactionRequested':
                    if (this.itemIds && this.itemIds.length > 1) {
                        return this.transactionRequesterName + ' has requested some of your projects';
                    }
                    else {
                        return this.transactionRequesterName + ' has requested one of your projects';
                    }
                    break;
                case 'transactionApproved':
                    return this.transactionRequesteeName + ' has approved your request';
                    break;
                case 'transactionCompleted':
                    return 'Congrats, ' + this.transactionRequesteeName + ' has completed your request!';
                    break;
                case 'transactionDeclined':
                    return 'Sorry, ' + this.transactionRequesteeName + ' has declined your request';
                    break;
                case 'transactionCancelled':
                    return this.transactionRequesteeName + ' has canceled their request';
                    break;

                default:
                    return 'Default notification text';
            }
        }
        return 'Default notification text';
    },
    notificationLink: function() {
        if (Meteor.user() && this) {
            switch (this.type) {
                case 'comment':
                    return FlowRouter.path('profile.post', {username: Meteor.user().username, userPostId: this.userPostId});
                    break;

                case 'chatMessage':
                    return FlowRouter.path('chatWindow.user', {username: this.chatMessageSenderName});
                    break;

                case 'transactionRequested':
                    return FlowRouter.path('exchanges.user.single', {username: Meteor.user().username, exchangeId: this.transactionId});
                    break;
                case 'transactionApproved':
                    return FlowRouter.path('exchanges.user.single', {username: Meteor.user().username, exchangeId: this.transactionId});
                    break;
                case 'transactionCompleted':
                    return FlowRouter.path('exchanges.user.single', {username: Meteor.user().username, exchangeId: this.transactionId});
                    break;
                case 'transactionDeclined':
                    return FlowRouter.path('exchanges.user.single', {username: Meteor.user().username, exchangeId: this.transactionId});
                    break;
                case 'transactionCancelled':
                    return FlowRouter.path('exchanges.user.single', {username: Meteor.user().username, exchangeId: this.transactionId});
                    break;

                default:
                    return 'Default notification text';
            }
        }
        return 'Default notification text';
    }
});

Template.notifications_page.helpers({
    userNotifications() {
        return Notifications.find({});
    },
    userHasNotifications() {
        if (Notifications.find({}).count()) {
            return true;
        }
        else return false;
    },
    userNotificationsCount() {
        return Notifications.find({}).count();
    },
    currentUsername() {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    }
});


Template.notification_card.events({
    'click .notification-card': function(e) {
        //e.preventDefault();

        clearSingleNotification.call({
            notificationId: this._id,
        });
    }
});

Template.notifications_page.events({
    'click .notifications-clear-all': function () {
        clearAllNotifications.call({ });
    },
});

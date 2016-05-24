import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { pathFor } from 'meteor/arillo:flow-router-helpers';

import { clearSingleNotification } from '../../../api/notifications/methods.js';

import './notification-card.html';

Template.notification_card.onCreated(function () {

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
                    console.log(this);
                    return FlowRouter.path('profile.post', {username: Meteor.user().username, userPostId: this.userPostId});;
                    break;

                case 'chatMessage':
                    return FlowRouter.path('chatWindow.user', {username: this.chatMessageSenderName});;
                    break;

                case 'transactionRequested':
                    return FlowRouter.path('exchanges.user.single', {username: Meteor.user().username, exchangeId: this.transactionId});;
                    break;
                case 'transactionApproved':
                    return FlowRouter.path('exchanges.user.single', {username: Meteor.user().username, exchangeId: this.transactionId});;
                    break;
                case 'transactionCompleted':
                    return FlowRouter.path('exchanges.user.single', {username: Meteor.user().username, exchangeId: this.transactionId});;
                    break;
                case 'transactionDeclined':
                    return FlowRouter.path('exchanges.user.single', {username: Meteor.user().username, exchangeId: this.transactionId});;
                    break;
                case 'transactionCancelled':
                    return FlowRouter.path('exchanges.user.single', {username: Meteor.user().username, exchangeId: this.transactionId});;
                    break;

                default:
                    return 'Default notification text';
            }
        }
        return 'Default notification text';
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

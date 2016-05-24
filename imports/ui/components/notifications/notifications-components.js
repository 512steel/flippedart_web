import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './notification-card.html';

Template.notification_card.onCreated(function () {

});

Template.notification_card.helpers({
    notificationText: function() {
        if (this.data) {
            switch (this.data.type) {
                case 'transactionApproved':
                    return 'Transaction approved!';
                    break;
                default:
                    return 'Default notification text';
                //TODO:  fill this out...
            }
        }
        return 'Default notification text';
    },
})
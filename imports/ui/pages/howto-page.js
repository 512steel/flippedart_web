import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './howto-page.html';


Template.howto_page.helpers({
    currentUsername: function() {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    }
});

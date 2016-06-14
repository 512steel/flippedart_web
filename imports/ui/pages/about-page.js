import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './about-page.html';


Template.about_page.helpers({
    currentUsername: function() {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    }
});
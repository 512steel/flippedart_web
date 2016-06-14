import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './home-page.html';


Template.home_page.onRendered(function() {

    Meteor.setTimeout(function(){
        var el1 = new Foundation.Equalizer($('#home-equalized-1'));
        var el2 = new Foundation.Equalizer($('#home-equalized-2'));
    }, 150);
});

Template.home_page.helpers({
    currrentUsername: function() {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    }
});

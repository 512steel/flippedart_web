import './feedback-thanks-page.html';

Template.feedback_thanks_page.helpers({
    currentUsername: function () {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    }
});

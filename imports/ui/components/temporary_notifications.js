Template.temporaryNotifications.helpers({
    temporaryNotifications: function() {
        return TemporaryNotifications.find();
    }
});

Template.temporaryNotification.onRendered(function() {
    var notification = this.data;
    Meteor.setTimeout(function() {
        TemporaryNotifications.remove(notification._id);
    }, 4200);
});
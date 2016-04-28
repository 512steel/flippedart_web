Template.userPostItem.helpers({
    ownPost: function() {
        return this.userId === Meteor.userId();
    },
    upvotedClass: function() {
        var userId = Meteor.userId();
        if (userId && !_.include(this.voters, userId)) {
            return 'btn-primary upvotable';
        }
        else {
            return 'disabled';
        }
    },
    hasImage: function() {
        if (this.imageLinks.length > 0) {
            return true;
        }
    },
    flaggedClass: function() {
        var userId = Meteor.userId();
        if (userId && !_.include(this.flaggers, userId)) {
            return 'flaggable';
        }
        else {
            return 'unflag';
        }
    },
    flagged: function() {
        var userId = Meteor.userId();
        if (userId && _.include(this.flaggers, userId)) {
            return true;
        }
        else {
            return false;
        }
    },
    inappropriate: function() {
        var flagThreshold = 1;
        if (this.flags > flagThreshold) {
            return true;
        }
        else {
            return false;
        }
    }
});

Template.userPostItem.events({
    'click .upvotable': function(e) {
        e.preventDefault();
        Meteor.call('userPostUpvote', this._id);
    },
    'click .flaggable': function(e) {
        e.preventDefault();
        if (Meteor.user()) {
            Meteor.call('userPostFlag', this._id);
        }
        else {
            throwError("You must sign in to flag a post");
        }
    },
    'click .unflag': function (e) {
        e.preventDefault();
        if (Meteor.user()) {
            Meteor.call('userPostUnflag', this._id);
        }
        else {
            throwError("You must sign in to flag a post");
        }
    }
});
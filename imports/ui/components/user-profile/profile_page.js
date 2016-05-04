Template.profilePage.onRendered(function () {
        if (!this.data.user) {
            //Router.go('my-account', {});
        }
    }
);

Template.profilePage.helpers({
    isProfileOwner: function () {
        if (Meteor.user() && this.user) {
            if (this.user._id == Meteor.userId()) {
                return true;
            }
            else {
                return false;
            }
        }
        return false;
    },
    profileExists: function() {
        if (!this.user) {
            return false;
        }
        else return true;
    },
    hasUserPosts: function() {
        if (this.user) {
            if (this.userPosts.fetch().length > 0) {
                return true;
            }
        }
    }
});

Template.mobileProfileButtons.helpers({
    isProfileOwner: function () {
        if (Meteor.user() && this.user) {
            if (this.user._id == Meteor.userId()) {
                return true;
            }
            else {
                return false;
            }
        }
        return false;
    }
});
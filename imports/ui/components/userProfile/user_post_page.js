Template.userPostPage.helpers({
    ownPost: function() {
        return this.userId === Meteor.userId();
    },
    comments: function() {
        return Comments.find({userPostId: this._id});  //FIXME - should this be in the router?
    }
});
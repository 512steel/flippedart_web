Template.commentItem.onCreated(function() {
    this.showCommentEdit = new ReactiveVar(false);
});

Template.commentItem.helpers({
    ownPost: function () {
        return this.userId === Meteor.userId();
    },
    showCommentEdit: function() {
        return Template.instance().showCommentEdit.get();
    }
});

Template.commentItem.events({
    'click .comment-edit': function (e, template) {
        e.preventDefault();

        //toggle the "comment edit" template
        template.showCommentEdit.set(!template.showCommentEdit.get());
    }
});
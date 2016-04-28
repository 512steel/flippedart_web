Template.commentEdit.onCreated(function() {
    Session.set('commentEditErrors', {});
});

Template.commentEdit.helpers({
    errorMessage: function(field) {
        return Session.get('commentEditErrors')[field];
    },
    errorClass: function(field) {
        return !!Session.get('commentEditErrors')[field] ? 'has-error' : '';
    }
});

Template.commentEdit.events({
    'submit form': function(e, template) {
        e.preventDefault();

        var currentCommentId = this._id;
        var comment = {
            body: $(e.target).find('[name=body]').val(),
            userPostId: this.userPostId
        };

        var errors = validateComment(comment);
        if (errors.body) {
            return Session.set('commentEditErrors', errors);
        }

        Meteor.call('commentEdit', comment, currentCommentId, function(error, result) {
            if (error) {
                throwError(error.reason);
            }

            //hide the edit form after it's been submitted
            //fixme: this is apparently super bad practice - https://forums.meteor.com/t/access-parent-template-reactivevar-from-child-template/973
            template.view.parentView.parentView._templateInstance.showCommentEdit.set(false);
        });
    },
    'click .delete': function(e) {
        e.preventDefault();

        if (confirm("Are you sure you want to delete this comment?")) {
            var currentCommentId = this._id;
            Comments.remove(currentCommentId);
            Meteor.call('userPostDecrementComments', this.userPostId);
        }
    }
});

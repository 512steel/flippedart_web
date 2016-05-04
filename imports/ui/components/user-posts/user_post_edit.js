Template.userPostEdit.onCreated(function() {
    Session.set('userPostEditErrors', {});
});

Template.userPostEdit.helpers({
    errorMessage: function(field) {
        return Session.get('userPostEditErrors')[field];
    },
    errorClass: function(field) {
        return !!Session.get('userPostEditErrors')[field] ? 'has-error' : '';
    }
});

Template.userPostEdit.events({
    'submit form': function(e) {
        e.preventDefault();

        currentUserPostId = this._id;
        var userPost = {
            text: $(e.target).find('[name=userPostText]').val(),

            //TODO: collect actual info on the rest of these fields:
            imageLinks: [],
            tag: ''
        };

        var errors = validateUserPost(userPost);
        if (errors.text) {
            return Session.set('userPostEditErrors', errors);
        }

        Meteor.call('userPostEdit', userPost, currentUserPostId, function(error, result) {
            if (error) {
                throwError(error.reason);
            }

            Router.go('userPostPage', {
                username: encodeURI(Meteor.user().username),
                userPostId: currentUserPostId
            });
        });
    },
    'click .delete': function(e) {
        e.preventDefault();

        if (confirm("Are you sure you want to delete this post?")) {
            var currentUserPostId = this._id;
            UserPosts.remove(currentUserPostId);
            Router.go('chronologicalUserPosts', {username: this.author});
        }
    }
});

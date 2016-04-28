Template.userPostSubmit.onCreated(function() {
    Session.set('userPostSubmitErrors', {});
    Session.set('isPostUploading', false);
});

Template.userPostSubmit.helpers({
    errorMessage: function(field) {
        return Session.get('userPostSubmitErrors')[field];
    },
    errorClass: function (field) {
        return !!Session.get('userPostSubmitErrors')[field] ? 'has-error' : '';
    },
    isUploading: function() {
        return Session.get('isPostUploading');
    },
    uploadingCopy: function() {
        return "Posting...";
    }
});

Template.userPostSubmit.events({
    'submit form.user-post-submit': function(e) {
        e.preventDefault();

        var imageLinks = [];

        Session.set('isPostUploading', true);

        $(".user-post-submit input[type='file']").each(function() {
            var files = this.files;

            for (var i = 0; i < files.length; i++) {
                if (files[i].size > 2000000) {
                    throwError("One of your images is bigger than the 2MB upload limit");
                    Session.set('isPostUploading', false);
                    return;
                }
            }

            if (files.length > 4) {
                throwError("Sorry, you are trying to upload " + files.length.toString() + " images.  The maximum you can upload is 4.");
            }
            else if (files.length > 0) {
                //user is uploading an image

                var fileIndex = 0;
                Cloudinary.upload(files, {
                    folder: "secret"
                }, function(error, result) {
                    if (error) {
                        throwError(error);
                    }

                    //FIXME - since Cloudinary.upload() is asynchronous there's no way to check if there's an error before submitting the userPost and it will likely hang on `null.public_id`

                    imageLinks.push(result.public_id);
                    var userPost = {
                        text: $(e.target).find('[name=userPostText]').val(),
                        imageLinks: imageLinks,

                        //TODO: this will become relevant later:
                        tag: ''
                    };

                    var errors = validateUserPost(userPost);
                    if (errors.text) {
                        return Session.set('userPostSubmitErrors', errors);
                    }

                    fileIndex++;  //hack to only insert the post after all photos are uploaded

                    if (fileIndex >= files.length) {
                        Meteor.call('userPostInsert', userPost, function(error, result) {
                            if (error) {
                                throwError(error.reason);
                            }

                            Session.set('isPostUploading', false);

                            Router.go('userPostPage', {
                                username: encodeURI(Meteor.user().username),
                                userPostId: result._id
                            });
                        });
                    }
                });
            }
            else {
                //no images

                var userPost = {
                    text: $(e.target).find('[name=userPostText]').val(),

                    //TODO: collect actual info on the rest of these fields on the client:
                    imageLinks: [],
                    tag: ''
                };

                var errors = validateUserPost(userPost);
                if (errors.text) {
                    return Session.set('userPostSubmitErrors', errors);
                }

                Meteor.call('userPostInsert', userPost, function(error, result) {
                    if (error) {
                        throwError(error.reason);
                    }

                    Session.set('isPostUploading', false);

                    Router.go('userPostPage', {
                        username: encodeURI(Meteor.user().username),
                        userPostId: result._id
                    });
                });
            }

        });
    }
});

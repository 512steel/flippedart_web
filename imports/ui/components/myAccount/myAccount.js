Template.myAccount.helpers({
    signedInUserAttributes: function() {
        if (this.user && this.userAttributes) {
            return true;
        }
        else {
            return false;
        }
    }
});

Template.myAccount.events({
    'submit form.start-profile': function(e) {
        e.preventDefault();

        $("form.start-profile input[type='file']").each(function() {
            var files = this.files;

            for (var i = 0; i < files.length; i++) {
                if (files[i].size > 2000000) {
                    throwError("Sorry, your is bigger than the 2MB upload limit");
                    return;
                }
            }

            if (files.length > 1) {
                throwError("You can only have one profile photo at a time");
            }
            else if(files.length > 0) {
                //user is uploading a profile photo

                if (Meteor.user()) {
                    Cloudinary.upload(files, {
                        folder: "secret"
                    }, function(error, result) {
                        if (error) {
                            throwError(error);
                        }

                        //FIXME - can't actually check whether there's an error before getting the public id on the asynchronous upload
                        var userAttributes = {
                            bio: $(e.target).find('[name=bio]').val(),
                            location: $(e.target).find('[name=location]').val(),
                            profilePhotoLink: result.public_id
                        };

                        Meteor.call('userAttributesInsert', userAttributes, function(err, result) {
                            if (err) {
                                throwError(err.reason);
                            }

                            Router.go('myAccount', {});
                        });
                    });
                }
            }
            else {
                //user is not uploading a profile photo

                var userAttributes = {
                    bio: $(e.target).find('[name=bio]').val(),
                    location: $(e.target).find('[name=location]').val(),
                    profilePhotoLink: ' '
                };

                if (Meteor.user()) {
                    Meteor.call('userAttributesInsert', userAttributes, function(error, result) {
                        if (error) {
                            throwError(error.reason);
                        }

                        Router.go('myAccount', {});
                    });
                }
            }
        });
    },
    'submit form.edit-profile': function(e) {
        e.preventDefault();

        $("form.edit-profile input[type='file']").each(function() {
            var files = this.files;

            for (var i = 0; i < files.length; i++) {
                if (files[i].size > 2000000) {
                    throwError("Sorry, your is bigger than the 2MB upload limit");
                    return;
                }
            }

            if (files.length > 1) {
                throwError("You can only have one profile photo at a time");
            }
            else if(files.length > 0) {
                //user is uploading a profile photo

                if (Meteor.user()) {
                    Cloudinary.upload(files, {
                        folder: "secret"
                    }, function(error, result) {
                        if (error) {
                            throwError(error);
                        }

                        //FIXME - can't actually check whether there's an error before getting the public id on the asynchronous upload
                        var userAttributes = {
                            bio: $(e.target).find('[name=bio]').val(),
                            location: $(e.target).find('[name=location]').val(),
                            profilePhotoLink: result.public_id
                        };

                        Meteor.call('userAttributesEdit', userAttributes, function(err, result) {
                            if (err) {
                                throwError(err.reason);
                            }

                            throwSuccess("Saved!");
                            Router.go('myAccount', {});
                        });
                    });
                }
            }
            else {
                //user is not uploading a profile photo

                var userAttributes = {
                    bio: $(e.target).find('[name=bio]').val(),
                    location: $(e.target).find('[name=location]').val(),
                    profilePhotoLink: ' '
                };

                if (Meteor.user()) {
                    Meteor.call('userAttributesEdit', userAttributes, function(err, result) {
                        if (err) {
                            throwError(err.reason);
                        }

                        throwSuccess("Saved!");
                        Router.go('myAccount', {});
                    });
                }
            }
        });
    }
});
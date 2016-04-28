Template.itemSubmit.onCreated(function() {
    Session.set('itemsToSubmit', [currentSessionItemId]);
    Session.set('itemSubmitErrors', {});
    Session.set('areItemsUploading', false);
});

Template.itemSubmit.helpers({
    singleItems: function() {
        //user can choose to upload multiple items at once, each contained within
        //its own "singleItemSubmit" template,
        return Session.get('itemsToSubmit');
    },
    //NOTE: error messages are wonky here since they aren't local to single items in this setup
    errorMessage: function(field) {
        return Session.get('itemSubmitErrors')[field];
    }
});

Template.addItemsButton.helpers({
    singleItemsCount: function() {
        var arr = Session.get('itemsToSubmit');
        return arr.length;
    },
    isUploading: function() {
        return Session.get('areItemsUploading');
    },
    uploadingCopy: function() {
        return "Uploading...";
    }
});

Template.singleItemSubmit.helpers({

});

var itemLimit = 10;
var photoLimit = 5;
Template.itemSubmit.events({
    'click .item-submit-add-single-item': function(e) {
        e.preventDefault();

        var currentItemsCount = $(".single-item-form").length;

        if (currentItemsCount >= itemLimit) {
            throwError("Sorry, you can only add up to " + itemLimit.toString() + " items at a time.");
        }
        else {
            //for some reason, pushing directly to the session variable returns a number, not an array
            var arr = Session.get('itemsToSubmit');

            if (arr.length < itemLimit) {
                arr.push(nextSessionItemId());
                Session.set('itemsToSubmit', arr);
            }
        }
    },
    'submit form.item-submit-form': function (e) {
        e.preventDefault();

        var items = [];
        var errors = {};
        var currentItemsCount = $(".single-item-form").length;
        var successfulItems = 0;

        if (currentItemsCount > itemLimit) {
            var error = {'count': "Please add a maximum of ten items at once"};
            return Session.set('itemSubmitErrors', error);
        }
        else {
            Session.set('areItemsUploading', true);

            $(e.target).find('.single-item-form').each(function(idx) {

                var formToClose = $(this).find('.close-single-item-submit');

                var titleVal = $(this).find('.single-item-title').val();
                var descriptionVal = $(this).find('.single-item-description').val();
                var tagVal = $(this).find('.single-item-tag').val();
                var availableVal = $(this).find('.single-item-available').is(':checked');

                $(this).find('input[type="file"]').each(function() {
                    var files = this.files;
                    var imageLinks = [];

                    for (var i = 0; i < files.length; i++) {
                        if (files[i].size > 2000000) {
                            throwError("One of your images is bigger than the 2MB upload limit");
                            Session.set('areItemsUploading', false);
                            return;
                        }
                    }

                    if (files.length > 4) {
                        throwError("Sorry, one of your items has " + files.length.toString() + " images.  The maximum you can upload is 4.");
                        Session.set('areItemsUploading', false);
                    }
                    else if (files.length > 0) {
                        var fileIndex = 0;
                        Cloudinary.upload(files, {
                            folder: "secret"
                        }, function(error, result) {
                            if (error) {
                                throwError(error);
                            }

                            //FIXME - since Cloudinary.upload() is asynchronous there's no way to check if there's an error before submitting the userPost and it will likely hang on `null.public_id`

                            imageLinks.push(result.public_id);

                            var item = {
                                title: titleVal,
                                description: descriptionVal,
                                tag: tagVal ? tagVal : " ",
                                availableForCheckout: availableVal,
                                imageLinks: imageLinks
                            };

                            errors = validateExchangeItem(item);
                            if (errors.title || errors.description || errors.imageLinks) {
                                return Session.set('itemSubmitErrors', errors);
                            }

                            fileIndex++;  //hack to only insert the post after all photos are uploaded

                            if (fileIndex >= files.length) {
                                Meteor.call('exchangeItemInsert', item, function(error, result) {
                                    if (error) {
                                        throwError(error.reason);
                                        errors.server_message = error.reason;
                                    }
                                    else {
                                        formToClose.trigger('change');
                                        successfulItems++;

                                        if (successfulItems == currentItemsCount) {
                                            if (currentItemsCount > 1) {
                                                throwSuccess("Your items have been added!");
                                            }
                                            else {
                                                throwSuccess("Your item has been added!");
                                            }

                                            //reset the item submit forms
                                            var arr = [nextSessionItemId()];
                                            Session.set('itemsToSubmit', arr);
                                            Session.set('areItemsUploading', false);

                                            Router.go('userInventoryPage', {
                                                username: encodeURI(Meteor.user().username)
                                            });
                                        }
                                    }
                                });

                                if (errors.title || errors.description || errors.imageLinks || errors.server_message) {
                                    Session.set('itemSubmitErrors', errors);
                                }
                            }
                        });
                    }
                    else {
                        throwError("You must include at least one photo per item.");
                        Session.set('areItemsUploading', false);
                    }
                });
            });
        }
    }
});

Template.singleItemSubmit.events({
    'click .close-single-item-submit': function(e, template) {
        var arr = Session.get('itemsToSubmit');
        arr.splice(arr.indexOf(parseInt(this)), 1);
        Session.set('itemsToSubmit', arr);
        return false;
    },
    'change .close-single-item-submit': function(e, template) {
        //this removes item-submit forms from the session one by one, in case many are submitted and only one throws errors
        e.preventDefault();
        var arr = Session.get('itemsToSubmit');
        arr.splice(arr.indexOf(parseInt(this)), 1);
        Session.set('itemsToSubmit', arr);
    }
});

var currentSessionItemId = 1;
var nextSessionItemId = function() {
    //always increment
    currentSessionItemId += 1;
    return currentSessionItemId;
};
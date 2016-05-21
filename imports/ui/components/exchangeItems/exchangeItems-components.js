//TODO: refactor these into separate js files

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';

import { ExchangeItems } from '../../../api/exchange-items/exchange-items.js';
import {
    //insert as exchangeItemInsert,
    insertMany as exchangeItemsInsertMany,
    edit as exchangeItemEdit,
    deleteItem as exchangeItemDeleteItem } from '../../../api/exchange-items/methods.js';

import { requestTransaction } from '../../../api/transactions/methods.js';

import { UPLOAD_LIMITS,
         PROJECT_TAGS } from '../../lib/globals.js';


import './item-single-page.html';
import './item-single-card.html';
import './item_edit.html';
import './item_submit.html';
import './items-inventory-page.html';

Template.project_single_page.onCreated(function() {
    this.getExchangeItemId = () => FlowRouter.getParam('exchangeItemId');
    this.getExchangeItem = () => ExchangeItems.findOne({});
    this.getPageUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('exchangeItems.single', this.getExchangeItemId());
    });
});

Template.projects_user_all.onCreated(function() {
    this.requestedProjectNames = new ReactiveVar([]);
    this.requestedProjectIDs = new ReactiveVar([]);

    this.getPageUsername = () => FlowRouter.getParam('username');
    this.getExchangeItems = () => ExchangeItems.find({});

    const projectSortOptions = {sort: {createdAt: -1}};

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('exchangeItems.user', this.getPageUsername(), projectSortOptions);
    });
});

Template.project_single_card.onCreated(function() {
    this.showItemEdit = new ReactiveVar(false);

    this.getExchangeItem = () => ExchangeItems.findOne({});

    // Subscriptions go in here
    this.autorun(() => {

    });
});

Template.item_edit.onCreated(function itemEditOnCreated() {
    // Subscriptions go in here
    this.autorun(() => {

    });
});

Template.item_submit.onCreated(function itemSubmitOnCreated() {
    // Subscriptions go in here
    this.autorun(() => {

    });

    Session.set('itemsToSubmit', [currentSessionItemId]);
    Session.set('itemSubmitErrors', {}); //TODO: get rid of this?
    Session.set('areItemsUploading', false);
});


Template.project_single_page.onRendered(function itemSinglePageOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.item_edit.onRendered(function itemEditOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.item_submit.onRendered(function itemSubmitOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});


Template.project_single_page.helpers({
    exchangeItem: function() {
        return Template.instance().getExchangeItem();
    },
    isItemOwner: function() {
        const exchangeItem = Template.instance().getExchangeItem();
        const currentUser = Meteor.user();

        if (exchangeItem && currentUser) {
            return exchangeItem.ownerName == currentUser.username;
        }
    },
    isExchangeItemAvailable: function () {
        const exchangeItem = Template.instance().getExchangeItem();

        if (exchangeItem) {
            return (exchangeItem.available && !exchangeItem.locked);
        }
    },
});

Template.projects_user_all.helpers({
    isProfileOwner: function() {
        return Meteor.user().username === FlowRouter.getParam('username');
    },
    exchangeItems: function() {
        return Template.instance().getExchangeItems();
    },
    currentPageUsername: function() {
        return Template.instance().getPageUsername();
    },
    requestedProjectNames: function() {
        return Template.instance().requestedProjectNames.get();
    },
    requestedProjectIDs: function() {
        return Template.instance().requestedProjectIDs.get();
    },
    isExchangeItemAvailable: function (exchangeItem) {
        return (exchangeItem.available && !exchangeItem.locked);
    },
    hasExchangeItems: function() {
        return Template.instance().getExchangeItems().count() > 0;
    },
});

Template.project_single_card.helpers({
    isItemOwner: function() {
        const exchangeItem = Template.instance().getExchangeItem();
        const currentUser = Meteor.user();

        if (exchangeItem && currentUser) {
            return exchangeItem.ownerName == currentUser.username;
        }
    },
    addendumsWithAuthors: function() {
        const exchangeItem = Template.instance().getExchangeItem();

        var addendumsWithAuthorsArr = [];
        const addendumAuthorsLength = exchangeItem.addendumAuthors ? exchangeItem.addendumAuthors.length : 0;
        for (var i = 0; i < addendumAuthorsLength; i++) {
            addendumsWithAuthorsArr.push(
                {
                    addendum: exchangeItem.addendums[i],
                    author: exchangeItem.addendumAuthors[i],
                }
            );
        }

        return addendumsWithAuthorsArr;
    },

    showItemEdit: function() {
        if (this && !this.locked) {
            return Template.instance().showItemEdit.get();
        }
    },
    editClass: function() {
        //UI-hacky way of getting around handlebars' nested ifs

        if (this && !this.locked) {
            return "item-edit";
        }
        else return "hidden";
    },
});

Template.item_edit.helpers({
    isFirstOwner: function() {
        return !this.pastOwnerNames.length;
        //TODO: display a tooltip informing the client that the title of a project can't be changed once it's changed owners
    },
    isAvailable: function() {
        return this.available;
    }
});

Template.item_submit.helpers({
    singleItems: function() {
        //user can choose to upload multiple items at once, each contained within
        //its own "single_item_submit" template,
        return Session.get('itemsToSubmit');
    },
});
Template.add_items_button.helpers({
    hasSingleItems: function() {
        return Session.get('itemsToSubmit').length;
    },
    isUploading: function() {
        return Session.get('areItemsUploading');
    },
    uploadingCopy: function() {
        return "Uploading...";
    },
    addProjectCopy: function() {
        if (Session.get('itemsToSubmit').length > 1)
            return 'Add projects';
        else
            return 'Add project';
    }
});
Template.single_item_submit.helpers({
    projectTags: function() {
        return PROJECT_TAGS;
    }
});


Template.project_single_page.events({
    'click form .single-item-request-form-button': function(e) {
        e.preventDefault();

        const exchangeItem = Template.instance().getExchangeItem();

        if (exchangeItem && Meteor.user()) {
            var itemIds = [];

            itemIds.push($(e.target).parent().find('.inventory-single-item-id').text());

            console.log('about to requestTransaction()');
            console.log(Template.instance().getPageUsername());

            requestTransaction.call({
                requesteeName: Template.instance().getPageUsername(),
                itemIds: itemIds,
            }, (err, res) => {
                if (err) {
                    //FIXME: throwError visibly to client
                    console.log(err);
                }
                else {
                    //FIXME: throwSuccess visibly to the client
                    console.log('You have successfully requested this project.');

                    //NOTE: 'res' is the return value of the newly-inserted Transaction.
                    FlowRouter.go('exchanges.user.single', {exchangeId: res});
                }
            });
        }
    }
});

Template.projects_user_all.events({
    'change .request-checkout-checkbox': function (e, template) {
        console.log('in change .request-checkout-checkbox event');

        var isOneChecked = $(".item-request-form input[type='checkbox']:checked").length > 0;

        var nameArr = Template.instance().requestedProjectNames.get();
        var idArr = Template.instance().requestedProjectIDs.get();
        if (e.target.checked) {
            //push projects to reactive arrays
            nameArr.push(this.title);
            idArr.push(this._id);
        }
        else {
            //remove projects from reactive arrays
            var index = nameArr.indexOf(this.title);
            if (index > -1)
                nameArr.splice(index, 1);

            index = idArr.indexOf(this._id);
            if (index > -1)
                idArr.splice(index, 1);
        }
        Template.instance().requestedProjectNames.set(nameArr);
        Template.instance().requestedProjectIDs.set(idArr);

        $('.multiple-item-request-form-button').prop('disabled', !isOneChecked);
    },
    'click .multiple-item-request-form-button': function(e) {
        e.preventDefault();
        console.log('in multi-request event')

        const projectIds = Template.instance().requestedProjectIDs.get();
        if (projectIds.length && Meteor.user()) {
            console.log('about to requestTransaction() for multiple projects!');

            requestTransaction.call({
                requesteeName: Template.instance().getPageUsername(),
                itemIds: projectIds,
            }/*, throwError */);

            //TODO: router.go('chatWindow');
        }
        else {
            console.log('[error] Could not make the transaction request');
        }
    }
});

Template.project_single_card.events({
    'click .item-edit': function (e, template) {
        e.preventDefault();

        //toggle the "item edit" template
        template.showItemEdit.set(!template.showItemEdit.get());
    }
});

Template.item_edit.events({
    'submit form.item-edit-form': function(e, template) {

        //FIXME: include the ability to edit the "imageLinks"

        e.preventDefault();

        console.log(this);

        const title = $(e.target).find('[name=title]').val();
        const description = $(e.target).find('[name=description]').val();
        const location = $(e.target).find('[name=location]').val();
        const imageLinks = $(e.target).find('[name=imageLinks]').val();
        const available = $(e.target).find('[name=availableCheckbox]').is(':checked');
        const tag = $(e.target).find('[name=tag]').val();

        exchangeItemEdit.call({
            exchangeItemId: this._id,
            title: title ? title : this.title,
            description: description ? description : this.description,
            location: location ? location : this.location,
            imageLinks: imageLinks ? imageLinks : this.imageLinks,  //TODO: ability to edit or add to a project's imageLinks array
            available: available,
            tag: tag ? tag : this.tag,  //TODO: add a "tag" edit field
        }/*, displayError */);

        //NOTE: using parent() is ugly, but it's the only way I could think of to get the value of project_single_card's reactiveVar from this template
        Template.instance().parent().showItemEdit.set(!Template.instance().parent().showItemEdit.get());

    },
    'click .delete-item': function(e) {
        e.preventDefault();

        //TODO: sweet alert for nicer looking "confirm" and "alert" boxes
        if (confirm("Are you sure you want to delete this project?  It won't be available for people to checkout any longer.")) {
            exchangeItemDeleteItem.call({
                exchangeItemId: this._id,
            }, (err, res) => {
                if (err) {
                    //FIXME: throwError visibly to client
                    console.log(err);
                }
                else {
                    //FIXME: throwSuccess visibly to the client
                    console.log('You have successfully deleted this project.');

                    FlowRouter.go('profile.projects', {username: FlowRouter.getParam('username')});
                }
            });
        }
    }
});

Template.item_submit.events({
    'click .item-submit-add-single-item': function(e) {
        e.preventDefault();

        if ($(".single-item-form").length >= UPLOAD_LIMITS.projects) {
            //TODO: throw a visible error to the client here
            console.log('Sorry, you can\'t add more than ' + UPLOAD_LIMITS.projects + ' projects at one time');
        }
        else {
            //for some reason, pushing directly to the session variable returns a number, not an array
            var arr = Session.get('itemsToSubmit');

            if (arr.length < UPLOAD_LIMITS.projects) {
                arr.push(nextSessionItemId());
                Session.set('itemsToSubmit', arr);
            }
        }
    },
    'submit form.item-submit-form': function (e) {
        e.preventDefault();

        var items = [];
        var erros = {};
        var currentItemsCount = $(".single-item-form").length;
        var successfulItems = 0;

        if (currentItemsCount > UPLOAD_LIMITS.projects) {
            console.log('Please add a maximum of ' + UPLOAD_LIMITS.projects + ' projects at a time.');
            //FIXME: throwError visibly to the client
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
                            //FIXME: throw this error visibly to client
                            console.log("One of your images is bigger than the 2MB upload limit");
                            Session.set('areItemsUploading', false);
                            return;
                        }
                    }

                    if (files.length > UPLOAD_LIMITS.images) {
                        //FIXME: throw this error visibly to client
                        console.log('Sorry, one of your items has ' + files.length.toString() + ' images.  The maximum you can upload is ' + UPLOAD_LIMITS.images + '.');
                        Session.set('areItemsUploading', false);
                    }
                    else if (files.length > 0) {
                        var fileIndex = 0;
                        Cloudinary.upload(files, {
                            folder: "secret"  //FIXME: change this folder to "flippedart"
                        }, function(error, result) {
                            if (error) {
                                //FIXME: throw error visibly to client
                                console.log(error);
                            }

                            //FIXME - since Cloudinary.upload() is asynchronous there's no way to check if there's an error before submitting the userPost and it will likely hang on `null.public_id`
                            // -- can we check "if (result) first?"

                            imageLinks.push(result.public_id);

                            var item = {
                                title: titleVal,
                                description: descriptionVal,
                                tag: tagVal ? tagVal : " ",
                                available: availableVal,
                                imageLinks: imageLinks
                            };

                            /*errors = validateExchangeItem(item);
                            if (errors.title || errors.description || errors.imageLinks) {
                                return Session.set('itemSubmitErrors', errors);
                            }*/

                            fileIndex++;  //hack to only insert the post after all photos are uploaded
                            if (fileIndex >= files.length) {

                                //FIXME: remove one of the outer loops to insert all items at once
                                exchangeItemsInsertMany.call({
                                    itemArray: [item]
                                }, (err, res) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        formToClose.trigger('change');
                                        successfulItems++;

                                        if (successfulItems == currentItemsCount) {
                                            if (currentItemsCount > 1) {
                                                //FIXME: throwSuccess visibly to client
                                                console.log('Your projects have been added!');
                                            }
                                            else {
                                                //FIXME: throwSuccess visibly to client
                                                console.log('Your project has been added!');
                                            }

                                            //reset the item submit forms
                                            var arr = [nextSessionItemId()];
                                            Session.set('itemsToSubmit', arr);
                                            Session.set('areItemsUploading', false);

                                            if (Meteor.user())
                                                FlowRouter.go('profile.projects', {username: Meteor.user().username});
                                        }
                                    }
                                });
                            }
                        });
                    }
                    else {
                        //FIXME: throw this error visibly to client
                        console.log("You must include at least one photo per project.");
                        Session.set('areItemsUploading', false);
                    }
                });
            });
        }

        //FIXME: clear the "text" field after submitting.
    }
});

Template.single_item_submit.events({
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
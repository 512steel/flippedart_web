import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';
import { DocHead } from 'meteor/kadira:dochead';

import { ExchangeItems } from '../../../api/exchange-items/exchange-items.js';
import {
    //insert as exchangeItemInsert,
    insertMany as exchangeItemsInsertMany,
    edit as exchangeItemEdit,
    deleteItem as exchangeItemDeleteItem } from '../../../api/exchange-items/methods.js';

import { requestTransaction } from '../../../api/transactions/methods.js';

import {
    UPLOAD_LIMITS,
    PROJECT_TAGS,
    HEAD_DEFAULTS } from '../../lib/globals.js';

import {
    throwError,
    throwSuccess } from '../../lib/temporary-alerts.js';


import './item-single-page.html';
import './item-single-card.html';
import './item_edit.html';
import './item_submit.html';
import './items-inventory-page.html';

import './../photoTiles/photo-tiles-components.js';


Template.project_single_page.onCreated(function() {
    this.getExchangeItemId = () => FlowRouter.getParam('exchangeItemId');
    this.getExchangeItem = () => ExchangeItems.findOne({});
    this.getPageUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('exchangeItems.single', this.getExchangeItemId());
    });

    var titleString = "";
    if (this.getExchangeItem()) {
        titleString += this.getExchangeItem().title.substr(0,25);
        titleString += this.getExchangeItem().title.length > 25 ? "... - " : " - ";
    }
    titleString += this.getPageUsername() + "'s projects | " + HEAD_DEFAULTS.title_short;
    DocHead.setTitle(titleString);
});

Template.projects_user_all.onCreated(function() {
    this.requestedProjectNames = new ReactiveVar([]);
    this.requestedProjectIDs = new ReactiveVar([]);

    this.getPageUsername = () => FlowRouter.getParam('username');
    this.getExchangeItems = () => ExchangeItems.find({});

    // Subscriptions go in here
    this.autorun(() => {
        this.projectsSubscription = Meteor.subscribeWithPagination('exchangeItems.user', this.getPageUsername(), {sort: {createdAt: -1}}, 5);
    });
});

Template.projects_user_all_page.onCreated(function() {

    this.getPageUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {

    });

    var titleString = this.getPageUsername() + "'s projects | " + HEAD_DEFAULTS.title_short;
    DocHead.setTitle(titleString);
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

Template.project_single_card.onRendered(function projectSingleCardOnRendered() {
    $('.has-tip-item-card-locked').each(function() {
        new Foundation.Tooltip($(this));
    });
    $('.has-tip-item-card-unlocked').each(function() {
        new Foundation.Tooltip($(this));
    });
    $('.has-tip-item-card-available').each(function() {
        new Foundation.Tooltip($(this));
    });
    $('.has-tip-item-card-unavailable').each(function() {
        new Foundation.Tooltip($(this));
    });
    //FIXME: Foundation has a display bug on multiple tooltips, where the "nub" is in front of the text
});

Template.item_edit.onRendered(function itemEditOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });

    this.tooltip = new Foundation.Tooltip($('.has-tip-item-edit'));

    autosize($('textarea'));
});

Template.item_submit.onRendered(function itemSubmitOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.single_item_submit.onRendered(function() {
    $('.has-tip-item-submit').each(function() {
        new Foundation.Tooltip($(this));
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

    exchangeItems: function() {
        return Template.instance().getExchangeItems();
    },
    hasExchangeItems: function() {
        return Template.instance().getExchangeItems().count() > 0;
    },
    hasMoreExchangeItems: function() {
        const sub = Template.instance().projectsSubscription;

        return sub.loaded() < Counts.get('exchangeItems.user.count') &&
            sub.loaded() == sub.limit();
    },
});

Template.projects_user_all_page.helpers({
    userPageUsername: function() {
        return Template.instance().getPageUsername();
    },
    ownPage: function() {
        if (Meteor.user()) {
            return Meteor.user().username === Template.instance().getPageUsername();
        }
    }
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
        var addendumsWithAuthorsArr = [];
        const addendumAuthorsLength = this.addendumAuthors ? this.addendumAuthors.length : 0;
        for (var i = 0; i < addendumAuthorsLength; i++) {
            addendumsWithAuthorsArr.push(
                {
                    addendum: this.addendums[i],
                    author: this.addendumAuthors[i],
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
        else return "invisible";
    },

    //FIXME: more personal language here
    tooltipLocked: function() {
        return "This project is already a part of an exchange, so it can't be requested at this time.";
    },
    tooltipUnlocked: function() {
        return "This project is in the possession of its owner.  If its owner has made it available, the project may be requested.";
    },
    tooltipAvailable: function() {
        return "This project is able to be requested.";
    },
    tooltipUnavailable: function() {
        return "This project is unable to be requested at this time.";
    },
    tooltipLockedYours: function() {
        return "This project is a part of an exchange, so it can't be edited. Message the person who requested this project to complete the exchange.";
    },
    tooltipUnlockedYours: function() {
        return "You own this project and it is not currently in the process of being exchanged.";
    },
    tooltipAvailableYours: function() {
        return "You've made this project available to be requested.";
    },
    tooltipUnavailableYours: function() {
        return "You've made this project unable to be requested.";
    },

});

Template.item_edit.helpers({
    isFirstOwner: function() {
        return !this.pastOwnerNames.length;
        //TODO: display a tooltip informing the client that the title of a project can't be changed once it's changed owners
    },
    isAvailable: function() {
        return this.available;
    },

    latestAddendum: function() {
        if (Meteor.user()) {
            if (!this.pastOwnerNames.length) {
                return this.description;
            }
            else if (this.addendumAuthors.length &&
                     this.addendumAuthors[this.addendumAuthors.length-1] == Meteor.user().username) {
                return this.addendums[this.addendums.length-1];
            }
        }
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
    },
    maxPhotoUploadCount: function() {
        return UPLOAD_LIMITS.images;
    },
    singleItemSubmitTemplateId: function() {
        return this;
    }
});


Template.project_single_page.events({
    'click form .single-item-request-form-button': function(e) {
        e.preventDefault();

        const exchangeItem = Template.instance().getExchangeItem();

        if (exchangeItem && Meteor.user()) {
            var itemIds = [];

            itemIds.push($(e.target).parent().find('.inventory-single-item-id').text());

            requestTransaction.call({
                requesteeName: Template.instance().getPageUsername(),
                itemIds: itemIds,
            }, (err, res) => {
                if (err) {
                    throwError(err.reason);
                }
                else {
                    throwSuccess('You have successfully requested this project.  Keep an eye on your notifications for the progress of your exchange.');

                    //NOTE: 'res' is the return value of the newly-inserted Transaction.
                    FlowRouter.go('exchanges.user.single', {username: Meteor.user().username, exchangeId: res});
                }
            });
        }
    }
});

Template.projects_user_all.events({
    'change .request-checkout-checkbox': function (e, template) {
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

        const projectIds = Template.instance().requestedProjectIDs.get();
        if (projectIds.length && Meteor.user()) {

            requestTransaction.call({
                requesteeName: Template.instance().getPageUsername(),
                itemIds: projectIds,
            }, (err, res) => {
                //NOTE: 'res' is the return value of the newly-inserted Transaction.
                FlowRouter.go('exchanges.user.single', {username: Meteor.user().username, exchangeId: res});
            });
        }
        else {
            console.log('[error] Could not make the transaction request');
        }
    },

    'click .js-load-more-projects': function(e) {
        e.preventDefault();

        Template.instance().projectsSubscription.loadNextPage();
    },
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
        e.preventDefault();

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
                    throwError(err.reason);
                }
                else {
                    throwSuccess('You have successfully deleted this project.');

                    FlowRouter.go('profile.page', {username: FlowRouter.getParam('username')});
                }
            });
        }
    },
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
});

Template.item_submit.events({
    'click .item-submit-add-single-item': function(e) {
        e.preventDefault();

        if ($(".single-item-form").length >= UPLOAD_LIMITS.projects) {
            throwError('Sorry, you can\'t add more than ' + UPLOAD_LIMITS.projects + ' projects at one time');
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
        var currentItemsCount = $(".single-item-form").length;
        var successfulItems = 0;

        if (currentItemsCount > UPLOAD_LIMITS.projects) {
            throwError('Please add a maximum of ' + UPLOAD_LIMITS.projects + ' projects at a time.');
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
                        if (files[i].size > 5000000) {
                            throwError("Sorry, one of your images is bigger than the 5MB upload limit.");
                            Session.set('areItemsUploading', false);
                            return;
                        }
                    }

                    if (files.length > UPLOAD_LIMITS.images) {
                        throwError('Sorry, one of your projects has ' + files.length.toString() + ' images.  The maximum you can upload is ' + UPLOAD_LIMITS.images + '.');
                        Session.set('areItemsUploading', false);
                    }
                    else if (files.length > 0) {
                        var fileIndex = 0;
                        Cloudinary.upload(files, {
                            folder: "flippedart",
                            upload_preset: "limitsize"
                        }, function(error, result) {
                            if (error) {
                                throwError(error.reason);
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
                                                throwSuccess('Your projects have been added!');
                                            }
                                            else {
                                                throwSuccess('Your project has been added!');
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
                        throwError("Sorry, you need to include at least one photo per project.");
                        Session.set('areItemsUploading', false);
                    }
                });
            });
        }
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
    },
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
    'change input#projectPhotoUpload'(e) {
        e.preventDefault();

        //FIXME: this alters all input boxes (in case the user is adding more than one item at a time).  Select by class instead of ID, and pass in unique classnames to {{> single_item_submit}}

        /*
         Source: http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
         */
        var $input = $('input#projectPhotoUpload');
        var $label = $input.next('label');
        var labelVal = $label.html();
        var fileName = '';

        if( e.target.files && e.target.files.length > 1 ) {
            fileName = ( e.target.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', e.target.files.length );
        }
        else if( e.target.value ) {
            fileName = e.target.value.split( '\\' ).pop();
        }

        if( fileName ) {
            $label.find( 'span' ).html( fileName );
        }
        else {
            $label.html( labelVal );
        }
    }
});


var currentSessionItemId = 1;
var nextSessionItemId = function() {
    //always increment
    currentSessionItemId += 1;
    return currentSessionItemId;
};
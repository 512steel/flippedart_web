import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { UserAttributes } from '../../../api/user-attributes/user-attributes.js';
import {
    insert as userAttributesInsert,
    edit as userAttributesEdit } from '../../../api/user-attributes/methods.js'

import {
    throwError,
    throwSuccess } from '../../lib/temporary-alerts.js';

import { ChatSessions } from '../../../api/chat-sessions/chat-sessions.js';

import './profile-page-card.html';
import './user-attributes-card.html';
import './user-attributes-edit.html';
import './user-attributes-insert-page.html';

import '../user-posts/user-posts-components.js';
import '../exchangeItems/exchangeItems-components.js';


Template.profile_page_card.onCreated(function () {
    this.getUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userAttributes.byUsername', this.getUsername());

        if (Meteor.user()) {
            this.subscribe('chatSession.single', this.getUsername());
        }
    });
});

Template.user_attributes_card.onCreated(function () {
    this.getUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {
    });

    this.userAttributes = () => UserAttributes.findOne({username: this.getUsername()});
});

Template.user_attributes_edit.onCreated(function () {
    this.getUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {

    });

    this.userAttributes = () => UserAttributes.findOne({});
    Session.set('isProfilePictureUploading', false);
});


Template.profile_page_card.onRendered(function () {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            //  default state for the userAttributes edit form
            if (UserAttributes.findOne({})) {
                Session.set('showUserAttributesEdit', false);
            }
            else {
                Session.set('showUserAttributesEdit', true);
            }

            // release renderHolds here
        }
    });
});

Template.user_attributes_card.onRendered(function () {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.user_attributes_edit.onRendered(function () {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});


Template.profile_page_card.helpers({
    isProfileOwner: function() {
        if (Meteor.user() && Meteor.user().username == Template.instance().getUsername()) {
            return true;
        }
        else return false;
    },
    profileUsername: function() {
        return Template.instance().getUsername();
    },

    chatExists: function() {
        if (ChatSessions.findOne({})) {
            return true
        }
        else return false;
    }
});

Template.user_attributes_card.helpers({
    userAttributes: function() {
        return Template.instance().userAttributes();
    },
    isProfileOwner: function() {
        if (Meteor.user() && Meteor.user().username == Template.instance().getUsername()) {
            return true;
        }
        else return false;
    },
    profileUsername: function() {
        return Template.instance().getUsername();
    },
    showUserAttributesEdit: function() {
        return Session.get('showUserAttributesEdit');
    },
});

Template.user_attributes_edit.helpers({
    userAttributes: function() {
        return Template.instance().userAttributes();
    },
    isUploadingProfilePicture: function() {
        return Session.get('isProfilePictureUploading');
    },
});


Template.profile_page_card.events({

});

Template.user_attributes_card.events({
    'click .userAttributes-edit': function (e, template) {
        e.preventDefault();

        //toggle the "user_attributes_edit" template
        Session.set('showUserAttributesEdit', !Session.get('showUserAttributesEdit'));
    },
});

Template.user_attributes_edit.events({
    'submit form.userAttributes-insert-form': function(e, template) {
        e.preventDefault();

        $("form input[name='profile-photo-link']").each(function() {
            var files = this.files;

            for (var i = 0; i < files.length; i++) {
                if (files[i].size > 2000000) {
                    throwError("Sorry, your image is bigger than the 2MB upload limit");
                    return;
                }
            }

            if (files.length > 1) {
                throwError("Oops! You can only have one profile photo at a time");
            }
            else if (files.length > 0) {
                //user is uploading a profile photo
                Session.set('isProfilePictureUploading', true);

                if (Meteor.user()) {
                    Cloudinary.upload(files, {
                        folder: "secret"  //FIXME: change to 'flippedart' folder
                    }, function(uploadError, uploadResult) {
                        if (uploadError) {
                            throwError(uploadError.reason);
                            Session.set('isProfilePictureUploading', false);
                        }

                        //FIXME - can't actually check whether there's an error before getting the public id on the asynchronous upload
                        userAttributesInsert.call({
                            /* NOTE: leaving any of these fields blank ought to make it default to the previous stored values. */
                            bio: $(e.target).find('[name=bio]').val(),
                            location: $(e.target).find('[name=location]').val(),
                            profilePhotoLink: uploadResult.public_id,
                        }, (err, res) => {
                            if (err) {
                                throwError(err.reason);
                            }
                            else {
                                throwSuccess('Yay!  You\'ve successfully updated your profile.  Be sure to explore what others are doing.');

                                if (Meteor.user()) {
                                    FlowRouter.go('profile.page', {username: Meteor.user().username})
                                }
                            }
                        });
                    });
                }
            }
            else {
                //user is not uploading a profile photo

                userAttributesInsert.call({
                    /* NOTE: leaving any of these fields blank ought to make it default to the previous stored values. */
                    bio: $(e.target).find('[name=bio]').val(),
                    location: $(e.target).find('[name=location]').val(),
                    profilePhotoLink: ' ',
                }, (err, res) => {
                    if (err) {
                        throwError(err.reason);
                    }
                    else {
                        throwSuccess('Yay!  You\'ve successfully updated your profile.  Be sure to explore what others are doing.');

                        if (Meteor.user()) {
                            FlowRouter.go('profile.page', {username: Meteor.user().username})
                        }
                    }
                });
            }
        });
    },

    'submit form.userAttributes-edit-form': function(e, template) {
        e.preventDefault();

        $("form input[name='profile-photo-link']").each(function() {
            var files = this.files;

            for (var i = 0; i < files.length; i++) {
                if (files[i].size > 2000000) {
                    throwError("Sorry, your image is bigger than the 2MB upload limit");
                    return;
                }
            }

            if (files.length > 1) {
                throwError("Oops! You can only have one profile photo at a time");
            }
            else if (files.length > 0) {
                //user is uploading a profile photo
                Session.set('isProfilePictureUploading', true);

                if (Meteor.user()) {
                    Cloudinary.upload(files, {
                        folder: "secret"  //FIXME: change to 'flippedart' folder
                    }, function(uploadError, uploadResult) {
                        if (uploadError) {
                            throwError(uploadError.reason);
                            Session.set('isProfilePictureUploading', false);
                        }

                        //FIXME - can't actually check whether there's an error before getting the public id on the asynchronous upload
                        userAttributesEdit.call({
                            /* NOTE: leaving any of these fields blank ought to make it default to the previous stored values. */
                            bio: $(e.target).find('[name=bio]').val(),
                            location: $(e.target).find('[name=location]').val(),
                            profilePhotoLink: uploadResult.public_id,
                        }, (err, res) => {
                            if (err) {
                                throwError(err.reason);
                                Session.set('isProfilePictureUploading', false);
                            }
                            else {
                                throwSuccess('Yay!  You\'ve successfully updated your profile.');

                                //hide the edit form after it's been submitted
                                Session.set('showUserAttributesEdit', false);
                                Session.set('isProfilePictureUploading', false);
                            }
                        });
                    });
                }
            }
            else {
                //user is not uploading a profile photo

                userAttributesEdit.call({
                    /* NOTE: leaving any of these fields blank ought to make it default to the previous stored values. */
                    bio: $(e.target).find('[name=bio]').val(),
                    location: $(e.target).find('[name=location]').val(),
                    profilePhotoLink: ' ',
                }, (err, res) => {
                    if (err) {
                        throwError(err.reason);
                    }
                    else {
                        throwSuccess('Yay!  You\'ve successfully updated your profile.');

                        //hide the edit form after it's been submitted
                        Session.set('showUserAttributesEdit', false);
                    }
                });
            }
        });
    },
});

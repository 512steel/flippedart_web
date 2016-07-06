import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import { HEAD_DEFAULTS } from '../../lib/globals.js';

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
import './user-attributes-card-small.html';
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

    var titleString = this.getUsername() + "'s profile | " + HEAD_DEFAULTS.title_short;
    DocHead.setTitle(titleString);
    DocHead.addMeta({name: "og:title", content: titleString});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/" + this.getUsername()});

    //TODO: make this the user's profile picture
    DocHead.addMeta({name: "og:image", content: "http://res.cloudinary.com/dwgim6or9/image/upload/v1467765602/flippedart_og_image_3_qtkwew.png"});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

Template.user_attributes_card.onCreated(function () {
    this.getUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {
    });

    this.userAttributes = () => {

        if (this.getUsername()) {
            //Query on denormalized data (should work the majority of the time)
            const attributes = UserAttributes.findOne({usernameLower: this.getUsername().toLowerCase()});
            if (attributes) {
                return attributes;
            }
        }

        //Case-insensitve (but inefficient) query in case the denormalized usernameLower attribute hasn't been set.
        //TODO: manually migrate those users over
        const userAttributesRegex = new RegExp(["^", this.getUsername(), "$"].join(""), "i");
        return UserAttributes.findOne({username: userAttributesRegex});
    };
});

Template.user_attributes_edit.onCreated(function () {
    this.getUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {

    });

    this.fieldsRequired = () => this.data.required ? this.data.required : false;

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

    autosize($('textarea'));
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

Template.user_attributes_card_small.helpers({
    userAttributes: function() {
        return this;
    }
});

Template.user_attributes_edit.helpers({
    userAttributes: function() {
        return Template.instance().userAttributes();
    },
    isUploadingProfilePicture: function() {
        return Session.get('isProfilePictureUploading');
    },

    fieldsRequired: function() {
        return Template.instance().fieldsRequired();
    }
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
                if (files[i].size > 5000000) {
                    throwError("Sorry, your image is bigger than the 5MB upload limit");
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
                        folder: "flippedart",
                        upload_preset: "limitsize"
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
                                console.log(err);
                                throwError(err.reason);
                            }
                            else {
                                throwSuccess('Yay!  You\'ve successfully updated your profile.  Be sure to explore what others are doing.');

                                //FIXME: UI-hack to re-initialize Foundation's JS (dropdowns, etc)
                                $(document).foundation();
                                Meteor.setTimeout(function(){
                                    $(document).foundation();
                                }, 500);
                                Meteor.setTimeout(function(){
                                    $(document).foundation();
                                }, 1500);

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

                        //FIXME: UI-hack to re-initialize Foundation's JS (dropdowns, etc)
                        $(document).foundation();
                        Meteor.setTimeout(function(){
                            $(document).foundation();
                        }, 500);
                        Meteor.setTimeout(function(){
                            $(document).foundation();
                        }, 1500);

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
                if (files[i].size > 5000000) {
                    throwError("Sorry, your image is bigger than the 5MB upload limit");
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
                        folder: "flippedart",
                        upload_preset: "limitsize"
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
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
    'change input#profilePhotoFileUpload'(e) {
        e.preventDefault();

        /*
          Source: http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
        */
        var $input = $('input#profilePhotoFileUpload');
        var $label = $input.next('label');
        var labelVal = $label.html();
        var fileName = '';

        if( this.files && this.files.length > 1 ) {
            fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
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

//TODO: refactor this js into separate component files

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';


import { UserPosts } from '../../../api/user-posts/user-posts.js';
import {
    insert,
    edit,
    upvote,
    flag,
    unflag,
    deletePost
} from '../../../api/user-posts/methods.js';

// component used for the "user_post_edit" template
import './../../components/app-not-authorized.js';

import './user-post-card.html';
import './user-post-edit.html';
import './user-post-submit.html';
import './user-post-single-page.html';
import './user-posts-all.html';


Template.user_post_card.onCreated(function userPostCardOnCreated() {
    //TODO: keep an eye on this in case more data is passed into the template.
    this.userPost = () => this.data;

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});

Template.user_post_edit.onCreated(function userPostEditOnCreated() {
    this.getUsername = () => FlowRouter.getParam('username');
    this.getUserPostId = () => FlowRouter.getParam('userPostId');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userPosts.single', this.getUserPostId());
    });
});

Template.user_post_submit.onCreated(function userPostSubmitOnCreated() {
    Session.set('isPostUploading', false);

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});

Template.user_post_single_page.onCreated(function userPostSinglePageOnCreated() {
    this.getUsername = () => FlowRouter.getParam('username');
    this.getUserPostId = () => FlowRouter.getParam('userPostId');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userPosts.single', this.getUserPostId());
    });
});

Template.user_posts_all.onCreated(function userPostsAllOnCreated() {
    this.getUsername = () => FlowRouter.getParam('username');

    //FIXME: make a sensible "load more" and "toggle sort" option
    const subOptions = {sort: {createdAt: -1}, limit: 15};

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userPosts.user', this.getUsername(), subOptions);
    });
});


Template.user_post_card.onRendered(function userPostCardOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.user_post_edit.onRendered(function userPostEditOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.user_post_submit.onRendered(function userPostSubmitOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.user_post_single_page.onRendered(function userPostSinglePageOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.user_posts_all.onRendered(function userPostsAllOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    })
});


Template.user_post_card.helpers({
    ownPost: function() {
        if (Meteor.user() && Meteor.user().username === this.author) {
            return true;
        }
        else return false;
    },
    upvotedClass: function() {
        if (Meteor.user() && !_.include(this.voters, Meteor.user().username)) {
            return 'btn-primary upvotable';
        }
        else {
            return 'disabled';
        }
    },
    flaggedClass: function() {
        if (Meteor.user() && !_.include(this.flaggers, Meteor.user().username)) {
            return 'flaggable';
        }
        else {
            return 'unflag';
        }
    },
    userHasFlagged: function() {
        if (Meteor.user() && _.include(this.flaggers, Meteor.user().username)) {
            return true;
        }
        else return false;
    },
    inappropriate: function() {
        const flagThreshold = 1;
        if (this.flags > flagThreshold) {
            return true;
        }
        else {
            return false;
        }
    }
});

Template.user_post_edit.helpers({
    userPost: function() {
        return UserPosts.findOne({});
    },
    ownPost: function() {
        if (Meteor.user() && Meteor.user().username == Template.instance().getUsername()) {
            return true;
        }
        else return false;
    },
});

Template.user_post_submit.helpers({
    isUploading: function() {
        return Session.get('isPostUploading');
    },
    uploadingCopy: function() {
        return "Posting...";
    }
});

Template.user_post_single_page.helpers({
    userPost: function() {
        return UserPosts.findOne({});
    },
    ownPost: function() {
        if (Meteor.user() && Meteor.user().username == Template.instance().getUsername()) {
            return true;
        }
        else return false;
    },

    comments: function() {
        //TODO: return Comments.find({userPostId: this._id});
    }
});

Template.user_posts_all.helpers({
    userPosts: function() {
        return UserPosts.find({});
    },
    isProfileOwner: function() {
        if (Meteor.user() && Meteor.user().username == Template.instance().getUsername()) {
            return true;
        }
        else return false;
    },
    pageUsername: function() {
        return Template.instance().getUsername();
    },
    //TODO: make a "profileExists" helper here.
});


Template.user_post_card.events({
    'click .upvotable': function(e) {
        e.preventDefault();

        upvote.call({
            userPostId: this._id,
        });
    },
    'click .flag.flaggable': function(e) {
        console.log('clicked to flag');

        flag.call({
            userPostId: this._id,
        });
    },
    'click .flag.unflag': function (e) {
        e.preventDefault();

        unflag.call({
            userPostId: this._id,
        });
    }
});

Template.user_post_edit.events({
    'submit form.edit-post': function(e) {
        e.preventDefault();

        const userPostId = Template.instance().getUserPostId();
        const username = Template.instance().getUsername();

        edit.call({
            userPostId: userPostId,
            text: $(e.target).find('[name=user-post-edit-text]').val(),

            //TODO: collect actual info on the rest of these fields:
            tag: '',
            imageLinks: [],
        }, (err, res) => {
            if (err) {
                //TODO: throwError here.
                console.log(err);
            }
            else {
                FlowRouter.go('profile.post', {username: username, userPostId: userPostId});
            }
        });
    },
    'click .delete-user-post': function(e) {
        e.preventDefault();

        const userPostId = Template.instance().getUserPostId();
        const username = Template.instance().getUsername();

        if (confirm("Are you sure you want to delete this post?")) {
            deletePost.call({
                userPostId: userPostId,
            }, (err, res) => {
                if (err) {
                    //TODO: throwError here.
                    console.log(err);
                }
                else {
                    FlowRouter.go('profile.posts', {username: username});
                }
            });
        }
    }
});

Template.user_post_submit.events({
    'submit form.user-post-submit': function(e) {
        e.preventDefault();

        var imageLinks = [];

        Session.set('isPostUploading', true);

        $(".user-post-submit input[type='file']").each(function() {
            var files = this.files;

            for (var i = 0; i < files.length; i++) {
                if (files[i].size > 2000000) {
                    //TODO: implement throwError()
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
                    folder: "secret"  //FIXME: change this folder to "flippedart"
                }, function(error, result) {
                    if (error) {
                        //FIXME: throw error visibly to client
                        throwError(error);
                    }

                    //FIXME - since Cloudinary.upload() is asynchronous there's no way to check if there's an error before submitting the userPost and it will likely hang on `null.public_id`

                    imageLinks.push(result.public_id);

                    /*var errors = validateUserPost(userPost);
                    if (errors.text) {
                        return Session.set('userPostSubmitErrors', errors);
                    }*/

                    fileIndex++;  //hack to only insert the post after all photos are uploaded

                    if (fileIndex >= files.length) {
                        insert.call({
                            text: $(e.target).find('[name=user-post-submit-text]').val(),
                            tag: ' ',  //FIXME: collect a post tag?
                            imageLinks: imageLinks,
                        }, (err, res) => {
                            if (err) {
                                //FIXME: visible throwError
                                console.log(err);
                            }
                            else {
                                Session.set('isPostUploading', false);

                                if (Meteor.user()) {
                                    FlowRouter.go('profile.post',
                                        {username: Meteor.user().username, userPostId: res._id}
                                    );
                                }
                            }
                        });
                    }
                });
            }
            else {
                //no images

                insert.call({
                    text: $(e.target).find('[name=user-post-submit-text]').val(),
                    tag: ' ',  //FIXME: collect a post tag?
                    imageLinks: [],
                }, (err, res) => {
                    if (err) {
                        //FIXME: visible throwError
                        console.log(err);
                    }
                    else {
                        Session.set('isPostUploading', false);

                        if (Meteor.user()) {
                            FlowRouter.go('profile.post',
                                {username: Meteor.user().username, userPostId: res._id}
                            );
                        }
                    }
                });
            }
        });
    },
});

Template.user_post_single_page.events({
    'click .asdf': function(e) {

    },
});

Template.user_posts_all.events({
    'click .asdf': function(e) {

    },
});

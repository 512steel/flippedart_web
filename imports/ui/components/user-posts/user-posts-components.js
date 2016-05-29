//TODO: refactor this js into separate component files

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';

import { FLAG_THRESHOLD } from '../../lib/globals.js';

import { UserPosts } from '../../../api/user-posts/user-posts.js';
import {
    insert,
    edit,
    upvote,
    unUpvote,
    flag,
    unflag,
    deletePost
} from '../../../api/user-posts/methods.js';

import { Comments } from '../../../api/comments/comments.js';

// component used for the "user_post_edit" template
import './../../components/app-not-authorized.js';

import './user-post-card.html';
import './user-post-edit.html';
import './user-post-submit.html';
import './user-post-single-page.html';
import './user-posts-all.html';

import './../comments/comment-card.html';
import './../comments/comment_edit.html';
import './../comments/comment_submit.html';
import './../comments/comments-components.js';


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

    this.commentsSubscription = null;

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userPosts.single', this.getUserPostId());
        //this.subscribe('comments.userPost', this.getUserPostId(), {sort: {createdAt: 1}, limit: 15});
        this.commentsSubscription = Meteor.subscribeWithPagination('comments.userPost', this.getUserPostId(), {sort: {createdAt: 1}}, 3);
    });
});

Template.user_posts_all.onCreated(function userPostsAllOnCreated() {
    this.getUsername = () => FlowRouter.getParam('username');

    //FIXME: make a sensible "load more" and "toggle sort" option
    this.toggleSortText = new ReactiveVar('top');

    this.userPostsSubscription = null;

    // Subscriptions go in here
    this.autorun(() => {
        this.userPostsSubscription = Meteor.subscribeWithPagination('userPosts.user', this.getUsername(), {sort: {createdAt: -1}}, 3);

        //FIXME: how to sort posts inside of the profile page?
        switch (FlowRouter.getRouteName()) {
            case 'profile.page':
                break;
            case 'profile.posts':
                break;
            case 'profile.posts.new':
                break;
            case 'profile.posts.top':
                break;
        }
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
        if (!Meteor.user()) {
            return 'disabled';
        }

        if (!_.include(this.voters, Meteor.user().username)) {
            return 'btn-primary upvotable';
        }
        else {
            return 'btn-secondary upvoted';
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
        if (this.flags >= FLAG_THRESHOLD.post) {
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
        return Comments.find({userPostId: Template.instance().getUserPostId()});
    },

    hasMoreComments: function() {
        const sub = Template.instance().commentsSubscription;

        return sub.loaded() < Counts.get('comments.userPost.count') &&
            sub.loaded() == sub.limit();
    }
});

Template.user_posts_all.helpers({
    userPosts: function() {
        switch (FlowRouter.getRouteName()) {
            //FIXME: how to sort posts inside of the profile page?
            case 'profile.page':
                return UserPosts.find({}, {sort: {createdAt: -1}});
                break;

            /* === */
            case 'profile.posts':
                return UserPosts.find({}, {sort: {createdAt: -1}});
                break;
            case 'profile.posts.new':
                return UserPosts.find({}, {sort: {createdAt: -1}});
                break;
            case 'profile.posts.top':
                return UserPosts.find({}, {sort: {rank: -1, createdAt: -1}});
                break;
        }

        //return UserPosts.find({});
    },
    hasMorePosts: function() {
        const sub = Template.instance().userPostsSubscription;

        return sub.loaded() < Counts.get('userPosts.user.count') &&
            sub.loaded() == sub.limit();
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
    toggleSortText: function() {
        return Template.instance().toggleSortText.get();
    }

    //TODO: make a "profileExists" helper here.
});


Template.user_post_card.events({
    'click .upvotable': function(e) {
        e.preventDefault();

        upvote.call({
            userPostId: this._id,
        });
    },
    'click .upvoted': function(e) {
        e.preventDefault();

        unUpvote.call({
            userPostId: this._id,
        });
    },

    'click .flag.flaggable': function(e) {
        e.preventDefault();

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

        //FIXME: include the ability to edit the "imageLinks"

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
                                {username: Meteor.user().username, userPostId: res}
                            );
                        }
                    }
                });
            }
        });
    },
});

Template.user_post_single_page.events({
    'click .js-load-more-comments': function(e) {
        e.preventDefault();

        Template.instance().commentsSubscription.loadNextPage();
    }
});

Template.user_posts_all.events({
    'click .js-load-more-posts': function(e) {
        e.preventDefault();

        Template.instance().userPostsSubscription.loadNextPage();
    },

    'click .toggle-posts-sort': function(e) {
        e.preventDefault();

        switch(Template.instance().toggleSortText.get()) {
            case 'top':
                Template.instance().toggleSortText.set('new');
                FlowRouter.go('profile.posts.top', {username: FlowRouter.getParam('username')});
                break;
            case 'new':
                Template.instance().toggleSortText.set('top');
                FlowRouter.go('profile.posts.new', {username: FlowRouter.getParam('username')});
                break;
        }
    },
});

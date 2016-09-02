import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';
import { DocHead } from 'meteor/kadira:dochead';

import {
    FLAG_THRESHOLD,
    UPLOAD_LIMITS,
    HEAD_DEFAULTS } from '../../lib/globals.js';

import {
    throwError,
    throwSuccess } from '../../lib/temporary-alerts.js';

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
import { UserAttributes } from '../../../api/user-attributes/user-attributes.js';

// component used for the "user_post_edit" template
import './../../components/app-not-authorized.js';

import './user-post-card.html';
import './user-post-edit.html';
import './user-post-submit.html';
import './user-post-single-page.html';
import './user-posts-all.html';
import './user-posts-all-page.html';

import './../photoTiles/photo-tiles-components.js';

import './../comments/comment-card.html';
import './../comments/comment_edit.html';
import './../comments/comment_submit.html';
import './../comments/comments-components.js';

import './../user-profile/user-autocomplete-components.html';


Template.user_post_card.onCreated(function userPostCardOnCreated() {
    //TODO: keep an eye on this in case more data is passed into the template.
    this.userPost = () => this.data.userPost;

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('usernames.all');
    });
});

Template.user_post_edit.onCreated(function userPostEditOnCreated() {
    Session.set('isPostEditUploading', false);

    this.getUsername = () => FlowRouter.getParam('username');
    this.getUserPostId = () => FlowRouter.getParam('userPostId');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userPosts.single', this.getUserPostId());
        this.subscribe('usernames.all');
    });
});

Template.user_post_submit.onCreated(function userPostSubmitOnCreated() {
    Session.set('isPostUploading', false);

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('usernames.all');
    });
});

Template.user_post_single_page.onCreated(function userPostSinglePageOnCreated() {
    this.getUsername = () => FlowRouter.getParam('username');
    this.getUserPostId = () => FlowRouter.getParam('userPostId');

    this.commentsSubscription = null;

    let userPost = UserPosts.findOne({});

    DocHead.addMeta({name: "og:description", content: " "});



    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userPosts.single', this.getUserPostId());
        //this.subscribe('comments.userPost', this.getUserPostId(), {sort: {createdAt: 1}, limit: 15});
        this.commentsSubscription = Meteor.subscribeWithPagination('comments.userPost', this.getUserPostId(), {sort: {createdAt: 1}}, 15);


        // Re-run the DocHead calls after the userPost is ready.
        userPost = UserPosts.findOne({});
        if (userPost) {
            DocHead.removeDocHeadAddedTags();

            let titleString = "";
            titleString += this.getUsername() + "'s posts | " + HEAD_DEFAULTS.title_short;
            DocHead.setTitle(titleString);
            DocHead.addMeta({name: "og:title", content: titleString});

            let descriptionString = "'" + userPost.text.substr(0, 35);
            descriptionString += userPost.text.length > 35 ? "...' " : "' ";
            descriptionString += " | " + HEAD_DEFAULTS.description;
            DocHead.addMeta({name: "og:description", content: descriptionString});

            //TODO: change "description" meta tag too?

            DocHead.addMeta({name: "og:type", content: "article"});
            DocHead.addMeta({
                name: "og:url",
                content: "https://www.flippedart.org/" + this.getUsername() + "/posts/" + this.getUserPostId()
            });

            if (userPost.imageLinks.length > 0) {
                DocHead.addMeta({
                    name: "og:image",
                    content: Cloudinary._helpers.url(userPost.imageLinks[0], {'secure':true})
                });
            }
            else {
                DocHead.addMeta({
                    name: "og:image",
                    content: HEAD_DEFAULTS.image
                    //TODO: change to user profile picture?
                });
            }

            DocHead.addMeta({name: "og:image:width", content: "1200"});
            DocHead.addMeta({name: "og:image:height", content: "630"});
        }

    });

    // Default docheads
    {
        let titleString = "";
        titleString += this.getUsername() + "'s posts | " + HEAD_DEFAULTS.title_short;
        DocHead.setTitle(titleString);
        DocHead.addMeta({name: "og:title", content: titleString});

        DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});

        DocHead.addMeta({name: "og:type", content: "article"});
        DocHead.addMeta({
            name: "og:url",
            content: "https://www.flippedart.org/" + this.getUsername() + "/posts/" + this.getUserPostId()
        });

        DocHead.addMeta({
            name: "og:image",
            content: HEAD_DEFAULTS.image
        });

        DocHead.addMeta({name: "og:image:width", content: "1200"});
        DocHead.addMeta({name: "og:image:height", content: "630"});
    }
});

Template.user_posts_all.onCreated(function userPostsAllOnCreated() {
    this.getUsername = () => FlowRouter.getParam('username');

    //FIXME: make a sensible "load more" and "toggle sort" option
    this.toggleSortText = new ReactiveVar('top');

    this.userPostsSubscription = null;

    // Subscriptions go in here
    this.autorun(() => {
        this.userPostsSubscription = Meteor.subscribeWithPagination('userPosts.user', this.getUsername(), {sort: {createdAt: -1}}, 10);

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

        //TODO: put this array into a global variable so it doesn't have to be re-run for every card?
        const possibleUsernames = UserAttributes.find({}, {username: 1}).fetch();
        var that = this;

        Meteor.setTimeout(function () {
            //Searches the post text and replaced @-tags with actual links.
            //Modified from here: http://stackoverflow.com/questions/884140/javascript-to-add-html-tags-around-content#answer-884424
            const text = that.data.userPost.text + ' ';  //HACK: the space is needed to include tags at the end of the string.
            var result = '';
            var csc; // current search char
            var wordPos = 0;
            var textPos = 0;
            var partialMatch = ''; // container for partial match
            var isMatching = false;

            var inTag = false;

            // iterate over the characters in the array
            // if we find an HTML element, ignore the element and its attributes.
            // otherwise try to match the characters to the characters in the word
            // if we find a match append the highlight text, then the word, then the close-highlight
            // otherwise, just append whatever we find.

            for (textPos = 0; textPos < text.length; textPos++) {
                csc = text.charAt(textPos);
                if (csc == '<') {
                    inTag = true;
                    result += partialMatch;
                    partialMatch = '';
                    wordPos = 0;
                }
                if (inTag) {
                    result += csc;
                } else {
                    if (isMatching) {
                        if ((csc == ' ' || csc == '@' || csc == ',' || csc == '.' || csc == '/' || csc == '-' || csc == '&' || csc == '!' || csc == '?' || csc == ';' || csc == ':' || csc == '\'' || csc == '\"' || csc == '(' || csc == ')' || csc == '[' || csc == ']' || csc == '{' || csc == '}' || textPos >= text.length)) {  //TODO: account for all kinds of whitespace and invalid name-characters
                            //we've matched the whole word, so test to make sure this username exists.
                            var found = false;
                            for (var i = 0; i < possibleUsernames.length; i++) {
                                if (possibleUsernames[i].username == partialMatch) {
                                    result += '<a href="/' + partialMatch + '" class="username-tag">';
                                    result += partialMatch;
                                    result += '</a>';
                                    result += csc;
                                    found = true;
                                    break;
                                }
                            }

                            if (!found) {
                                result += partialMatch;
                            }

                            partialMatch = '';
                            isMatching = false;
                        }
                        else {
                            partialMatch += csc;
                        }
                    }
                    else {
                        result += csc;
                    }

                    if (csc == '@') {
                        isMatching = true;
                    }
                    else if (!isMatching) {
                        //result += csc;
                    }
                }

                if (inTag && csc == '>') {
                    inTag = false;
                }
            }

            if (that.data.small_card) {
                if (result.length > 200) {
                    result = result.slice(0,200) + "...";
                }
            }
            that.find($('.user-post-body')).innerHTML = result;
        }, 500);  //HACK: going back one page and then posting another update results in the two posts being temporarily concatenated, unless we set this timeout.
    });
});

Template.user_post_edit.onRendered(function userPostEditOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });

    autosize($('textarea'));
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
    ownPost: function () {
        if (Meteor.user() && Meteor.user().username === this.userPost.author) {
            return true;
        }
        else return false;
    },
    upvotedClass: function () {
        if (!Meteor.user()) {
            return 'disabled';
        }

        if (!_.include(this.userPost.voters, Meteor.user().username)) {
            return 'upvotable';
        }
        else {
            return 'hollow upvoted';
        }
    },
    flaggedClass: function () {
        if (Meteor.user() && !_.include(this.userPost.flaggers, Meteor.user().username)) {
            return 'flaggable';
        }
        else {
            return 'hollow unflag';
        }
    },
    userHasFlagged: function () {
        if (Meteor.user() && _.include(this.userPost.flaggers, Meteor.user().username)) {
            return true;
        }
        else return false;
    },
    inappropriate: function () {
        if (this.userPost.flags >= FLAG_THRESHOLD.post) {
            return true;
        }
        else {
            return false;
        }
    },

    currentPost: function () {
        //Note: this is more scope-independent and clearer to read in the template.
        return Template.instance().userPost();
    }

    //TODO: hasImageLinks helper for UI
});

Template.user_post_edit.helpers({
    userPost: function () {
        return UserPosts.findOne({});
    },
    ownPost: function () {
        if (Meteor.user() && Meteor.user().username == Template.instance().getUsername()) {
            return true;
        }
        else return false;
    },

    isUploading: function () {
        return Session.get('isPostEditUploading');
    },
    uploadingCopy: function () {
        let tempPercentTotal = 0;
        if (Cloudinary.collection.findOne()) {
            let count = Cloudinary.collection.find().count();

            Cloudinary.collection.find().forEach((file) => {
                tempPercentTotal += file.percent_uploaded;
            });
            tempPercentTotal = Math.round(tempPercentTotal/count);

            return Number.isNaN(tempPercentTotal) ? "Saving..." : "Saving: " + tempPercentTotal + "%";
        }
        else return "Saving...";
    },
    maxPhotoUploadCount: function () {
        return UPLOAD_LIMITS.images;
    },

    settings: function () {
        return {
            position: "top",
            limit: 5,
            rules: [
                {
                    token: '@',
                    collection: UserAttributes,
                    field: "username",
                    template: Template.user_autocomplete_item,
                    noMatchTemplate: Template.user_autocomplete_item_empty
                }
            ]
        };
    }
});

Template.user_post_submit.helpers({
    isUploading: function () {
        return Session.get('isPostUploading');
    },
    uploadingCopy: function () {
        let tempPercentTotal = 0;
        if (Cloudinary.collection.findOne()) {
            let count = Cloudinary.collection.find().count();

            Cloudinary.collection.find().forEach((file) => {
                tempPercentTotal += file.percent_uploaded;
            });
            tempPercentTotal = Math.round(tempPercentTotal/count);

            return Number.isNaN(tempPercentTotal) ? "Posting..." : "Posting: " + tempPercentTotal + "%";
        }
        else return "Posting...";
    },
    maxPhotoUploadCount: function () {
        return UPLOAD_LIMITS.images;
    },

    settings: function () {
        return {
            position: "top",
            limit: 5,
            rules: [
                {
                    token: '@',
                    collection: UserAttributes,
                    field: "username",
                    template: Template.user_autocomplete_item,
                    noMatchTemplate: Template.user_autocomplete_item_empty
                }
            ]
        };
    }
});

Template.user_post_single_page.helpers({
    userPost: function () {
        return UserPosts.findOne({});
    },
    ownPost: function () {
        if (Meteor.user() && Meteor.user().username == Template.instance().getUsername()) {
            return true;
        }
        else return false;
    },

    comments: function () {
        return Comments.find({userPostId: Template.instance().getUserPostId()});
    },

    hasMoreComments: function () {
        const sub = Template.instance().commentsSubscription;

        return sub.loaded() < Counts.get('comments.userPost.count') &&
            sub.loaded() == sub.limit();
    }
});

Template.user_posts_all.helpers({
    userPosts: function () {
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
    hasMorePosts: function () {
        const sub = Template.instance().userPostsSubscription;

        return sub.loaded() < Counts.get('userPosts.user.count') &&
            sub.loaded() == sub.limit();
    },

    isProfileOwner: function () {
        if (Meteor.user() && Meteor.user().username == Template.instance().getUsername()) {
            return true;
        }
        else return false;
    },
    pageUsername: function () {
        return Template.instance().getUsername();
    },
    toggleSortText: function () {
        return Template.instance().toggleSortText.get();
    }

    //TODO: make a "profileExists" helper here.
});


Template.user_post_card.events({
    'click .upvotable': function (e) {
        e.preventDefault();

        upvote.call({
            userPostId: this.userPost._id,
        });
    },
    'click .upvoted': function (e) {
        e.preventDefault();

        unUpvote.call({
            userPostId: this.userPost._id,
        });
    },

    'click .flag.flaggable': function (e) {
        e.preventDefault();

        flag.call({
            userPostId: this.userPost._id,
        });
    },
    'click .flag.unflag': function (e) {
        e.preventDefault();

        unflag.call({
            userPostId: this.userPost._id,
        });
    },
    'click .share-post-facebook': function (e) {
        e.preventDefault();
        const instance = Template.instance();
        const shareUrl = 'https://www.flippedart.org/' + instance.userPost().author + '/posts/' + instance.userPost()._id;
        FB.ui({
            method: 'share',
            href: shareUrl,
            mobile_iframe: true
        }, function (response) {
        });
    },
});

Template.user_post_edit.events({
    'submit form.edit-post': function (e) {
        e.preventDefault();

        const userPostId = Template.instance().getUserPostId();
        const username = Template.instance().getUsername();

        var imageLinks = [];

        $(".edit-post input[type='file']").each(function () {
            var files = this.files;

            for (var i = 0; i < files.length; i++) {
                if (files[i].size > 6000000) {
                    throwError("Sorry, one of your images is bigger than the 6MB upload limit");
                    return;
                }
            }

            if (files.length > UPLOAD_LIMITS.images) {
                throwError("Sorry, you are trying to upload " + files.length.toString() + " images.  The maximum you can upload is " + UPLOAD_LIMITS.images + ".");
            }
            else if (files.length > 0) {
                //user is uploading an image
                Session.set('isPostEditUploading', true);

                var fileIndex = 0;
                Cloudinary.upload(files, {
                    folder: "flippedart",
                    upload_preset: "limitsize"
                }, function (error, result) {
                    if (error) {
                        throwError(error.reason);
                    }

                    //FIXME - since Cloudinary.upload() is asynchronous there's no way to check if there's an error before submitting the userPost and it will likely hang on `null.public_id`

                    imageLinks.push(result.public_id);

                    fileIndex++;  //hack to only insert the post after all photos are uploaded

                    if (fileIndex >= files.length) {
                        edit.call({
                            userPostId: userPostId,
                            text: $(e.target).find('[name=user-post-edit-text]').val(),

                            //TODO: collect actual info on the rest of these fields:
                            tag: '',
                            imageLinks: imageLinks,  // hack to tell the server method to keep previous imageLinks
                        }, (err, res) => {
                            if (err) {
                                Session.set('isPostEditUploading', false);
                                throwError(err.reason);
                            }
                            else {
                                Session.set('isPostEditUploading', false);
                                FlowRouter.go('profile.post', {username: username, userPostId: userPostId});
                            }
                        });
                    }
                });
            }
            else {
                //no images

                edit.call({
                    userPostId: userPostId,
                    text: $(e.target).find('[name=user-post-edit-text]').val(),

                    //TODO: collect actual info on the rest of these fields:
                    tag: '',
                    imageLinks: ["none"],  // hack to tell the server method to keep previous imageLinks
                }, (err, res) => {
                    if (err) {
                        throwError(err.reason);
                    }
                    else {
                        Session.set('isPostEditUploading', false);
                        FlowRouter.go('profile.post', {username: username, userPostId: userPostId});
                    }
                });
            }
        });
    },
    'click .delete-user-post': function (e) {
        e.preventDefault();

        const userPostId = Template.instance().getUserPostId();
        const username = Template.instance().getUsername();

        if (confirm("Are you sure you want to delete this post?")) {
            deletePost.call({
                userPostId: userPostId,
            }, (err, res) => {
                if (err) {
                    throwError(err.reason);
                }
                else {
                    FlowRouter.go('profile.posts', {username: username});
                }
            });
        }
    },
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
    'change input#postEditFileUpload'(e) {
        e.preventDefault();

        /*
         Source: http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
         */
        var $input = $('input#postEditFileUpload');
        var $label = $input.next('label');
        var labelVal = $label.html();
        var fileName = '';

        if (e.target.files && e.target.files.length > 1) {
            fileName = ( e.target.getAttribute('data-multiple-caption') || '' ).replace('{count}', e.target.files.length);
        }
        else if (e.target.value) {
            fileName = e.target.value.split('\\').pop();
        }

        if (fileName) {
            $label.find('span').html(fileName);
        }
        else {
            $label.html(labelVal);
        }
    }
});

Template.user_post_submit.events({
    'submit form.user-post-submit': function (e) {
        e.preventDefault();

        var imageLinks = [];

        $(".user-post-submit input[type='file']").each(function () {
            var files = this.files;

            for (var i = 0; i < files.length; i++) {
                if (files[i].size > 6000000) {
                    throwError("Sorry, one of your images is bigger than the 6MB upload limit");
                    return;
                }
            }

            if (files.length > UPLOAD_LIMITS.images) {
                throwError("Sorry, you are trying to upload " + files.length.toString() + " images.  The maximum you can upload is " + UPLOAD_LIMITS.images + ".");
            }
            else if (files.length > 0) {
                //user is uploading an image
                Session.set('isPostUploading', true);

                var fileIndex = 0;
                Cloudinary.upload(files, {
                    folder: "flippedart",
                    upload_preset: "limitsize"
                }, function (error, result) {
                    if (error) {
                        throwError(error.reason);
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
                                throwError(err.reason);
                                Session.set('isPostUploading', false);
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
            }
            else {
                //no images

                insert.call({
                    text: $(e.target).find('[name=user-post-submit-text]').val(),
                    tag: ' ',  //FIXME: collect a post tag?
                    imageLinks: [],
                }, (err, res) => {
                    if (err) {
                        throwError(err.reason);
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
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
    'change input#postFileUpload'(e) {
        e.preventDefault();

        /*
         Source: http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
         */
        var $input = $('input#postFileUpload');
        var $label = $input.next('label');
        var labelVal = $label.html();
        var fileName = '';

        if (e.target.files && e.target.files.length > 1) {
            fileName = ( e.target.getAttribute('data-multiple-caption') || '' ).replace('{count}', e.target.files.length);
        }
        else if (e.target.value) {
            fileName = e.target.value.split('\\').pop();
        }

        if (fileName) {
            $label.find('span').html(fileName);
        }
        else {
            $label.html(labelVal);
        }
    }
});

Template.user_post_single_page.events({
    'click .js-load-more-comments': function (e) {
        e.preventDefault();

        Template.instance().commentsSubscription.loadNextPage();
    }
});

Template.user_posts_all.events({
    'click .js-load-more-posts': function (e) {
        e.preventDefault();

        Template.instance().userPostsSubscription.loadNextPage();
    },

    'click .toggle-posts-sort': function (e) {
        e.preventDefault();

        switch (Template.instance().toggleSortText.get()) {
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

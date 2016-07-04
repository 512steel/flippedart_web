import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';

import { FLAG_THRESHOLD } from '../../lib/globals.js';

import {
    throwError,
    throwSuccess } from '../../lib/temporary-alerts.js';

import { Comments } from '../../../api/comments/comments.js';
import {
    insert,
    edit,
    flag,
    unflag,
    deleteComment
} from '../../../api/comments/methods.js';

import { UserAttributes } from '../../../api/user-attributes/user-attributes.js';

// component used for the "user_post_edit" template
import './../../components/app-not-authorized.js';

/*import './comment-card.html';
import './comment-edit.html';
import './comment-submit.html';*/

import './../user-profile/user-autocomplete-components.html';


Template.comment_card.onCreated(function commentCardOnCreated() {
    //this.comment = () => this.data;

    this.showCommentEdit = new ReactiveVar(false);

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});

Template.comment_edit.onCreated(function commentEditOnCreated() {

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('usernames.all');
    });
});

Template.comment_submit.onCreated(function commentSubmitOnCreated() {

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('usernames.all');
    });
});


Template.comment_card.onRendered(function commentCardOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }

        var that = this;
        Meteor.setTimeout(function(){
            //Searches the post text and replaced @-tags with actual links
            //TODO: improve this (while watching for performance by first checking to make sure the username exists within the 'usernames.all' sub.
            //modified from here: http://stackoverflow.com/questions/884140/javascript-to-add-html-tags-around-content#answer-884424
            const text = that.data.text + ' ';  //HACK: the space is needed to include tags at the end of the string.
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
                    result += csc ;
                } else {
                    if (isMatching) {
                        if ((csc == ' ' || csc == '@' || textPos >= text.length)) {  //TODO: account for all kinds of whitespace
                            //we've matched the whole word
                            result += '<a href="/' + partialMatch + '">';
                            result += '<strong class="username-tag">';
                            result += partialMatch;
                            result += '</strong>';
                            result += '</a>';
                            result += csc;
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
            that.find($('.comment-card-text')).innerHTML = result;
        }, 400);  //HACK: going back one page and then posting another update results in the two posts being temporarily concatenated, unless we set this timeout.
    });
});

Template.comment_edit.onRendered(function commentEditOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });

    autosize($('textarea'));
});

Template.comment_submit.onRendered(function commentSubmitOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});


Template.comment_card.helpers({
    ownComment: function () {
        if (Meteor.user() && Meteor.user().username === this.author) {
            return true;
        }
        else return false;
    },
    showCommentEdit: function() {
        return Template.instance().showCommentEdit.get();
    },

    inappropriate: function() {
        if (this.flags >= FLAG_THRESHOLD.comment) {
            return true;
        }
        else {
            return false;
        }
    },
    flaggedClass: function() {
        if (Meteor.user() && !_.include(this.flaggers, Meteor.user().username)) {
            return 'flaggable';
        }
        else {
            return 'hollow unflag';
        }
    },
    userHasFlagged: function() {
        if (Meteor.user() && _.include(this.flaggers, Meteor.user().username)) {
            return true;
        }
        else return false;
    },
});

Template.comment_edit.helpers({
    ownComment: function () {
        if (Meteor.user() && Meteor.user().username === this.author) {
            return true;
        }
        else return false;
    },

    settings: function() {
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

Template.comment_submit.helpers({

    settings: function() {
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


Template.comment_card.events({
    'click .comment-edit': function (e, template) {
        e.preventDefault();

        //toggle the "comment edit" template
        template.showCommentEdit.set(!template.showCommentEdit.get());
    },

    'click .flag.flaggable': function(e) {
        e.preventDefault();

        flag.call({
            commentId: this._id,
        });
    },
    'click .flag.unflag': function (e) {
        e.preventDefault();

        unflag.call({
            commentId: this._id,
        });
    }
});

Template.comment_edit.events({
    'submit form.comment-edit-form': function(e, template) {
        e.preventDefault();

        edit.call({
            commentId: this._id,
            text: $(e.target).find('[name=text]').val(),
        }, (err, res) => {
            if (err) {
                throwError(err.reason);
            }
            else {
                throwSuccess('Comment saved');

                //hide the edit form after it's been submitted
                //fixme: this is apparently super bad practice - https://forums.meteor.com/t/access-parent-template-reactivevar-from-child-template/973
                template.view.parentView.parentView._templateInstance.showCommentEdit.set(false);
            }
        });
    },
    'click .delete': function(e) {
        e.preventDefault();

        if (confirm("Are you sure you want to delete this comment?")) {
            deleteComment.call({
                commentId: this._id,
            }, (err, res) => {
                if (err) {
                    throwError(err.reason);
                }
                else {
                    throwSuccess('Comment deleted');
                }
            });
        }
    },
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
});

Template.comment_submit.events({
    'submit form.comment-submit-form': function(e) {
        e.preventDefault();

        let $text = $(e.target).find('[name=text]');
        insert.call({
            userPostId: this._id,
            text: $text.val(),
        }, (err, res) => {
            if (err) {
                throwError(err.reason);
            }
            else {
                // success!
                $text.val('');
            }
        });
    },
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
});


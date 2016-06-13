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

// component used for the "user_post_edit" template
import './../../components/app-not-authorized.js';

/*import './comment-card.html';
import './comment-edit.html';
import './comment-submit.html';*/


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
        //...
    });
});

Template.comment_submit.onCreated(function commentSubmitOnCreated() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});


Template.comment_card.onRendered(function commentCardOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.comment_edit.onRendered(function commentEditOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
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
});

Template.comment_submit.helpers({

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
    }
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


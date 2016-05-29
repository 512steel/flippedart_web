import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';

import { ChatSessions } from '../../../api/chat-sessions/chat-sessions.js';

import { ChatMessages } from '../../../api/chat-messages/chat-messages.js';
import {
    insert as insertChatMessage,
    deleteChatMessage,
} from '../../../api/chat-messages/methods.js';

import './chat-window-card.html';
import './chat-message-card.html';
import './chat-message-submit.html';


Template.chat_window_card.onCreated(function chatWindowCardOnCreated() {
    this.getOtherUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {
        if (Meteor.user()) {
            this.subscribe('chatSession.single', this.getOtherUsername());
            this.chatMessagesSubscription = Meteor.subscribeWithPagination('chatMessages.session', this.getOtherUsername(), {sort: {createdAt: -1}}, 3);
        }
    });

    this.getCurrentChatSession = () => ChatSessions.findOne({});
});

Template.chat_message_card.onCreated(function chatMessageCardOnCreated() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});

Template.chat_message_submit.onCreated(function chatMessageSubmitOnCreated() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });

    this.getCurrentChatSession = () => ChatSessions.findOne({});
});


Template.chat_window_card.onRendered(function chatWindowCardOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.chat_message_card.onRendered(function chatMessageCardOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.chat_message_submit.onRendered(function chatMessageSumbitOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});


Template.chat_window_card.helpers({
    currentChatSession: function() {
        return Template.instance().getCurrentChatSession();
    },

    yourUsername: function() {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    },
    otherUsername: function() {
        return Template.instance().getOtherUsername();
    },
    isOwnPageUsername: function() {
        if (Meteor.user()) {
            if (Template.instance().getOtherUsername() == Meteor.user().username) {
                return true;
            }
        }
        return false;
    },

    chatMessages: function() {

        return ChatMessages.find({}, {sort: {createdAt: -1}});
    },
    hasMoreChatMessages: function() {
        const sub = Template.instance().chatMessagesSubscription;

        return sub.loaded() < Counts.get('chatMessages.session.count') &&
            sub.loaded() == sub.limit();
    }
});

Template.chat_message_card.helpers({
    senderClass: function() {
        if (this.senderUserName == Meteor.user().username) {
            return "mine";
        }
        else return "not-mine";
    },
});

Template.chat_message_submit.helpers({

});


Template.chat_window_card.events({
    'click .js-load-more-chat-messages': function(e) {
        e.preventDefault();

        Template.instance().chatMessagesSubscription.loadNextPage();
    },
});

Template.chat_message_card.events({
    'click .chat-message-delete': function(e) {
        e.preventDefault();

        if (confirm("Are you sure you want to delete this message?")) {
            deleteChatMessage.call({
                chatMessageId: this._id,
            }, (err, res) => {
                if (err) {
                    throwError('Sorry, there was a problem deleting this message.');
                }
            });
        }
    }
});

Template.chat_message_submit.events({
    'submit form.chat-message-form': function(e) {
        e.preventDefault();

        var $messageText = $(e.target).find('[name=text]');

        insertChatMessage.call({
            text: $messageText.val(),
            chatSessionId: Template.instance().getCurrentChatSession()._id,
            imageLink: " ".trim()  //TODO - get the actual link from cloudinary API here (once "hiding" is in place)
        }, (err, res) => {
            if (err) {
                //FIXME...
                throwError(error);
            }
            else {
                $messageText.val('');
            }
        });

        //window.scrollTo(0,document.body.scrollHeight);
    }
});



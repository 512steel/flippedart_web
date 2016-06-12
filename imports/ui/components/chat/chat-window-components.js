import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';

import { ChatSessions } from '../../../api/chat-sessions/chat-sessions.js';

import { ChatMessages } from '../../../api/chat-messages/chat-messages.js';
import {
    insert as insertChatMessage,
    deleteChatMessage,
} from '../../../api/chat-messages/methods.js';

import {
    throwError,
    throwSuccess } from '../../lib/temporary-alerts.js';

import './chat-window-card.html';
import './chat-message-card.html';
import './chat-message-submit.html';
import './chat-sessions-list-page.html';


Template.chat_window_card.onCreated(function chatWindowCardOnCreated() {
    this.getOtherUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {
        if (Meteor.user()) {
            this.subscribe('chatSession.single', this.getOtherUsername());
            this.chatMessagesSubscription = Meteor.subscribeWithPagination('chatMessages.session', this.getOtherUsername(), {sort: {createdAt: -1}}, 20);
        }
    });

    this.getCurrentChatSession = () => ChatSessions.findOne({});

    const resizeCardElements = _.throttle(function() {
        //reset this for a more accurate first-time measurement
        $('#chat-window-messages-scrollable').css('height', '0px');

        var headerHeight;
        if($('.title-bar').css('display') == 'none') {
            headerHeight = $('.top-bar').outerHeight();
        }
        else {
            headerHeight = $('.title-bar').outerHeight();
        }
        var titleHeight = $('#chat-window-title').outerHeight();
        var submitHeight = $('#chat-message-submit-wrap-outer').outerHeight();
        var messagesElementHeight = $(window).height() - headerHeight - titleHeight - submitHeight - '50';

        if (messagesElementHeight > 0) {
            $('#chat-window-messages-scrollable').css('height', messagesElementHeight + "px");
        }

    }, 100);
    $(window).resize(resizeCardElements);
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

Template.chat_sessions_list_page.onCreated(function() {
    this.autorun(() => {
        if (Meteor.user()) {
            this.subscribe('chatSessions.user');
        }
    });

    this.getUserChatSessions = () => ChatSessions.find({});
});


Template.chat_window_card.onRendered(function chatWindowCardOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });

    //hacky way to resize the chat window elements after the DOM is rendered
    Meteor.setTimeout(function(){
        $(window).resize();

        var el = document.getElementById('chat-window-messages-scrollable');
        el.scrollTop = el.scrollHeight;
    }, 200);
    Meteor.setTimeout(function(){

    }, 500);
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

    chatMessagesCount: function() {

        //TODO: listen here for a change in the count.  If it's higher than the previous count, show in the UI that new messages have arrived.
        //If the chat-window-messages-scrollable is scrolled to the bottom, remove the UI piece.
        return ChatMessages.find({}).count();
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

Template.chat_sessions_list_page.helpers({
    chatSessions: function() {
        return Template.instance().getUserChatSessions();
    },
    determineChatSessionName: function() {
        if (Meteor.user()) {
            if (Meteor.user().username == this.firstUserName) {
                return this.secondUserName;
            }
            else return this.firstUserName;
        }
    }
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
                throwError(error.reason);
            }
            else {
                $messageText.val('');
            }
        });

        //window.scrollTo(0,document.body.scrollHeight);
    }
});



import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';

import { ChatSessions } from '../../../api/chat-sessions/chat-sessions.js';

import { ChatMessages } from '../../../api/chat-messages/chat-messages.js';
import {
    insert,
    deleteChatMessage,
} from '../../../api/chat-messages/methods.js';

import './chat-window-card.html';
import './chat-message-card.html';
import './chat-message-submit.html';


Template.chat_window_card.onCreated(function chatWindowCardOnCreated() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
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

});

Template.chat_message_card.helpers({

});

Template.chat_message_submit.helpers({

});


Template.chat_window_card.helpers({

});

Template.chat_message_card.helpers({

});

Template.chat_message_submit.helpers({

});



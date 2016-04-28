Template.chatMessageSubmit.onCreated(function() {
    Session.set('chatMessageSubmitErrors', {});
});
Template.existingChatWindow.onRendered(function() {
    window.scrollTo(0,document.body.scrollHeight);
});

Template.chatWindow.helpers({
    isChatSession: function() {
        if (!Meteor.user() || !this.chatSession) {
            return false;
        }
        else return true;
    }
});

Template.existingChatWindow.helpers({
    chatMessagesCount: function() {
        return this.chatMessages.fetch().length;
    },
    yourName: function () {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    },
    otherName: function() {
        if (this.chatSession.firstUserId == Meteor.userId()) {
            return this.chatSession.secondUsername;
        }
        else if (this.chatSession.secondUserId == Meteor.userId()) {
            return this.chatSession.firstUsername;
        }
    },
    chatMessagesReversed: function() {
        return this.chatMessages.fetch().reverse();
    }
});
Template.chatMessage.helpers({
    senderClass: function() {
        if (this.senderId == Meteor.userId()) {
            return "mine";
        }
        else return "not-mine";
    },
    ownMessage: function () {
        return this.senderId === Meteor.userId();
    }
});
Template.chatMessageSubmit.helpers({
    errorMessage: function(field) {
        return Session.get('chatMessageSubmitErrors')[field];
    },
    errorClass: function (field) {
        return !!Session.get('chatMessageSubmitErrors')[field] ? 'has-error' : '';
    }
});

Template.chatWindow.events({

});
Template.chatMessage.events({
    'click .chat-message-delete': function(e) {
        e.preventDefault();

        if (confirm("Are you sure you want to delete this message?")) {
            var currentMessageId = this._id;
            Meteor.call('chatMessageRemove', currentMessageId);
        }
    }
});
Template.chatMessageSubmit.events({
    'submit form.chat-message-form': function(e, template) {
        e.preventDefault();

        var $messageText = $(e.target).find('[name=text]');
        var message = {
            text: $messageText.val(),
            chatSessionId: this.chatSession._id,
            imageLink: " ".trim()  //TODO - get the actual link from imgur API here
        };

        var errors = {};
        if (!message.text && !message.imageLink) {
            errors.text = "Please include either text or an image";
            return Session.set('chatMessageSubmitErrors', errors);
        }

        Meteor.call('chatMessageInsert', message, function(error, result) {
            if (error) {
                throwError(error.reason);
            }
            else {
                $messageText.val('');
            }
        });

        window.scrollTo(0,document.body.scrollHeight);
    }
});
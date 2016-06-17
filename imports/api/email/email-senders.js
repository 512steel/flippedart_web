import { sanitizeHtml } from '../../ui/lib/general-helpers.js';

Meteor.methods({
    sendFeedbackEmail: function (senderName, senderEmail, text) {
        check(senderName, String);
        check(senderEmail, String);
        check(text, String);

        senderName = sanitizeHtml(senderName);
        senderEmail = sanitizeHtml(senderEmail);
        text = sanitizeHtml(text);
        const signedInName = Meteor.user() ? Meteor.user().username : "Not signed in";

        if (Meteor.isServer) {
            Email.send({
                from: "hello@flippedart.org",
                to: "hello@flippedart.org",
                subject: "Website feedback",
                text: "Feedback message from: " + senderName + " | " +
                        " fromEmail: " + senderEmail +
                        " (signed in as " + signedInName + ") " + " | " +
                        " message: " + text
            });
        }
    }
});

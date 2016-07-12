import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check } from 'meteor/check';
import { sanitizeHtml } from '../../ui/lib/general-helpers.js';

import './email-skeletons.js';
import { TRANSACTIONAL_EMAIL_SHELL } from './email-skeletons.js';

export const sendWebsiteFeedbackEmail = new ValidatedMethod({
    name: 'emails.send.websiteFeedback',
    validate: new SimpleSchema({
        senderName: { type: String },
        senderEmail: { type: String, regEx: SimpleSchema.RegEx.Email },
        text: { type: String },
    }).validator(),
    run({ senderName, senderEmail, text }) {

        if (Meteor.isServer) {
            //FIXME: this breaks the client if it's defined at the top of the file, for some reason.
            const sendgrid = require( 'sendgrid' ).SendGrid( Meteor.settings.private.email.sendgrid.api_key );

            senderName = sanitizeHtml(senderName);
            senderEmail = sanitizeHtml(senderEmail);
            text = sanitizeHtml(text);

            var signedInUser = "User is not signed in.";
            if (this.userId && Meteor.user()) {
                signedInUser = "User is signed in as " + Meteor.user().username;
            }

            var request = sendgrid.emptyRequest();
            request.body = TRANSACTIONAL_EMAIL_SHELL;

            request.body.categories[0] = "Website Feedback";
            request.body.content[0].value =
                "<html>" +
                "<p>" + senderName + " (" + senderEmail + ") said:</p>" +
                "<p>" + text + "</p>" +
                "<p>" + signedInUser + "</p>" +
                "</html>";
            request.body.personalizations[0].to[0].email = "hello@flippedart.org";
            request.body.personalizations[0].to[0].name = "Flipped Art";
            request.body.reply_to.email = senderEmail;
            request.body.reply_to.name = senderName;
            request.body.subject = "Website Feedback";
            request.body.template_id = "6b1c3b75-1e3c-4261-9b6b-770d97c1fc3f";  //Feedback template

            request.method = 'POST';
            request.path = '/v3/mail/send';
            sendgrid.API(request, function (response) {
                //TODO: return errors to the client
                console.log("Feedback email response: ", response.statusCode);
            });
        }
    }
});

//TODO:
// -"validate your email address" email on new user signup
// -"sign up for newsletter"

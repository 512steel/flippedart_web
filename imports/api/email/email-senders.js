import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check } from 'meteor/check';
import { sanitizeHtml } from '../../ui/lib/general-helpers.js';
import { Random } from 'meteor/random';

import './email-skeletons.js';
import { TRANSACTIONAL_EMAIL_SHELL } from './email-skeletons.js';
import {
    WELCOME_EMAIL_TEXT,
    FEEDBACK_EMAIL_TEXT } from './email-texts.js';

export const sendWebsiteFeedbackEmail = new ValidatedMethod({
    name: 'emails.send.websiteFeedback',
    validate: new SimpleSchema({
        senderName: {type: String},
        senderEmail: {type: String, regEx: SimpleSchema.RegEx.Email},
        text: {type: String},
    }).validator(),
    run({ senderName, senderEmail, text }) {

        if (Meteor.isServer) {
            //FIXME: this breaks the client if it's defined at the top of the file, for some reason.
            const sendgrid = require('sendgrid').SendGrid(Meteor.settings.private.email.sendgrid.api_key);

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
            request.body.content[0].value = FEEDBACK_EMAIL_TEXT(senderName, senderEmail, signedInUser, text);
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


export const sendWelcomeEmail = new ValidatedMethod({
    name: 'emails.send.welcome',
    validate: new SimpleSchema({
        username: {type: String},
        userEmail: {type: String, regEx: SimpleSchema.RegEx.Email}
    }).validator(),
    run({ username, userEmail }) {

        if (Meteor.isServer) {
            //FIXME: this breaks the client if it's defined at the top of the file, for some reason.
            const sendgrid = require('sendgrid').SendGrid(Meteor.settings.private.email.sendgrid.api_key);

            username = sanitizeHtml(username);
            userEmail = sanitizeHtml(userEmail);

            var request = sendgrid.emptyRequest();
            request.body = TRANSACTIONAL_EMAIL_SHELL;

            request.body.categories[0] = "Welcome";
            request.body.content[0].value = WELCOME_EMAIL_TEXT(username);
            request.body.personalizations[0].to[0].email = userEmail;
            request.body.personalizations[0].to[0].name = username;
            request.body.reply_to.email = "hello@flippedart.org";
            request.body.reply_to.name = "Flipped Art";
            request.body.subject = "Hi " + username + ", welcome to Flipped Art!";
            request.body.template_id = "955f781c-be48-4375-a2c7-4688a2ae76ba";  //Welcome template

            request.method = 'POST';
            request.path = '/v3/mail/send';
            sendgrid.API(request, function (response) {
                //TODO: return errors to the client
                console.log("Welcome email response for " + username + ": ", response.statusCode);
            });
        }
    }
});


//FIXME
// NOTE: this is VERY slightly modified from Accounts.sendVerificationEmail in the accounts-password package, to account for a bug.
/**
 * @summary Send an email with a link the user can use verify their email address.
 * @locus Server
 * @param {String} userId The id of the user to send email to.
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first unverified email in the list.
 * @importFromPackage accounts-base
 */
Meteor.methods({
    'sendVerificationEmailNew': function (userId, address) {
        if (Meteor.isServer) {
            // Make sure the user exists, and address is one of their addresses.
            var user = Meteor.users.findOne(userId);
            if (!user)
                throw new Error("Can't find user");
            // pick the first unverified address if we weren't passed an address.
            if (!address) {
                var email = _.find(user.emails || [],
                    function (e) {
                        return !e.verified;
                    });
                address = (email || {}).address;

                if (!address) {
                    throw new Error("That user has no unverified email addresses.");
                }
            }
            // make sure we have a valid address
            if (!address || !_.contains(_.pluck(user.emails || [], 'address'), address))
                throw new Error("No such email address for user.");

            var tokenRecord = {
                token: Random.secret(),  //FIXME: Random isn't defined here.
                address: address,
                when: new Date()
            };
            Meteor.users.update(
                {_id: userId},
                {$push: {'services.email.verificationTokens': tokenRecord}});

            // before passing to template, update user object with new token
            Meteor._ensure(user, 'services', 'email');
            if (!user.services.email.verificationTokens) {
                user.services.email.verificationTokens = [];
            }
            user.services.email.verificationTokens.push(tokenRecord);

            var verifyEmailUrl = Accounts.urls.verifyEmail(tokenRecord.token);
            verifyEmailUrl = verifyEmailUrl.replace('#/', '');  // NOTE: including a hash in the reset-url is a bug:  http://stackoverflow.com/questions/24295400/meteor-reset-password-clicking-on-e-mail-link-doesnt-work

            var options = {
                to: address,
                from: Accounts.emailTemplates.verifyEmail.from
                    ? Accounts.emailTemplates.verifyEmail.from(user)
                    : Accounts.emailTemplates.from,
                subject: Accounts.emailTemplates.verifyEmail.subject(user)
            };

            if (typeof Accounts.emailTemplates.verifyEmail.text === 'function') {
                options.text =
                    Accounts.emailTemplates.verifyEmail.text(user, verifyEmailUrl);
            }

            if (typeof Accounts.emailTemplates.verifyEmail.html === 'function')
                options.html =
                    Accounts.emailTemplates.verifyEmail.html(user, verifyEmailUrl);

            if (typeof Accounts.emailTemplates.headers === 'object') {
                options.headers = Accounts.emailTemplates.headers;
            }

            //TODO: alter the "emailTemplates" here to include a welcome message.

            Email.send(options);
            //FIXME: send this instead via the SendGrid API
        }
    }
});


//TODO:
// -"sign up for newsletter" (using Contacts API, separate unsubscribe group)
// -Transaction events (request, approve, complete, decline, cancel) - send to both users each time.
// -someone commented on your post
// -someone tagged you in a post
// -"verify email" via sendgrid API instead of Email.send();


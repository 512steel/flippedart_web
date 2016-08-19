import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check } from 'meteor/check';
import { sanitizeHtml } from '../../ui/lib/general-helpers.js';
import { Random } from 'meteor/random';

import {
    TRANSACTION_STATES,
    COMMENT_EVENT_TYPES,
    RECENT_ACTIVITY_TYPES,
} from './../../ui/lib/globals.js';

import { createRecentActivity } from './../recent-activity/methods.js';

import './email-skeletons.js';
import { TRANSACTIONAL_EMAIL_SHELL } from './email-skeletons.js';
import {
    WELCOME_EMAIL_TEXT,
    FEEDBACK_EMAIL_TEXT,

    YOUR_PROJECT_HAS_BEEN_REQUESTED_TEXT,
    YOU_HAVE_REQUESTED_A_PROJECT_TEXT,
    YOUR_PROJECT_REQUEST_HAS_BEEN_APPROVED_TEXT,
    YOU_HAVE_APPROVED_A_PROJECT_TRANSACTION_TEXT,
    YOUR_PROJECT_REQUEST_HAS_BEEN_COMPLETED_TEXT,
    YOU_HAVE_COMPLETED_A_PROJECT_REQUEST_TEXT,
    YOUR_PROJECT_REQUEST_HAS_BEEN_DECLINED_TEXT,
    YOU_HAVE_DECLINED_A_PROJECT_REQUEST_TEXT,
    YOU_HAVE_CANCELLED_A_PROJECT_REQUEST_TEXT,
    SOMEONE_HAS_CANCELLED_YOUR_PROJECT_REQUEST_TEXT,

    SOMEONE_HAS_COMMENTED_ON_YOUR_POST_TEXT,
    MORE_PEOPLE_HAVE_COMMENTED_ON_YOUR_POST_TEXT,

    BOOKING_REQUEST_EMAIL_TEXT,
    BOOKING_REQUEST_CONFIRMATION_TEXT,
} from './email-texts.js';

export const sendWebsiteFeedbackEmail = new ValidatedMethod({
    name: 'emails.send.websiteFeedback',
    validate: new SimpleSchema({
        senderName: {type: String},
        senderEmail: {type: String, regEx: SimpleSchema.RegEx.Email},
        text: {type: String},
    }).validator(),
    run({ senderName, senderEmail, text }) {
        this.unblock();

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
                if (response.statusCode >= 400) {
                    console.log(response);
                }
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
        this.unblock();

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
                if (response.statusCode >= 400) {
                    console.log(response);
                }
            });

            const link = "https://www.flippedart.org/" + username;
            createRecentActivity(username, null, RECENT_ACTIVITY_TYPES.newUser, link);
        }
    }
});


export const sendTransactionEventEmail = new ValidatedMethod({
    name: 'emails.send.transactionEvent',
    validate: new SimpleSchema({
        requesterId: {type: String, regEx: SimpleSchema.RegEx.Id},
        requesterName: {type: String},
        requesteeId: {type: String, regEx: SimpleSchema.RegEx.Id},
        requesteeName: {type: String},
        state: {type: String}
    }).validator(),
    run({ requesterId, requesterName, requesteeId, requesteeName, state }) {
        this.unblock();

        if (Meteor.isServer) {
            //FIXME: this breaks the client if it's defined at the top of the file, for some reason.
            const sendgrid = require('sendgrid').SendGrid(Meteor.settings.private.email.sendgrid.api_key);

            let requesterEmail = Meteor.users.findOne(requesterId).emails[0].address;
            let requesteeEmail = Meteor.users.findOne(requesteeId).emails[0].address;

            console.log('in sendTransactionEventEmail');
            console.log(requesterId, requesterName, requesterEmail, requesteeId, requesteeName, requesteeEmail, state);

            //Send email to requester
            {
                var requesterRequest = sendgrid.emptyRequest();
                requesterRequest.body = TRANSACTIONAL_EMAIL_SHELL;

                requesterRequest.body.categories[0] = "Transaction Event";

                if (state == TRANSACTION_STATES.requested) {
                    requesterRequest.body.content[0].value = YOU_HAVE_REQUESTED_A_PROJECT_TEXT(requesteeName, requesterName);
                }
                else if (state == TRANSACTION_STATES.approved) {
                    requesterRequest.body.content[0].value = YOUR_PROJECT_REQUEST_HAS_BEEN_APPROVED_TEXT(requesteeName, requesterName);
                }
                else if (state == TRANSACTION_STATES.completed) {
                    requesterRequest.body.content[0].value = YOUR_PROJECT_REQUEST_HAS_BEEN_COMPLETED_TEXT(requesteeName, requesterName);
                }
                else if (state == TRANSACTION_STATES.declined) {
                    requesterRequest.body.content[0].value = YOUR_PROJECT_REQUEST_HAS_BEEN_DECLINED_TEXT(requesteeName, requesterName);
                }
                else if (state == TRANSACTION_STATES.cancelled) {
                    requesterRequest.body.content[0].value = YOU_HAVE_CANCELLED_A_PROJECT_REQUEST_TEXT(requesteeName, requesterName);
                }

                requesterRequest.body.personalizations[0].to[0].email = requesterEmail;
                requesterRequest.body.personalizations[0].to[0].name = requesterName;
                requesterRequest.body.reply_to.email = "hello@flippedart.org";
                requesterRequest.body.reply_to.name = "Flipped Art";

                if (state == TRANSACTION_STATES.requested) {
                    requesterRequest.body.subject = "You have requested a project from " + requesteeName;
                }
                else if (state == TRANSACTION_STATES.approved) {
                    requesterRequest.body.subject = "Your request has been approved!";
                }
                else if (state == TRANSACTION_STATES.completed) {
                    requesterRequest.body.subject = "Congrats, " + requesteeName + " has completed your project request!";
                }
                else if (state == TRANSACTION_STATES.declined) {
                    requesterRequest.body.subject = requesteeName + " has declined your request";
                }
                else if (state == TRANSACTION_STATES.cancelled) {
                    requesterRequest.body.subject = "You have cancelled your request";
                }

                requesterRequest.body.template_id = "3944972c-0a18-43ab-bb33-006fb0d5a3c7";  //Transaction event template

                requesterRequest.method = 'POST';
                requesterRequest.path = '/v3/mail/send';
                sendgrid.API(requesterRequest, function (response) {
                    //TODO: return errors to the client
                    console.log("Transaction Event email response for " + requesterName + ": ", response.statusCode);
                    if (response.statusCode >= 400) {
                        console.log(response);
                    }
                });
            }

            //Send email to requestee
            {
                var requesteeRequest = sendgrid.emptyRequest();
                requesteeRequest.body = TRANSACTIONAL_EMAIL_SHELL;

                requesteeRequest.body.categories[0] = "Transaction Event";

                if (state == TRANSACTION_STATES.requested) {
                    requesteeRequest.body.content[0].value = YOUR_PROJECT_HAS_BEEN_REQUESTED_TEXT(requesteeName, requesterName);
                }
                else if (state == TRANSACTION_STATES.approved) {
                    requesteeRequest.body.content[0].value = YOU_HAVE_APPROVED_A_PROJECT_TRANSACTION_TEXT(requesteeName, requesterName);
                }
                else if (state == TRANSACTION_STATES.completed) {
                    requesteeRequest.body.content[0].value = YOU_HAVE_COMPLETED_A_PROJECT_REQUEST_TEXT(requesteeName, requesterName);
                }
                else if (state == TRANSACTION_STATES.declined) {
                    requesteeRequest.body.content[0].value = YOU_HAVE_DECLINED_A_PROJECT_REQUEST_TEXT(requesteeName, requesterName);
                }
                else if (state == TRANSACTION_STATES.cancelled) {
                    requesteeRequest.body.content[0].value = SOMEONE_HAS_CANCELLED_YOUR_PROJECT_REQUEST_TEXT(requesteeName, requesterName);
                }

                requesteeRequest.body.personalizations[0].to[0].email = requesteeEmail;
                requesteeRequest.body.personalizations[0].to[0].name = requesterName;
                requesteeRequest.body.reply_to.email = "hello@flippedart.org";
                requesteeRequest.body.reply_to.name = "Flipped Art";

                if (state == TRANSACTION_STATES.requested) {
                    requesteeRequest.body.subject = requesterName + " has requested a project from you";
                }
                else if (state == TRANSACTION_STATES.approved) {
                    requesteeRequest.body.subject = "You have approved " + requesterName + "'s request";
                }
                else if (state == TRANSACTION_STATES.completed) {
                    requesteeRequest.body.subject = "Yay! You have completed " + requesterName + "'s project request";
                }
                else if (state == TRANSACTION_STATES.declined) {
                    requesteeRequest.body.subject = "You have declined " + requesterName + "'s project request";
                }
                else if (state == TRANSACTION_STATES.cancelled) {
                    requesteeRequest.body.subject = requesterName + " has cancelled their request";
                }

                requesteeRequest.body.template_id = "3944972c-0a18-43ab-bb33-006fb0d5a3c7";  //Transaction event template

                requesteeRequest.method = 'POST';
                requesteeRequest.path = '/v3/mail/send';
                sendgrid.API(requesteeRequest, function (response) {
                    //TODO: return errors to the client
                    console.log("Transaction Event email response for " + requesteeName + ": ", response.statusCode);
                    if (response.statusCode >= 400) {
                        console.log(response);
                    }
                });
            }

        }
    }
});


export const sendCommentEventEmail = new ValidatedMethod({
    name: 'emails.send.commentEvent',
    validate: new SimpleSchema({
        commenterName: {type: String, optional: true},
        commenteeName: {type: String},
        userPostId: {type: String, regEx: SimpleSchema.RegEx.Id},
        userPostText: {type: String},
        commentEventType: {type: String},
    }).validator(),
    run({ commenterName, commenteeName, userPostId, userPostText, commentEventType }) {
        this.unblock();

        if (Meteor.isServer) {
            //FIXME: this breaks the client if it's defined at the top of the file, for some reason.
            const sendgrid = require('sendgrid').SendGrid(Meteor.settings.private.email.sendgrid.api_key);

            let commenteeEmail = Meteor.users.findOne({username: commenteeName}).emails[0].address;
            let userPostTextFirstPart = userPostText.substring(0, 60);  // guesstimate length

            if (commenteeEmail) {
                var request = sendgrid.emptyRequest();
                request.body = TRANSACTIONAL_EMAIL_SHELL;

                request.body.categories[0] = "Comment Event";

                if (commentEventType == COMMENT_EVENT_TYPES.single) {
                    request.body.content[0].value = SOMEONE_HAS_COMMENTED_ON_YOUR_POST_TEXT(commenteeName, commenterName, userPostId, userPostTextFirstPart);
                }
                else if (commentEventType == COMMENT_EVENT_TYPES.multiple) {
                    request.body.content[0].value = MORE_PEOPLE_HAVE_COMMENTED_ON_YOUR_POST_TEXT(commenteeName, userPostId, userPostTextFirstPart);
                }

                request.body.personalizations[0].to[0].email = commenteeEmail;
                request.body.personalizations[0].to[0].name = commenteeName;
                request.body.reply_to.email = "hello@flippedart.org";
                request.body.reply_to.name = "Flipped Art";

                if (commentEventType == COMMENT_EVENT_TYPES.single) {
                    request.body.subject = commenterName + " has commented on your post";
                }
                else if (commentEventType == COMMENT_EVENT_TYPES.multiple) {
                    request.body.subject = "Your post is getting popular!";
                }

                request.body.template_id = "3944972c-0a18-43ab-bb33-006fb0d5a3c7";  //Transaction event template

                request.method = 'POST';
                request.path = '/v3/mail/send';
                sendgrid.API(request, function (response) {
                    //TODO: return errors to the client
                    console.log("Comment event email response for " + commenterName + " commenting on " + commenteeName + "'s post: ", response.statusCode);
                    if (response.statusCode >= 400) {
                        console.log(response);
                    }
                });
            }
        }
    }
});


export const sendBookingRequestEmail = new ValidatedMethod({
    name: 'emails.send.bookingRequest',
    validate: new SimpleSchema({
        bookingRequestObject: {type: Object},
        'bookingRequestObject.eventType': {type: String},
        'bookingRequestObject.eventName': {type: String},
        'bookingRequestObject.ageRange': {type: String},
        'bookingRequestObject.contactEmail': {type: String, regEx: SimpleSchema.RegEx.Email},
        'bookingRequestObject.additionalDetails': {type: String},
    }).validator(),
    run({ bookingRequestObject }) {
        this.unblock();

        if (Meteor.isServer) {
            //FIXME: this breaks the client if it's defined at the top of the file, for some reason.
            const sendgrid = require('sendgrid').SendGrid(Meteor.settings.private.email.sendgrid.api_key);

            bookingRequestObject.eventType = sanitizeHtml(bookingRequestObject.eventType);
            bookingRequestObject.eventName = sanitizeHtml(bookingRequestObject.eventName);
            bookingRequestObject.ageRange = sanitizeHtml(bookingRequestObject.ageRange);
            bookingRequestObject.contactEmail = sanitizeHtml(bookingRequestObject.contactEmail);
            bookingRequestObject.additionalDetails = sanitizeHtml(bookingRequestObject.additionalDetails);


            {
                var signedInUser = "User is not signed in.";
                if (this.userId && Meteor.user()) {
                    signedInUser = "User is signed in as " + Meteor.user().username;
                }

                var bookingToFlippedArtRequest = sendgrid.emptyRequest();
                bookingToFlippedArtRequest.body = TRANSACTIONAL_EMAIL_SHELL;

                bookingToFlippedArtRequest.body.categories[0] = "Booking Request";
                bookingToFlippedArtRequest.body.content[0].value = BOOKING_REQUEST_EMAIL_TEXT(bookingRequestObject, signedInUser);
                bookingToFlippedArtRequest.body.personalizations[0].to[0].email = "hello@flippedart.org";
                bookingToFlippedArtRequest.body.personalizations[0].to[0].name = "Flipped Art";
                bookingToFlippedArtRequest.body.reply_to.email = bookingRequestObject.contactEmail;
                bookingToFlippedArtRequest.body.reply_to.name = bookingRequestObject.contactEmail;
                bookingToFlippedArtRequest.body.subject = "Booking Request";
                bookingToFlippedArtRequest.body.template_id = "3944972c-0a18-43ab-bb33-006fb0d5a3c7";  //Transaction event template

                bookingToFlippedArtRequest.method = 'POST';
                bookingToFlippedArtRequest.path = '/v3/mail/send';
                sendgrid.API(bookingToFlippedArtRequest, function (response) {
                    //TODO: return errors to the client
                    console.log("Feedback email response: ", response.statusCode);
                    if (response.statusCode >= 400) {
                        console.log(response);
                    }
                });
            }
            {
                var bookingToBookerRequest = sendgrid.emptyRequest();
                bookingToBookerRequest.body = TRANSACTIONAL_EMAIL_SHELL;

                bookingToBookerRequest.body.categories[0] = "Booking Request";
                bookingToBookerRequest.body.content[0].value = BOOKING_REQUEST_CONFIRMATION_TEXT(bookingRequestObject);
                bookingToBookerRequest.body.personalizations[0].to[0].email = bookingRequestObject.contactEmail;
                bookingToBookerRequest.body.personalizations[0].to[0].name = bookingRequestObject.contactEmail;
                bookingToBookerRequest.body.reply_to.email = "hello@flippedart.org";
                bookingToBookerRequest.body.reply_to.name = "Flipped Art";
                bookingToBookerRequest.body.subject = "Tiny Studio booking request confirmation";
                bookingToBookerRequest.body.template_id = "3944972c-0a18-43ab-bb33-006fb0d5a3c7";  //Transaction event template

                bookingToBookerRequest.method = 'POST';
                bookingToBookerRequest.path = '/v3/mail/send';
                sendgrid.API(bookingToBookerRequest, function (response) {
                    //TODO: return errors to the client
                    console.log("Feedback email response: ", response.statusCode);
                    if (response.statusCode >= 400) {
                        console.log(response);
                    }
                });
            }

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
        this.unblock();

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


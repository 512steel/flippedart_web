import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import { HEAD_DEFAULTS } from '../lib/globals.js';
import { throwError } from '../../ui/lib/temporary-alerts.js';

import './feedback-page.html';


Template.feedback_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | Feedback");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title + " | Feedback"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/feedback"});
    DocHead.addMeta({name: "og:image", content: "http://res.cloudinary.com/dwgim6or9/image/upload/v1467765602/flippedart_og_image_3_qtkwew.png"});
});

Template.feedback_page.events({
    'submit form.feedback-form': function(e) {
        e.preventDefault();
        e.preventDefault();

        const yourName = $(e.target).find('[name=your-name]').val();
        const yourEmail = $(e.target).find('[name=your-email]').val();
        const body = $(e.target).find('[name=body]').val();

        if (!body) {
            throwError("Please enter some text in the message body");
        }
        else {
            Meteor.call('sendFeedbackEmail', yourName, yourEmail, body, function(error, result) {
                if (error) {
                    throwError(error.reason);
                }
                else {
                    FlowRouter.go('static.feedback.thanks');
                }
            })
        }
    }
});
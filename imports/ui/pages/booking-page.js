import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import {
    HEAD_DEFAULTS,
    EVENT_TYPES,
    EMAIL_REGEX,
    EMAIL_WORD_BANK,
    TLD_WORD_BANK,
} from '../lib/globals.js';

import { sendBookingRequestEmail } from './../../api/email/email-senders.js';

import { throwError } from './../lib/temporary-alerts.js';

import './booking-page.html';


Template.booking_page.onCreated(() => {
    DocHead.setTitle(HEAD_DEFAULTS.title_short + " | Booking");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title_short + " | Booking"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});  //TODO: custom description here.
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/booking"});
    DocHead.addMeta({name: "og:image", content: HEAD_DEFAULTS.skyline_image});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});

    this.bookingRequest = new ReactiveVar({});

    this.speller = require('special-speller').specialSpeller;
});


Template.booking_page.onRendered(() => {

    $('.slider').each((idx) => {
        new Foundation.Slider(this);
    });


    autosize($('textarea'));
});


Template.booking_page.helpers({
    bookingRequest: () => {
        return this.bookingRequest.get();
    },
    eventTypes: () => {
        return EVENT_TYPES;
    },
    currentEventType: () => {
        return this.bookingRequest.get()['eventType'];
    }
});


Template.booking_page.events({
    //TODO: alter browser history for each step (so clicking the browser's back-button takes you to the previous step instead of all the way out)
    'click #booking-form .next-to-step-2:not(.disabled)': (e) => {
        e.preventDefault();

        $('#booking-form .step-1').fadeOut(() => {
            $('#booking-form .step-2').fadeIn();
        });
    },
    'click #booking-form .next-to-step-3:not(.disabled)': (e) => {
        e.preventDefault();

        $('#booking-form .step-2').fadeOut(() => {
            $('#booking-form .step-3').fadeIn();
        });
    },
    'click #booking-form .back-to-step-1': (e) => {
        e.preventDefault();

        $('#booking-form .step-2').fadeOut(() => {
            $('#booking-form .step-1').fadeIn();
        });
    },
    'click #booking-form .back-to-step-2': (e) => {
        e.preventDefault();

        $('#booking-form .step-3').fadeOut(() => {
            $('#booking-form .step-2').fadeIn();
        });
    },

    'click ul.select-box li': (e, target) => {
        e.preventDefault();

        //TODO: refactor this code to be used elsewhere (i.e. "are you an individual or organization?" on signup)

        let parent = $(e.target).parent();

        // first, clear selection
        parent.find('li').removeClass('selected');

        // then, add the 'selected' class to the correct element
        $(e.target).addClass('selected');

        let eventType = $(e.target)[0].dataset['name'];
        let bookingRequestObj = this.bookingRequest.get();
        bookingRequestObj['eventType'] = eventType;
        this.bookingRequest.set(bookingRequestObj);

        // NOTE: this could be bad if multiple steps/next-buttons were in the DOM at the same time.
        parent.parent().find('.next-button').removeClass('disabled');
    },
    'change #booking-form .select-age-range': (e) => {
        e.preventDefault();

        let ageRange = $(e.target)[0].value;
        let bookingRequestObj = this.bookingRequest.get();
        bookingRequestObj['ageRange'] = ageRange;
        this.bookingRequest.set(bookingRequestObj);
    },
    'blur #booking-form .event-name': (e) => {
        e.preventDefault();

        let eventName = $('#booking-form .event-name').val();
        let bookingRequestObj = this.bookingRequest.get();
        bookingRequestObj['eventName'] = eventName;
        this.bookingRequest.set(bookingRequestObj);
    },
    'blur #booking-form .contact-email': (e) => {
        e.preventDefault();

        let contactEmail = $('#booking-form .contact-email').val();
        let bookingRequestObj = this.bookingRequest.get();
        bookingRequestObj['contactEmail'] = contactEmail;
        this.bookingRequest.set(bookingRequestObj);
    },
    'keyup #booking-form .contact-email': (e) => {
        let contactEmail = $('#booking-form .contact-email').val();
        if (EMAIL_REGEX.test(contactEmail)) {
            let domain = contactEmail.match(/@((.+){2,})\./)[1];
            let tld = contactEmail.match(/\.((.+){2,})/)[1];

            let newDomain = speller(domain, EMAIL_WORD_BANK);
            let newTld = speller(tld, TLD_WORD_BANK);

            if (domain != newDomain || tld != newTld) {
                $('.email-suggestion').remove();  //helps avoid flicker and duplicate suggestions
                let helpStr = 'Did you mean <em><span class="suggestion">' + contactEmail.match(/(.+@)/)[1] + newDomain + '.' + newTld + '</span></em>?';
                $(e.target).after('<div class="email-suggestion">' + helpStr + '</div>');
            }
            else {
                $('.email-suggestion').remove();
            }
        }
        else {
            $('.email-suggestion').remove();
        }
    },
    'click .email-suggestion': (e, target) => {
        e.preventDefault();

        let suggestion = $(e.target).find('.suggestion')[0].innerHTML;
        $('#booking-form .contact-email').val(suggestion);
        $('.email-suggestion').remove();

        let bookingRequestObj = this.bookingRequest.get();
        bookingRequestObj['contactEmail'] = suggestion;
        this.bookingRequest.set(bookingRequestObj);
    },
    'keyup #booking-form .additional-details, blur #booking-form .additional-details': (e) => {
        e.preventDefault();

        let additionalDetails = $('#booking-form .additional-details').val();
        let bookingRequestObj = this.bookingRequest.get();
        bookingRequestObj['additionalDetails'] = additionalDetails;
        this.bookingRequest.set(bookingRequestObj);
    },

    'click #booking-form .next-to-submit': (e) => {
        e.preventDefault();

        //TODO: use throwError() for form validation, since "required" fields don't seem to work

        sendBookingRequestEmail.call({
            bookingRequestObject: this.bookingRequest.get(),
        }, (err, res) => {
            if (err) {
                throwError(err.reason);
            }
            else {
                $('#booking-form .step-3').fadeOut(() => {
                    FlowRouter.go('static.booking.thanks');
                });
            }
        });
    },

    'moved.zf.slider .slider': (e, target) => {
        e.preventDefault();

        console.log($('#sliderOutput1').val());
        console.log($('#sliderOutput2').val());
        console.log($('#sliderOutput3').val());
        console.log('########################');
    }
});

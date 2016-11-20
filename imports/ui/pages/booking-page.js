import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import {
    HEAD_DEFAULTS,
    EVENT_TYPES,
    EMAIL_REGEX,
    EMAIL_WORD_BANK,
    TLD_WORD_BANK,

    COMPUTE_INCOME_DISPLAY,
    COMPUTE_ATTENDANCE_DISPLAY,
    COMPUTE_TIME_DISPLAY,
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

    Session.set('hasBeenToStep2', false);

    this.drawCharts = _.throttle((bookinRequestObj) => {
        //console.log(bookinRequestObj);

        let incomeLeftCanvas = document.getElementById('incomeChartLeft');
        let incomeLineCanvas = document.getElementById('incomeChartLine');
        let incomeRightCanvas = document.getElementById('incomeChartRight');
        let incomeContainerWidth = $('.income-chart-container').width();

        let attendanceLeftCanvas = document.getElementById('attendanceChartLeft');
        let attendanceLineCanvas = document.getElementById('attendanceChartLine');
        let attendanceRightCanvas = document.getElementById('attendanceChartRight');
        let attendanceContainerWidth = $('.attendance-chart-container').width();

        let timeLeftCanvas = document.getElementById('timeChartLeft');
        let timeLineCanvas = document.getElementById('timeChartLine');
        let timeRightCanvas = document.getElementById('timeChartRight');
        let timeContainerWidth = $('.time-chart-container').width();

        let linePad = 2;  // NOTE: this is the padding in pixels between the slider line and the left/right sides of the chart.
        let lineWidth = 4;
        let chartCanvasHeight = 120;

        let chartLeftFillStyle = "rgba(90,151,156,0.85)";
        let chartLineStrokeStyle = "#aaaaaa";
        let chartRightFillStyle = "rgba(90,151,156,0.3)";

        //NOTE: should be " - lineWidth/2" below, but integer division might get wonky + shaving off the extra takes care of rounding errors that occasionally would push one of the charts to a new line.
        //NOTE: we use Math.max() because setting the canvas width to a negative number makes it angry.
        //NOTE: this is still buggy, as a 0-width side (on either extreme of the slider) pulls it out entirely, along with its padding, so the whole chart appears to squeeze inward on any other slider value.  The quick fix is restricting the data-slider attributes to 5-95, rather than 0-100.
        incomeLeftCanvas.width = Math.max(0, incomeContainerWidth * ((bookinRequestObj['incomeSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        incomeLineCanvas.width = lineWidth;
        incomeRightCanvas.width = Math.max(0, incomeContainerWidth * (1 - (bookinRequestObj['incomeSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        incomeLeftCanvas.height = chartCanvasHeight;
        incomeLineCanvas.height = chartCanvasHeight;
        incomeRightCanvas.height = chartCanvasHeight;

        attendanceLeftCanvas.width = Math.max(0, attendanceContainerWidth * ((bookinRequestObj['attendanceSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        attendanceLineCanvas.width = lineWidth;
        attendanceRightCanvas.width = Math.max(0, attendanceContainerWidth * (1 - (bookinRequestObj['attendanceSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        attendanceLeftCanvas.height = chartCanvasHeight;
        attendanceLineCanvas.height = chartCanvasHeight;
        attendanceRightCanvas.height = chartCanvasHeight;

        timeLeftCanvas.width = Math.max(0, timeContainerWidth * ((bookinRequestObj['timeSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        timeLineCanvas.width = lineWidth;
        timeRightCanvas.width = Math.max(0, timeContainerWidth * (1 - (bookinRequestObj['timeSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        timeLeftCanvas.height = chartCanvasHeight;
        timeLineCanvas.height = chartCanvasHeight;
        timeRightCanvas.height = chartCanvasHeight;

        //FIXME: the upper-left corners on all "right-side" charts feel off, depending on how wide they appear on the screen.

        //INCOME chart
        if (incomeLeftCanvas.getContext){
            var incomeLeftCtx = incomeLeftCanvas.getContext('2d');

            // Draw the chart counter-clockwise, beginning with the bottom-left corner.
            incomeLeftCtx.beginPath();
            incomeLeftCtx.moveTo(
                0,
                incomeLeftCanvas.height
            );  //bottom-left
            incomeLeftCtx.lineTo(
                incomeLeftCanvas.width,
                incomeLeftCanvas.height
            );  //bottom-right
            incomeLeftCtx.lineTo(
                incomeLeftCanvas.width,
                incomeLeftCanvas.height - (incomeLeftCanvas.height * (bookinRequestObj['incomeSlider'] / 100)) + lineWidth
            );  // upper-right corner

            incomeLeftCtx.closePath();
            incomeLeftCtx.stroke();

            incomeLeftCtx.fillStyle = chartLeftFillStyle;
            incomeLeftCtx.fill();
        }
        if (incomeLineCanvas.getContext){
            var incomeLineCtx = incomeLineCanvas.getContext('2d');

            let lineXPos = lineWidth / 2;
            let dotRadius = lineWidth / 2;

            incomeLineCtx.beginPath();
            incomeLineCtx.moveTo(
                lineXPos,
                incomeLineCanvas.height - dotRadius
            );  //bottom point of line
            incomeLineCtx.arc(
                lineXPos,
                incomeLineCanvas.height - dotRadius,
                dotRadius,
                1.5 * Math.PI,
                3.5 * Math.PI
            );  //bottom circle
            incomeLineCtx.lineTo(
                lineXPos,
                incomeLineCanvas.height - (incomeLineCanvas.height * (bookinRequestObj['incomeSlider'] / 100))
            );  //upward line
            incomeLineCtx.arc(
                lineXPos,
                incomeLineCanvas.height - (incomeLineCanvas.height * (bookinRequestObj['incomeSlider'] / 100)),
                dotRadius,
                1.5 * Math.PI,
                3.5 * Math.PI
            );  //top cirlce

            incomeLineCtx.closePath();

            incomeLineCtx.strokeStyle = chartLineStrokeStyle;
            incomeLineCtx.stroke();
        }
        if (incomeRightCanvas.getContext){
            var incomeRightCtx = incomeRightCanvas.getContext('2d');

            // Draw the chart counter-clockwise, beginning with the bottom-left corner.
            incomeRightCtx.beginPath();
            incomeRightCtx.moveTo(
                0,
                incomeRightCanvas.height
            );  //bottom-left
            incomeRightCtx.lineTo(
                incomeRightCanvas.width,
                incomeRightCanvas.height
            );  //bottom-right
            incomeRightCtx.lineTo(
                incomeRightCanvas.width,
                0 + lineWidth
            );  //upper-right corner
            incomeRightCtx.lineTo(
                0,
                incomeRightCanvas.height - (incomeRightCanvas.height * (bookinRequestObj['incomeSlider'] / 100))
            );  //upper-left corner

            incomeRightCtx.closePath();
            incomeRightCtx.stroke();

            incomeRightCtx.fillStyle = chartRightFillStyle;
            incomeRightCtx.fill();
        }

        //ATTENDANCE chart
        if (attendanceLeftCanvas.getContext){
            var attendanceLeftCtx = attendanceLeftCanvas.getContext('2d');

            // Draw the chart counter-clockwise, beginning with the bottom-left corner.
            attendanceLeftCtx.beginPath();
            attendanceLeftCtx.moveTo(
                0,
                attendanceLeftCanvas.height
            );  //bottom-left
            attendanceLeftCtx.lineTo(
                attendanceLeftCanvas.width,
                attendanceLeftCanvas.height
            );  //bottom-right
            attendanceLeftCtx.lineTo(
                attendanceLeftCanvas.width,
                attendanceLeftCanvas.height - (attendanceLeftCanvas.height * (bookinRequestObj['attendanceSlider'] / 100)) + lineWidth
            );  // upper-right corner

            attendanceLeftCtx.closePath();
            attendanceLeftCtx.stroke();

            attendanceLeftCtx.fillStyle = chartLeftFillStyle;
            attendanceLeftCtx.fill();
        }
        if (attendanceLineCanvas.getContext){
            var attendanceLineCtx = attendanceLineCanvas.getContext('2d');

            let lineXPos = lineWidth / 2;
            let dotRadius = lineWidth / 2;

            attendanceLineCtx.beginPath();
            attendanceLineCtx.moveTo(
                lineXPos,
                attendanceLineCanvas.height - dotRadius
            );  //bottom point of line
            attendanceLineCtx.arc(
                lineXPos,
                attendanceLineCanvas.height - dotRadius,
                dotRadius,
                1.5 * Math.PI,
                3.5 * Math.PI
            );  //bottom circle
            attendanceLineCtx.lineTo(
                lineXPos,
                attendanceLineCanvas.height - (attendanceLineCanvas.height * (bookinRequestObj['attendanceSlider'] / 100))
            );  //upward line
            attendanceLineCtx.arc(
                lineXPos,
                attendanceLineCanvas.height - (attendanceLineCanvas.height * (bookinRequestObj['attendanceSlider'] / 100)),
                dotRadius,
                1.5 * Math.PI,
                3.5 * Math.PI
            );  //top cirlce

            attendanceLineCtx.closePath();

            attendanceLineCtx.strokeStyle = chartLineStrokeStyle;
            attendanceLineCtx.stroke();
        }
        if (attendanceRightCanvas.getContext){
            var attendanceRightCtx = attendanceRightCanvas.getContext('2d');

            // Draw the chart counter-clockwise, beginning with the bottom-left corner.
            attendanceRightCtx.beginPath();
            attendanceRightCtx.moveTo(
                0,
                attendanceRightCanvas.height
            );  //bottom-left
            attendanceRightCtx.lineTo(
                attendanceRightCanvas.width,
                attendanceRightCanvas.height
            );  //bottom-right
            attendanceRightCtx.lineTo(
                attendanceRightCanvas.width,
                0 + lineWidth
            );  //upper-right corner
            attendanceRightCtx.lineTo(
                0,
                attendanceRightCanvas.height - (attendanceRightCanvas.height * (bookinRequestObj['attendanceSlider'] / 100))
            );  //upper-left corner

            attendanceRightCtx.closePath();
            attendanceRightCtx.stroke();

            attendanceRightCtx.fillStyle = chartRightFillStyle;
            attendanceRightCtx.fill();
        }

        //TIME chart
        //FIXME: curve the top of this line to follow the equation Math.pow(x, 0.9)
        if (timeLeftCanvas.getContext){
            var timeLeftCtx = timeLeftCanvas.getContext('2d');

            // Draw the chart counter-clockwise, beginning with the bottom-left corner.
            timeLeftCtx.beginPath();
            timeLeftCtx.moveTo(
                0,
                timeLeftCanvas.height
            );  //bottom-left
            timeLeftCtx.lineTo(
                timeLeftCanvas.width,
                timeLeftCanvas.height
            );  //bottom-right
            timeLeftCtx.lineTo(
                timeLeftCanvas.width,
                timeLeftCanvas.height - (timeLeftCanvas.height * (bookinRequestObj['timeSlider'] / 100)) + lineWidth
            );  // upper-right corner

            timeLeftCtx.closePath();
            timeLeftCtx.stroke();

            timeLeftCtx.fillStyle = chartLeftFillStyle;
            timeLeftCtx.fill();
        }
        if (timeLineCanvas.getContext){
            var timeLineCtx = timeLineCanvas.getContext('2d');

            let lineXPos = lineWidth / 2;
            let dotRadius = lineWidth / 2;

            timeLineCtx.beginPath();
            timeLineCtx.moveTo(
                lineXPos,
                timeLineCanvas.height - dotRadius
            );  //bottom point of line
            timeLineCtx.arc(
                lineXPos,
                timeLineCanvas.height - dotRadius,
                dotRadius,
                1.5 * Math.PI,
                3.5 * Math.PI
            );  //bottom circle
            timeLineCtx.lineTo(
                lineXPos,
                timeLineCanvas.height - (timeLineCanvas.height * (bookinRequestObj['timeSlider'] / 100))
            );  //upward line
            timeLineCtx.arc(
                lineXPos,
                timeLineCanvas.height - (timeLineCanvas.height * (bookinRequestObj['timeSlider'] / 100)),
                dotRadius,
                1.5 * Math.PI,
                3.5 * Math.PI
            );  //top cirlce

            timeLineCtx.closePath();

            timeLineCtx.strokeStyle = chartLineStrokeStyle;
            timeLineCtx.stroke();
        }
        if (timeRightCanvas.getContext){
            var timeRightCtx = timeRightCanvas.getContext('2d');

            // Draw the chart counter-clockwise, beginning with the bottom-left corner.
            timeRightCtx.beginPath();
            timeRightCtx.moveTo(
                0,
                timeRightCanvas.height
            );  //bottom-left
            timeRightCtx.lineTo(
                timeRightCanvas.width,
                timeRightCanvas.height
            );  //bottom-right
            timeRightCtx.lineTo(
                timeRightCanvas.width,
                0 + lineWidth
            );  //upper-right corner
            timeRightCtx.lineTo(
                0,
                timeRightCanvas.height - (timeRightCanvas.height * (bookinRequestObj['timeSlider'] / 100)) + (lineWidth/2)
            );  //upper-left corner

            timeRightCtx.closePath();
            timeRightCtx.stroke();

            timeRightCtx.fillStyle = chartRightFillStyle;
            timeRightCtx.fill();
        }
    }, 5);  //TODO: play around with the performance of shortening this throttle
    this.drawCharts(this.bookingRequest.get());

    this.setSliderValuesThrottled = _.throttle(() => {
        let incomeSliderOutput = parseInt($('#incomeSliderOutput').val());
        let attendanceSliderOutput = parseInt($('#attendanceSliderOutput').val());
        let timeSliderOutput = parseInt($('#timeSliderOutput').val());

        let incomeSliderOutputComputed = COMPUTE_INCOME_DISPLAY(incomeSliderOutput);
        let attendanceSliderOutputComputed =  COMPUTE_ATTENDANCE_DISPLAY(attendanceSliderOutput);
        let timeSliderOutputComputed = COMPUTE_TIME_DISPLAY(timeSliderOutput);

        $('#incomeSlider-output-computed')[0].innerText = incomeSliderOutputComputed;
        $('#attendanceSlider-output-computed')[0].innerText = attendanceSliderOutputComputed;
        $('#timeSlider-output-computed')[0].innerText = timeSliderOutputComputed;

        let bookingRequestObj = this.bookingRequest.get();
        bookingRequestObj['incomeSlider'] = incomeSliderOutput;
        bookingRequestObj['attendanceSlider'] = attendanceSliderOutput;
        bookingRequestObj['timeSlider'] = timeSliderOutput;
        bookingRequestObj['incomeSliderComputed'] = incomeSliderOutputComputed;
        bookingRequestObj['attendanceSliderComputed'] = attendanceSliderOutputComputed;
        bookingRequestObj['timeSliderComputed'] = timeSliderOutputComputed;
        this.bookingRequest.set(bookingRequestObj);

        //console.log(bookingRequestObj);

        this.drawCharts(bookingRequestObj);
    }, 20);

    $(window).resize(() => {
        this.drawCharts(this.bookingRequest.get());
    });

    this.accordion = new Foundation.Accordion($('.accordion'));
    this.accordion2 = new Foundation.Accordion($('.accordion-2'));

    var Pikaday = require('pikaday');
    var picker = new Pikaday({ field: document.getElementById('datepicker') });

    autosize($('textarea'));
});


Template.booking_page.helpers({
    bookingRequest: () => {
        return this.bookingRequest.get();
    },
    eventTypes: () => {
        return EVENT_TYPES;
    },
    hasBeenToStep2: () => {
        // this is inconsequential, here to account for a small display bug
        return Session.get('hasBeenToStep2');
    },
    currentEventType: () => {
        return this.bookingRequest.get()['eventType'];
    },
});


Template.booking_page.events({
    //TODO: alter browser history for each step (so clicking the browser's back-button takes you to the previous step instead of all the way out)
    'click #booking-form .next-to-step-2:not(.disabled)': (e) => {
        e.preventDefault();

        $('#booking-form .step-1').fadeOut(() => {
            $('#booking-form .step-2').fadeIn(() => {
                this.drawCharts(this.bookingRequest.get());  //NOTE: this is needed here since the DOM of step 2 isn't rendered when the template is rendered

                if (!Session.get('hasBeenToStep2')) {
                    Session.set('hasBeenToStep2', true);

                    //Move the sliders to their correct "data-initial-start" locations
                    new Foundation.Slider($('#income-slider'));
                    new Foundation.Slider($('#attendance-slider'));
                    new Foundation.Slider($('#time-slider'));
                }
            });
        });
    },
    'click #booking-form .next-to-step-3:not(.disabled)': (e) => {
        e.preventDefault();

        $('#booking-form .step-2').fadeOut(() => {
            //TODO: more elegant scrolling
            //window.scrollTo(0, 0);  //TODO: keep a progress bar outside of the ".step-" elements so this jump doesn't look as jarring.
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
            $('#booking-form .step-2').fadeIn(() => {
                this.drawCharts(this.bookingRequest.get());  //NOTE: this is needed here since the DOM of step 2 isn't rendered when the template is rendered
            });
        });
    },

    'click ul.select-box li a': (e, target) => {
        e.preventDefault();

        //TODO: refactor this code to be used elsewhere (i.e. "are you an individual or organization?" on signup)

        let parent = $(e.target).parent(); //li
        let grandparent = parent.parent(); //ul

        // first, clear selection
        grandparent.find('li').removeClass('selected');

        // then, add the 'selected' class to the correct element
        parent.addClass('selected');

        let eventType = parent[0].dataset['name'];
        let bookingRequestObj = this.bookingRequest.get();
        bookingRequestObj['eventType'] = eventType;
        this.bookingRequest.set(bookingRequestObj);

        // NOTE: this could be bad if multiple steps/next-buttons were in the DOM at the same time.
        grandparent.parent().find('.next-button').removeClass('disabled');
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
        if (contactEmail.length < 40 && EMAIL_REGEX.test(contactEmail)) {
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

    'moved.zf.slider .slider': (e) => {  //FIXME: 'changed.zf.slider' stopped firing after updating to Meteor 1.4.1 and downgrading to v6.2.0 of the foundation-sites package.  Quick fix is to debounce/throttle everything inside this event.
        e.preventDefault();

        this.setSliderValuesThrottled();
    },
    'blur #datepicker': (e, target) => {
        let bookingRequestObj = this.bookingRequest.get();
        bookingRequestObj['eventDate'] = $('#datepicker').val();
        this.bookingRequest.set(bookingRequestObj);
    },
});

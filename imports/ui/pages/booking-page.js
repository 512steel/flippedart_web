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

    let linePad = 2;  // NOTE: this is the padding in pixels between the slider line and the left/right sides of the chart.
    let lineWidth = 4;
    let chartCanvasHeight = 120;

    let chartLeftFillStyle = "rgba(90,151,156,0.85)";
    let chartLineStrokeStyle = "#aaaaaa";
    let chartRightFillStyle = "rgba(90,151,156,0.3)";

    this.drawSingleChart = (leftCanvas, lineCanvas, rightCanvas, bookingRequestObj, requestObjName) => {
        if (leftCanvas.getContext){
            var leftCtx = leftCanvas.getContext('2d');

            // Draw the chart counter-clockwise, beginning with the bottom-left corner.
            leftCtx.beginPath();
            leftCtx.moveTo(
                0,
                leftCanvas.height
            );  //bottom-left
            leftCtx.lineTo(
                leftCanvas.width,
                leftCanvas.height
            );  //bottom-right
            leftCtx.lineTo(
                leftCanvas.width,
                leftCanvas.height - (leftCanvas.height * (bookingRequestObj[requestObjName] / 100)) + lineWidth
            );  // upper-right corner

            leftCtx.closePath();
            leftCtx.stroke();

            leftCtx.fillStyle = chartLeftFillStyle;
            leftCtx.fill();
        }
        if (lineCanvas.getContext){
            var lineCtx = lineCanvas.getContext('2d');

            let lineXPos = lineWidth / 2;
            let dotRadius = lineWidth / 2;

            lineCtx.beginPath();
            lineCtx.moveTo(
                lineXPos,
                lineCanvas.height - dotRadius
            );  //bottom point of line
            lineCtx.arc(
                lineXPos,
                lineCanvas.height - dotRadius,
                dotRadius,
                1.5 * Math.PI,
                3.5 * Math.PI
            );  //bottom circle
            lineCtx.lineTo(
                lineXPos,
                lineCanvas.height - (lineCanvas.height * (bookingRequestObj[requestObjName] / 100))
            );  //upward line
            lineCtx.arc(
                lineXPos,
                lineCanvas.height - (lineCanvas.height * (bookingRequestObj[requestObjName] / 100)),
                dotRadius,
                1.5 * Math.PI,
                3.5 * Math.PI
            );  //top cirlce

            lineCtx.closePath();

            lineCtx.strokeStyle = chartLineStrokeStyle;
            lineCtx.stroke();
        }
        if (rightCanvas.getContext){
            var rightCtx = rightCanvas.getContext('2d');

            // Draw the chart counter-clockwise, beginning with the bottom-left corner.
            rightCtx.beginPath();
            rightCtx.moveTo(
                0,
                rightCanvas.height
            );  //bottom-left
            rightCtx.lineTo(
                rightCanvas.width,
                rightCanvas.height
            );  //bottom-right
            rightCtx.lineTo(
                rightCanvas.width,
                0 + lineWidth
            );  //upper-right corner
            rightCtx.lineTo(
                0,
                rightCanvas.height - (rightCanvas.height * (bookingRequestObj[requestObjName] / 100))
            );  //upper-left corner

            rightCtx.closePath();
            rightCtx.stroke();

            rightCtx.fillStyle = chartRightFillStyle;
            rightCtx.fill();
        }
    };

    this.drawCharts = _.throttle((bookingRequestObj) => {
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

        //NOTE: should be " - lineWidth/2" below, but integer division might get wonky + shaving off the extra takes care of rounding errors that occasionally would push one of the charts to a new line.
        //NOTE: we use Math.max() because setting the canvas width to a negative number makes it angry.
        //NOTE: this is still buggy, as a 0-width side (on either extreme of the slider) pulls it out entirely, along with its padding, so the whole chart appears to squeeze inward on any other slider value.  The quick fix is restricting the data-slider attributes to 5-95, rather than 0-100.
        incomeLeftCanvas.width = Math.max(0, incomeContainerWidth * ((bookingRequestObj['incomeSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        incomeLineCanvas.width = lineWidth;
        incomeRightCanvas.width = Math.max(0, incomeContainerWidth * (1 - (bookingRequestObj['incomeSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        incomeLeftCanvas.height = chartCanvasHeight;
        incomeLineCanvas.height = chartCanvasHeight;
        incomeRightCanvas.height = chartCanvasHeight;

        attendanceLeftCanvas.width = Math.max(0, attendanceContainerWidth * ((bookingRequestObj['attendanceSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        attendanceLineCanvas.width = lineWidth;
        attendanceRightCanvas.width = Math.max(0, attendanceContainerWidth * (1 - (bookingRequestObj['attendanceSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        attendanceLeftCanvas.height = chartCanvasHeight;
        attendanceLineCanvas.height = chartCanvasHeight;
        attendanceRightCanvas.height = chartCanvasHeight;

        timeLeftCanvas.width = Math.max(0, timeContainerWidth * ((bookingRequestObj['timeSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        timeLineCanvas.width = lineWidth;
        timeRightCanvas.width = Math.max(0, timeContainerWidth * (1 - (bookingRequestObj['timeSlider'] / 100)) - linePad - lineWidth - lineWidth - lineWidth);
        timeLeftCanvas.height = chartCanvasHeight;
        timeLineCanvas.height = chartCanvasHeight;
        timeRightCanvas.height = chartCanvasHeight;

        this.drawSingleChart(incomeLeftCanvas, incomeLineCanvas, incomeRightCanvas, bookingRequestObj, 'incomeSlider');
        this.drawSingleChart(attendanceLeftCanvas, attendanceLineCanvas, attendanceRightCanvas, bookingRequestObj, 'attendanceSlider');
        this.drawSingleChart(timeLeftCanvas, timeLineCanvas, timeRightCanvas, bookingRequestObj, 'timeSlider');

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

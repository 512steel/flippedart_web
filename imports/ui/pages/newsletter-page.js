import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { DocHead } from 'meteor/kadira:dochead';

import {
    HEAD_DEFAULTS,
    EMAIL_REGEX,
    EMAIL_WORD_BANK,
    TLD_WORD_BANK } from '../lib/globals.js';

const speller = require('special-speller').specialSpeller;

import './newsletter-page.html';


Template.newsletter_page.onCreated(function() {
    DocHead.setTitle(HEAD_DEFAULTS.title + " | Newsletter");
    DocHead.addMeta({name: "og:title", content: HEAD_DEFAULTS.title + " | Newsletter"});
    DocHead.addMeta({name: "og:description", content: HEAD_DEFAULTS.description});
    DocHead.addMeta({name: "og:type", content: "article"});
    DocHead.addMeta({name: "og:url", content: "https://www.flippedart.org/newsletter"});
    DocHead.addMeta({name: "og:image", content: "http://res.cloudinary.com/dwgim6or9/image/upload/v1467765602/flippedart_og_image_3_qtkwew.png"});
    DocHead.addMeta({name: "og:image:width", content: "1200"});
    DocHead.addMeta({name: "og:image:height", content: "630"});
});

//TODO: add email to SendGrid list

Template.newsletter_page.events({
    'keyup #newsletter-email-field': function (e) {
        let address = e.target.value;
        if (EMAIL_REGEX.test(address)) {
            let domain = address.match(/@((.+){2,})\./)[1];
            let tld = address.match(/\.((.+){2,})/)[1];

            let newDomain = speller(domain, EMAIL_WORD_BANK);
            let newTld = speller(tld, TLD_WORD_BANK);

            if (domain != newDomain || tld != newTld) {
                $('.email-suggestion').remove();  //helps avoid flicker and duplicate suggestions
                let helpStr = 'Did you mean <em><span class="suggestion">' + address.match(/(.+@)/)[1] + newDomain + '.' + newTld + '</span></em>?';
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
    'click .email-suggestion': function(e) {
        $('#newsletter-email-field').val($(e.target).parent().find('.suggestion')[0].innerHTML);
        $('.email-suggestion').remove();
    }
});
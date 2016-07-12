import { Template } from 'meteor/templating';

import './accounts-templates.html';

import {
    EMAIL_REGEX,
    EMAIL_WORD_BANK,
    TLD_WORD_BANK } from './../lib/globals.js';

const speller = require('special-speller').specialSpeller;

// We identified the templates that need to be overridden by looking at the available templates
// here: https://github.com/meteor-useraccounts/unstyled/tree/master/lib
Template['override-atPwdFormBtn'].replaces('atPwdFormBtn');
Template['override-atPwdForm'].replaces('atPwdForm');
Template['override-atTextInput'].replaces('atTextInput');
Template['override-atTitle'].replaces('atTitle');
Template['override-atError'].replaces('atError');


Template.atPwdForm.events({
    'keyup #at-field-email': function (e) {
        let address = e.target.value;
        if (EMAIL_REGEX.test(address)) {
            let domain = address.match(/@((.+){2,})\./)[1];
            let tld = address.match(/\.((.+){2,})/)[1];

            let newDomain = speller(domain, EMAIL_WORD_BANK);
            let newTld = speller(tld, TLD_WORD_BANK);

            if (domain != newDomain || tld != newTld) {
                $('.email-suggestion').remove();  //helps avoid flicker and duplicate suggestions
                let helpStr = 'Did you mean <span class="suggestion">' + address.match(/(.+@)/)[1] + newDomain + '.' + newTld + '</span>?';
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
        $('#at-field-email').val($(e.target).parent().find('.suggestion')[0].innerHTML);
        $('.email-suggestion').remove();
    }
});

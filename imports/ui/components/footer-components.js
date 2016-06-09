import { Template } from 'meteor/templating';

import './footer-card.html';

Template.footer_card.helpers({
    currentYear: function() {
        return moment().format("YYYY");
    }
});
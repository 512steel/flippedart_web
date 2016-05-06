//TODO: refactor these into separate js files

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { ExchangeItems } from '../../../api/exchange-items/exchange-items.js';
import {
    insert as exchangeItemInsert,
    edit as exchangeItemEdit,
    deleteItem as exchangeItemDeleteItem } from '../../../api/exchange-items/methods.js';

import { requestTransaction } from '../../../api/transactions/methods.js';


import './item-single-page.html';
import './item-single-card.html';
import './item_edit.html';
import './item_submit.html';
import './items-inventory-page.html';

Template.item_single_page.onCreated(function itemSinglePageOnCreated() {
    this.getExchangeItemId = () => FlowRouter.getParam('exchangeItemId');
    this.getExchangeItem = () => ExchangeItems.findOne({});
    this.getPageUsername = () => FlowRouter.getParam('username');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('exchangeItems.single', this.getExchangeItemId());
    });
});

Template.items_user_all.onCreated(function() {
    this.requestedItems = new ReactiveVar([]);

    this.getPageUsername = () => FlowRouter.getParam('username');
    this.getExchangeItems = () => ExchangeItems.find({});

    const transactionsSortOptions = {sort: {createdAt: -1}};

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('exchangeItems.user', this.getPageUsername(), transactionsSortOptions);
    });
});

Template.item_single_card.onCreated(function() {
    this.showItemEdit = new ReactiveVar(false);

    this.getExchangeItem = () => ExchangeItems.findOne({});

    // Subscriptions go in here
    this.autorun(() => {

    });
});

Template.item_edit.onCreated(function itemEditOnCreated() {
    // Subscriptions go in here
    this.autorun(() => {

    });
});

Template.item_submit.onCreated(function itemSubmitOnCreated() {
    // Subscriptions go in here
    this.autorun(() => {

    });
});


Template.item_single_page.onRendered(function itemSinglePageOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.item_edit.onRendered(function itemEditOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.item_submit.onRendered(function itemSubmitOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});


Template.item_single_page.helpers({
    exchangeItem: function() {
        return Template.instance().getExchangeItem();
    },
    isItemOwner: function() {
        const exchangeItem = Template.instance().getExchangeItem();
        const currentUser = Meteor.user();

        if (exchangeItem && currentUser) {
            return exchangeItem.ownerName == currentUser.username;
        }
    },
    isExchangeItemAvailable: function () {
        const exchangeItem = Template.instance().getExchangeItem();

        if (exchangeItem) {
            return (exchangeItem.available && !exchangeItem.locked);
        }
    },
});

Template.items_user_all.helpers({
    isProfileOwner: function() {
        return Meteor.user().username === FlowRouter.getParam('username');
    },
    exchangeItems: function() {
        return Template.instance().getExchangeItems();
    },
    currentPageUsername: function() {
        return Template.instance().getPageUsername();
    },
    requestedItems: function() {
        return Template.instance().requestedItems.get();
    },
    isExchangeItemAvailable: function (exchangeItem) {
        return (exchangeItem.available && !exchangeItem.locked);
    },
    hasExchangeItems: function() {
        return Template.instance().getExchangeItems().count() > 0;
    },
});

Template.item_single_card.helpers({
    isItemOwner: function() {
        const exchangeItem = Template.instance().getExchangeItem();
        const currentUser = Meteor.user();

        if (exchangeItem && currentUser) {
            return exchangeItem.ownerName == currentUser.username;
        }
    },

    showItemEdit: function() {
        if (this && !this.locked) {
            return Template.instance().showItemEdit.get();
        }
    },
    editClass: function() {
        //UI-hacky way of getting around handlebars' nested ifs

        if (this && !this.locked) {
            return "item-edit";
        }
        else return "hidden";
    },
});

Template.item_edit.helpers({

});

Template.item_submit.helpers({

});


Template.item_single_page.events({
    /*'change .request-checkout-checkbox': function (e, template) {
        /!* TODO: look at this & put in the inventory page *!/
        var isOneChecked = $(".item-request-form input[type='checkbox']:checked").length > 0;

        $('.item-request-form-button').prop('disabled', !isOneChecked);
    },*/
    'click form .single-item-request-form-button': function(e) {
        e.preventDefault();

        const exchangeItem = Template.instance().getExchangeItem();

        if (exchangeItem && Meteor.user()) {
            var itemIds = [];

            itemIds.push($(e.target).parent().find('.inventory-single-item-id').text());

            console.log('about to requestTransaction()');
            console.log(Template.instance().getPageUsername());

            requestTransaction.call({
                requesteeName: Template.instance().getPageUsername(),
                itemIds: itemIds,
            }/*, throwError */);
        }
    }
});

Template.items_user_all.events({
    'change .request-checkout-checkbox': function (e, template) {
        console.log('in change .request-checkout-checkbox event');

        var isOneChecked = $(".item-request-form input[type='checkbox']:checked").length > 0;

        console.log(isOneChecked);
        console.log(e.target);
        console.log($(e.target));
        console.log($(e.target).parent());

        var arr = Template.instance().requestedItems.get();
        if (e.target.checked) {
            arr.push(this.title);
        }
        else {
            var index = arr.indexOf(this.title);
            if (index > -1) {
                arr.splice(index, 1);
            }
        }
        Template.instance().requestedItems.set(arr);

        $('.item-request-form-button').prop('disabled', !isOneChecked);
    },
    'click .multiple-item-request-form-button': function(e) {
        e.preventDefault();

        /*
         FIXME: this is similar to the "request" event above - make naming conventions etc. consistent.
        */

        if (this.user && Meteor.user()) {
            if (this.user._id != Meteor.userId()) {
                var itemIds = [];
                var requesteeUsername = this.user.username;

                $(".item-request-form input[type='checkbox']:checked").each(function() {
                    itemIds.push($(this).closest('.inventory-single-item').find('.inventory-single-item-id').text());
                });

                var transaction = {
                    requesteeId: this.user._id,
                    itemIds: itemIds
                };

                Meteor.call('transactionInsert', transaction, function(error, result) {
                    if (error) {
                        throwError(error.reason);
                    }
                    else {
                        //a chatSession is created inside of transactionInsert(), to route to it here
                        Router.go('chatWindow', {
                            username: requesteeUsername
                        });

                    }
                });
            }
        }

        /*This does the following:
         -start a transaction and put it in the "requested" state,
         -start a chatSession between the currentUser and this user's page (assuming they're different),
         -send a notification to the requestee
         -redirect this user to the newly-created chatSession ('/messages/:otherUsername')
         -if no messages have been sent it'll display a call-to-send-first-message-action
         -disallow the items to be "re-requested" while the transaction is in-progress (any state other than "denied")
         */
    }
});

Template.item_single_card.events({
    'click .item-edit': function (e, template) {
        e.preventDefault();

        console.log('clicked .item-edit event');

        //toggle the "item edit" template
        template.showItemEdit.set(!template.showItemEdit.get());


    }
});

Template.item_edit.events({

});

Template.item_submit.events({

});

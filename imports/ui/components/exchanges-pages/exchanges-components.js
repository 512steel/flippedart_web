//TODO: refactor this js into separate component files

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { ExchangeItems } from '../../../api/exchange-items/exchange-items.js';
import {
    insert as exchangeItemInsert,
    edit as exchangeItemEdit,
    deleteItem as exchangeItemDeleteItem } from '../../../api/exchange-items/methods.js';

import { Transactions } from '../../../api/transactions/transactions.js';
import {
    requestTransaction,
    approveTransaction,
    completeTransaction,
    declineTransaction,
    cancelTransaction } from '../../../api/transactions/methods.js';

import './exchange-listing.html';
import './user-exchanges.html';
import './single-exchange.html';

Template.exchange_listing.onCreated(function exchangeListingOnCreated() {

    //TODO: keep an eye on this in case more data is passed into the template.
    this.transaction = () => this.data;

    this.isCurrentUserRequestee = () => {
        const currentUser = Meteor.user();
        if (currentUser && currentUser.username == this.transaction().requesteeName)
            return true;
    };

    // Subscriptions go in here
    this.autorun(() => {

    });

});

Template.user_exchanges.onCreated(function userExchangesOnCreated() {
    console.log('in user_exchanges onCreated');

    const transactionsSortOptions = {sort: {state: 1, createdAt: -1}};

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('transactions.user', transactionsSortOptions);
    });

});

Template.user_single_exchange.onCreated(function userSingleExchangeOnCreated() {
    this.getExchangeId = () => FlowRouter.getParam('exchangeId');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('transactions.single', this.getExchangeId());
        this.subscribe('transactions.single.exchangeItems', this.getExchangeId())
    });

    this.transaction = () => Transactions.findOne({});
});


Template.user_exchanges.onRendered(function userExchangesOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.user_single_exchange.onRendered(function userSingleExchangeOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});


//Note: the lack of control-flow in spacebars makes this pretty janky.

Template.exchange_listing.helpers({
    isCurrentUserRequestee: function() {
        const currentUser = Meteor.user();
        const transaction = Template.instance().transaction();
        if (currentUser && transaction &&
            (currentUser.username == transaction.requesteeName))
            return true;
    },

    isTransactionRequested: function() {
        const transaction = Template.instance().transaction();
        if (transaction && transaction.state == 'requested')
            return true;
    },
    isTransactionApproved: function() {
        const transaction = Template.instance().transaction();
        if (transaction && transaction.state == 'pending')
            return true;
    },
    isTransactionCompleted: function() {
        const transaction = Template.instance().transaction();
        if (transaction && transaction.state == 'completed')
            return true;
    },
    isTransactionDeclined: function() {
        const transaction = Template.instance().transaction();
        if (transaction && transaction.state == 'declined')
            return true;
    },
    isTransactionCancelled: function() {
        const transaction = Template.instance().transaction();
        if (transaction && transaction.state == 'cancelled')
            return true;
    },

    advanceButtonCopy: function() {
        if (this && this.state) {
            switch (this.state) {
                case 'requested':
                    return 'Approve this request';
                case 'pending':
                    return 'Complete this request';
                default:
                    return 'Completed';
            }
        }
    },

    isMultipleItems: function() {
        if (this.itemIds.length > 1) {
            return true;
        }
    },
    numberOfItems: function() {
        return this.itemIds.length;
    },

    transactionId: function() {
        return this._id;
    },

});


Template.user_exchanges.helpers({
    requestedExchanges: function() {
        return Transactions.find({
            state: 'requested',
        });
    },
    pendingExchanges: function() {
        return Transactions.find({
            state: 'pending',
        });
    },
    completedExchanges: function() {
        return Transactions.find({
            state: 'completed',
        });
    },
    terminatedExchanges: function() {
        return Transactions.find({
            $or: [
                {state: 'declined'},
                {state: 'cancelled'}
            ]
        });
    },

});

Template.user_single_exchange.helpers({
    exchangeItems: function() {
        return ExchangeItems.find({});
    },
    transaction: function() {
        return Template.instance().transaction();
    },

    isRequestee: function() {
        //TOOD: refactor ifs and this.requ...
        if (Meteor.user()) {
            if (Meteor.user().username == this.requesteeName) {
                return true;
            }
        }
        return false;
    },

    //TODO: why not ternaries instead of all these "has___()" methods?
    itemHasTitle: function() {
        if (this.title) {
            return true;
        }
    },
    itemHasDescription: function() {
        if (this.description) {
            return true;
        }
    },
    itemHasMainImageLink: function() {
        if (this.mainImageLink) {
            return true;
        }
    },
    itemHasLocation: function() {
        if (this.location) {
            return true;
        }
    },
    itemHasTag: function() {
        if (this.tag) {
            return true;
        }
    },
    isExchangeMember: function() {
        const transaction = Template.instance().transaction();
        const currentUser = Meteor.user();

        if (currentUser && transaction &&
            (currentUser._id == transaction.requesteeId || currentUser._id == transaction.requesterId))
        {
                return true;
        }
    }
});


Template.exchange_listing.events({

    //FIXME: call the actual methods explicitly
    'submit form.exchange-advance': function(e) {
        e.preventDefault();

        Meteor.call('transactionIncrementState', this._id, function (error, result) {
            if (error) {
                throwError(error.reason);
            }
        });
    },
    'submit form.exchange-decline': function(e) {
        e.preventDefault();

        Meteor.call('transactionDecline', this._id, function (error, result) {
            if (error) {
                throwError(error.reason);
            }
        });
    },
    'submit form.exchange-cancel': function(e) {
        e.preventDefault();

        cancelTransaction.call({
            transactionId: this._id
        }/*, throwError */);
    },
});

//TODO: refactor this js into separate component files

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { ExchangeItems } from '../../../api/exchange-items/exchange-items.js';

import { Transactions } from '../../../api/transactions/transactions.js';
import {
    //requestTransaction,  //this is done from the exchangeItems-components.js file.
    approveTransaction,
    completeTransaction,
    declineTransaction,
    cancelTransaction } from '../../../api/transactions/methods.js';

import {
    throwError,
    throwSuccess } from '../../lib/temporary-alerts.js';

import './transaction-card.html';
import './user-transactions.html';
import './single-transaction.html';
import './transactions-info-card.html';

Template.transaction_card.onCreated(function transactionCardOnCreated() {

    //TODO: keep an eye on this in case more data is passed into the template.
    this.transaction = () => this.data;

    /*this.isCurrentUserRequestee = () => {
        const currentUser = Meteor.user();
        if (currentUser && currentUser.username == this.transaction().requesteeName)
            return true;
    };*/

    // Subscriptions go in here
    this.autorun(() => {

    });

});

Template.user_transactions.onCreated(function userTransactionsOnCreated() {
    this.getUsername = () => FlowRouter.getParam('username');

    const transactionsSortOptions = {sort: {state: 1, createdAt: -1}};

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('transactions.user', transactionsSortOptions);
    });

});

Template.user_single_transaction.onCreated(function userSingleTransactionOnCreated() {
    this.getExchangeId = () => FlowRouter.getParam('exchangeId');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('transactions.single', this.getExchangeId());
        this.subscribe('transactions.single.exchangeItems', this.getExchangeId())
    });

    this.transaction = () => Transactions.findOne({});
});


Template.transactions_info_card.onRendered(function() {
    this.accordion = new Foundation.Accordion($('.accordion'));
});

Template.user_transactions.onRendered(function userTransactionsOnRendered() {

    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});

Template.user_single_transaction.onRendered(function userSingleTransactionOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            // release renderHolds here
        }
    });
});


//Note: the lack of control-flow in spacebars makes this pretty janky.

Template.transaction_card.helpers({
    isCurrentUserRequestee: function() {
        const currentUser = Meteor.user();
        const transaction = Template.instance().transaction();
        if (currentUser && transaction &&
            (currentUser.username == transaction.requesteeName))
            return true;
    },
    currentUsername: function() {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    },

    requesterName: function() {
        return Template.instance().transaction().requesterName;
    },
    requesteeName: function() {
        return Template.instance().transaction().requesteeName;
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


Template.user_transactions.helpers({
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

    pageUsername: function() {
        return Template.instance().getUsername();
    },
});

Template.user_single_transaction.helpers({
    exchangeItems: function() {
        return ExchangeItems.find({});
    },
    transaction: function() {
        return Template.instance().transaction();
    },

    isExchangeMember: function() {
        const transaction = Template.instance().transaction();
        const currentUser = Meteor.user();

        if (currentUser && transaction &&
            (currentUser._id == transaction.requesteeId || currentUser._id == transaction.requesterId))
        {
            return true;
        }
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

    //TODO: use these with discretion - they are essentially "previews" for when you click through into the single project page.
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

    pageUsername: function() {
        return FlowRouter.getParam('username');
    }
});


Template.transaction_card.events({

    'click button.btn-transaction-approve': function(e) {
        e.preventDefault();

        approveTransaction.call({
            transactionId: this._id
        }, (err, res) => {
            if (err) {
                throwError('Oops! Looks like there was a problem with approving this request');
            }
            else {
                throwSuccess('Yay! You\'ve successfully approved this request.  Be sure to send messages back and forth to work out the details.');
            }
        });
    },
    'click button.btn-transaction-complete': function(e) {
        e.preventDefault();

        completeTransaction.call({
            transactionId: this._id
        }, (err, res) => {
            if (err) {
                throwError('Oops! Looks like there was a problem with completing this exchange');
            }
            else {
                throwSuccess('Yay! The exchange has been completed.  Be sure to congratulate your project\'s proud new owner.');
            }
        });
    },
    'click button.btn-transaction-decline': function(e) {
        e.preventDefault();

        declineTransaction.call({
            transactionId: this._id
        }, (err, res) => {
            if (err) {
                throwError('Oops! Looks like there was a problem with declining this request');
            }
            else {
                throwSuccess('You have successfully declined this request.  Be sure to send a message to the requester letting them know the reason.');
            }
        });
    },
    'click button.btn-transaction-cancel': function(e) {
        e.preventDefault();

        cancelTransaction.call({
            transactionId: this._id
        }, (err, res) => {
            if (err) {
                throwError('Oops! Looks like there was a problem with canceling this request');
            }
            else {
                throwSuccess('You have successfully canceled this request.  Be sure to check out some of the other projects that community members are working on.');
            }
        });
    },
});

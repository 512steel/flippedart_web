//Note: the lack of control-flow in spacebars makes this pretty janky.

Template.exchangeListing.helpers({
    isRequestee: function() {
        if (Meteor.user()) {
            if (Meteor.user().username == this.requesteeUsername) {
                return true;
            }
        }
        return false;
    }
});
Template.userSingleExchange.helpers({
    isRequestee: function() {
        if (Meteor.user()) {
            if (Meteor.user().username == this.requesteeUsername) {
                return true;
            }
        }
        return false;
    },
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
        if (Meteor.user() && this.exchange) {
            if (Meteor.user()._id == this.exchange.requesteeId || Meteor.user()._id == this.exchange.requesterId) {
                return true;
            }
        }
    }
});

Template.requesteeExchangeListing.helpers({
    exchangeState: function() {
        switch(this.state) {
            case 0:
                return "requested";
            case 1:
                return "pending";
            case 2:
                return "completed";
            case 3:
                return "declined";
            case 4:
                return "retracted";
            default:
                return "unknown"
        }
    },
    advanceButtonCopy: function() {
        switch(this.state) {
            case 0:
                return "mark pending";
            case 1:
                return "mark completed";
            default:
                return "completed";
        }
    },
    isCancelled: function() {
        if (this.state != 0  && this.state != 1 && this.state != 2) {
            return true;
        }
    },
    isCompleted: function() {
        if (this.state == 2) {
            return true;
        }
    },
    isCancelledCopy: function() {
        switch (this.state) {
            case 3:
                return "declined";
            case 4:
                return "cancelled";
        }
    },
    isMultipleItems: function() {
        if (this.itemIds.length > 1) {
            return true;
        }
    }
});

Template.requesteeExchangeListing.events({
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
    }
});

Template.requesterExchangeListing.helpers({
    exchangeState: function() {
        switch(this.state) {
            case 0:
                return "requested";
            case 1:
                return "pending";
            case 2:
                return "completed";
            case 3:
                return "declined";
            case 4:
                return "retracted";
            default:
                return "unknown"
        }
    },
    advanceButtonCopy: function() {
        switch(this.state) {
            case 0:
                return "mark pending";
            case 1:
                return "mark completed";
            default:
                return "completed";
        }
    },
    isCancelled: function() {
        if (this.state != 0  && this.state != 1 && this.state != 2) {
            return true;
        }
    },
    isCompleted: function() {
        if (this.state == 2) {
            return true;
        }
    },
    isCancelledCopy: function() {
        switch (this.state) {
            case 3:
                return "declined";
            case 4:
                return "cancelled";
        }
    },
    isMultipleItems: function() {
        if (this.itemIds.length > 1) {
            return true;
        }
    }
});

Template.requesterExchangeListing.events({
    'submit form.exchange-cancel': function(e) {
        e.preventDefault();

        Meteor.call('transactionRetract', this._id, function (error, result) {
            if (error) {
                throwError(error.reason);
            }
        });
    }
});
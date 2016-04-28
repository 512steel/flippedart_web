Template.singleItemPage.helpers({
    available: function() {
        return (this.availableForCheckout && !this.locked) ? "yes" : "no";
    },
    isProfileOwner: function () {
        //signed-in user and the owner of this inventory
        if (Meteor.user() && this.item) {
            return this.item.ownerId == Meteor.userId()
        }
        return false;
    },
    isNotProfileOwner: function() {
        //signed-in user, but *not* the owner of this inventory
        if (Meteor.user() && this.item) {
            return this.item.ownerId != Meteor.userId()
        }
        return false;
    }
});

Template.singleItemPage.events({
    'change .request-checkout-checkbox': function (e, template) {
        var isOneChecked = $(".item-request-form input[type='checkbox']:checked").length > 0;

        $('.item-request-form-button').prop('disabled', !isOneChecked);
    },
    'submit form.item-request-form': function(e) {
        e.preventDefault();

        console.log(this);
        console.log(this.owner);

        if (this.owner && Meteor.user()) {
            if (this.owner._id != Meteor.userId()) {
                var itemIds = [];
                var requesteeUsername = this.owner.username;

                itemIds.push($(e.target).find('.inventory-single-item-id').text());

                var transaction = {
                    requesteeId: this.owner._id,
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
         -disallow the item to be "re-requested" while the transaction is in-progress (any state other than "denied")
         */
    }
});
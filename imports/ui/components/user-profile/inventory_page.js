Template.userSingleItemListing.onCreated(function() {
    this.showItemEdit = new ReactiveVar(false);
});

Template.userSingleItemListing.helpers({
    isItemOwner: function () {
        //signed-in user and the owner of this inventory
        if (Meteor.user() && this && this.ownerId) {
            return this.ownerId == Meteor.userId()
        }
        return false;
    },
    showItemEdit: function() {
        if (this && !this.locked) {
            return Template.instance().showItemEdit.get();
        }
        else return false;
    },
    editClass: function() {
        //UI-hacky way of getting around handlebars' nested ifs
        if (this && !this.locked) {
            return "item-edit";
        }
        else return "hidden";
    },
    hasImageLinks: function() {
        if (this.imageLinks) {
            //this check isn't perfect, but it just fixes a display bug so not a big deal
            if (this.imageLinks.length > 0 && this.imageLinks.indexOf("") != 0) {
                return true;
            }
        }
    }
});

Template.userSingleItemListing.events({
    'click .item-edit': function (e, template) {
        e.preventDefault();

        //toggle the "item edit" template
        template.showItemEdit.set(!template.showItemEdit.get());
    }
});


Template.userInventoryPage.onCreated(function () {
    this.requestedItems = new ReactiveVar([]);
});

Template.userInventoryPage.helpers({
    available: function() {
        return (this.availableForCheckout && !this.locked) ? "yes" : "no";
    },
    isProfileOwner: function () {
        //signed-in user and the owner of this inventory
        if (Meteor.user() && this.user) {
            return this.user._id == Meteor.userId()
        }
        return false;
    },
    isNotProfileOwner: function() {
        //signed-in user, but *not* the owner of this inventory
        if (Meteor.user() && this.user) {
            return this.user._id != Meteor.userId()
        }
        return false;
    },
    requestedItems: function() {
        return Template.instance().requestedItems.get();
    }
});

Template.userInventoryPage.events({
    'change .request-checkout-checkbox': function (e, template) {
        var isOneChecked = $(".item-request-form input[type='checkbox']:checked").length > 0;

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
    'click .item-request-form-button': function(e) {
        e.preventDefault();

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
Template.itemEdit.onCreated(function() {
    Session.set('itemEditErrors', {});
});

Template.itemEdit.helpers({
    errorMessage: function(field) {
        return Session.get('itemEditErrors')[field];
    },
    errorClass: function(field) {
        return !!Session.get('itemEditErrors')[field] ? 'has-error' : '';
    },
    addendumsCount: function() {
        return this.addendums.length;
    },
    pastOwnersCount: function() {
        return this.pastOwnerIds.length;
    },
    lastAddendum: function() {
        var pastOwnersCount = this.pastOwnerIds.length;
        var addendumsCount = this.addendums.length;

        if (addendumsCount > 0) {
            if (pastOwnersCount > 0 && this.pastOwnerIds[pastOwnersCount-1] != Meteor.userId()) {
                return this.addendums[addendumsCount-1]
            }
            else {
                return "";
            }
        }
        else {
            return this.description;
        }
    },
    isAvailable: function() {
        return this.availableForCheckout;
    }
});

Template.itemEdit.events({
    'submit form.item-edit-form': function(e, template) {
        e.preventDefault();

        var currentExchangeItemId = this._id;
        var exchangeItem = {
            description: $(e.target).find('[name=description]').val(),
            location: $(e.target).find('[name=location]').val(),
            availableForCheckout: $(e.target).find('[name=availableCheckbox]').is(':checked'),

            //TODO: allow user to upload/delete images (or add to the addendum)
            //imageLinks: [" "]
        };

        var errors = validateExchangeItem(exchangeItem);
        if (errors.description) {
            return Session.set('itemEditErrors', errors);
        }

        Meteor.call('exchangeItemEdit', exchangeItem, currentExchangeItemId, function(error, result) {
            if (error) {
                throwError(error.reason);
            }

            //hide the edit form after it's been submitted
            //fixme: this is apparently bad practice - https://forums.meteor.com/t/access-parent-template-reactivevar-from-child-template/973
            template.view.parentView.parentView.parentView._templateInstance.showItemEdit.set(false);
        });
    },
    'click .delete-item': function(e) {
        e.preventDefault();

        if (confirm("Are you sure you want to delete this item?  It won't be available for people to checkout any longer.")) {
            var currentExchangeItemId = this._id;
            ExchangeItems.remove(currentExchangeItemId);
        }
    }
});

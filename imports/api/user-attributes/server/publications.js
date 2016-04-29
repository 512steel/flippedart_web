import { Meteor } from 'meteor/meteor';
import { UserAttributes } from '../user-attributes.js';


//TODO: delete this publication after done testing with it
Meteor.publish('userAttributes.all', function() {
    return UserAttributes.find(
        {},
        {
            fields: UserAttributes.publicFields,
        }
    );
});

Meteor.publish('userAttributes.byId', function(userId) {
    if (userId) {
        check(userId, String);
    }
    else {
        check(userId, null);
    }
    return UserAttributes.find({userId: userId});
});

Meteor.publish('userAttributes.byUsername', function (username) {
    check(username, String);

    return UserAttributes.find({username : username});
});
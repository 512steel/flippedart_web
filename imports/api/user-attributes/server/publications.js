import { Meteor } from 'meteor/meteor';
import { UserAttributes } from '../user-attributes.js';


//NOTE: for testing purposes only, not for production
/*Meteor.publish('userAttributes.all', function() {
    return UserAttributes.find(
        {},
        {
            fields: UserAttributes.publicFields,
        }
    );
});*/

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

    return UserAttributes.find(
        {
            username : username
        },
        {
            fields: UserAttributes.publicFields
        }
    );
});
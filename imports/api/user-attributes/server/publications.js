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

    const user = Accounts.findUserByUsername(username);
    if (user) {
        username = user.username;
    }

    return UserAttributes.find(
        {
            username : username
        },
        {
            fields: UserAttributes.publicFields
        }
    );
});

Meteor.publish('userAttributes.popular', function(limit) {
    check(limit, Number);

    return UserAttributes.find(
        {
            rank: {$gt: 0}
        },
        {
            sort: {rank: -1},
            limit: limit,
            fields: UserAttributes.publicFields,
        }
    );
});

Meteor.publish('usernames.all', function(limit) {
    limit = limit ? limit : 500;  //TODO: is it better to not have a limit at all?

    check(limit, Number);

    return Meteor.users.find(
        {},
        {
            sort : {rank: -1},
            limit: limit,
            fields: {username: 1},
        }
    )
});

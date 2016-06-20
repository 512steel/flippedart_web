/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Comments } from '../comments.js';

/*Meteor.publish('comments.all', function () {  //TODO: pass in "options" object for sorting/limit, and query these
    /!*check(options, {
     sort: Object,
     limit: Number
     });*!/

    return Comments.find(
        {},
        {
            fields: Comments.publicFields,
        }
    );
});*/

Meteor.publish('comments.userPost', function(userPostId, options, limit) {
    check(userPostId, String);
    check(options, {
        sort: Object,
    });
    check(limit, Number);

    Counts.publish(this, 'comments.userPost.count', Comments.find({userPostId: userPostId}), { noReady: true });

    return Comments.find(
        {
            userPostId: userPostId
        },
        {
            sort: options.sort,
            limit: limit,
            fields: Comments.publicFields,
        }
    );
});

Meteor.publish('comments.user', function(username, options) {
    check(username, String);
    check(options, {
        sort: Object,
        limit: Number
    });

    const user = Accounts.findUserByUsername(username);
    if (user) {
        username = user.username;
    }

    return Comments.find(
        {
            author : username
        },
        {
            sort: options.sort,
            limit: options.limit,
            fields: Comments.publicFields,
        })
});

Meteor.publish('comments.single', function(commentId) {
    check(commentId, String);
    return Comments.find(
        {
            _id: commentId
        },
        {
            fields: Comments.publicFields,
        }
    );
});
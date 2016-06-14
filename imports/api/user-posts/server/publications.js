/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { UserPosts } from '../user-posts.js';

Meteor.publish('userPosts.all', function () {  //TODO: pass in "options" object for sorting/limit, and query these
    /*check(options, {
        sort: Object,
        limit: Number
    });*/

    return UserPosts.find(
        {},
        {
            fields: UserPosts.publicFields,
        }
    );
});

Meteor.publish('userPosts.user', function(username, options, limit) {
    check(username, String);
    check(options, {
        sort: Object,
    });
    check(limit, Number);

    Counts.publish(this, 'userPosts.user.count', UserPosts.find({author: username}), { noReady: true });

    return UserPosts.find(
        {
            author : username
        },
        {
            sort: options.sort,
            limit: limit,
            fields: UserPosts.publicFields,
        }
    );
});

Meteor.publish('userPosts.single', function(userPostId) {
    check(userPostId, String);
    return UserPosts.find(
        {_id: userPostId},
        {
            fields: UserPosts.publicFields,
        }
    );
});

Meteor.publish('userPosts.popular', function(limit) {
    check(limit, Number);

    return UserPosts.find(
        {},
        {
            sort: {rank: -1},
            limit: limit,
            fields: UserPosts.publicFields,
        }
    );
});
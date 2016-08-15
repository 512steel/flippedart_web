/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { UserPosts } from '../user-posts.js';
import { _ } from 'meteor/underscore';

//NOTE: testing purposes only, not for production
Meteor.publish('userPosts.all', function () {  //TODO: pass in "options" object for sorting/limit, and query these

    if (!this.userId) {
        return;
    }

    const adminUser = Meteor.users.findOne(this.userId);
    if (!_.contains(adminUser.roles, 'admin')) {
        return;
    }

    return UserPosts.find();
});

Meteor.publish('userPosts.user', function(username, options, limit) {
    check(username, String);
    check(options, {
        sort: Object,
    });
    check(limit, Number);

    const user = Accounts.findUserByUsername(username);
    if (user) {
        username = user.username;
    }

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
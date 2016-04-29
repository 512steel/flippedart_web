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

Meteor.publish('userPosts.user', function(username, options) {
    check(username, String);
    check(options, {
        sort: Object,
        limit: Number
    });
    return UserPosts.find({author : username}, options)
});

Meteor.publish('userPosts.single', function(userPostId) {
    check(userPostId, String);
    return UserPosts.find({_id: userPostId});
});
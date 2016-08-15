/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Comments } from '../comments.js';


Meteor.publish('comments.all', function () {

    if (!this.userId) {
        return;
    }

    const adminUser = Meteor.users.findOne(this.userId);
    if (!_.contains(adminUser.roles, 'admin')) {
        return;
    }

    return Comments.find();
});

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

//TODO: test this out
Meteor.publish('comments.project', function(projectId, options, limit) {
    check(projectId, String);
    check(options, {
        sort: Object,
    });
    check(limit, Number);

    Counts.publish(this, 'comments.project.count', Comments.find({projectId: projectId}), { noReady: true });

    return Comments.find(
        {
            projectId: projectId
        },
        {
            sort: options.sort,
            limit: limit,
            fields: Comments.publicFields,
        }
    );
});

Meteor.publish('comments.commentablePage', function(pageName, options, limit) {
    check(pageName, String);
    check(options, {
        sort: Object,
    });
    check(limit, Number);

    Counts.publish(this, 'comments.commentablePage.count', Comments.find({pageName: pageName}), { noReady: true });

    return Comments.find(
        {
            pageName: pageName
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
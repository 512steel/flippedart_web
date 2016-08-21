/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { RecentActivity } from './../recent-activity';


Meteor.publish('recentActivity.feed', function () {

    return RecentActivity.find(
        { },
        {
            sort: {createdAt: -1},
            fields: RecentActivity.publicFields,
            limit: 6,
        });
});

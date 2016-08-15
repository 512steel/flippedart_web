import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';

import { UserPosts } from '../../../api/user-posts/user-posts.js';

import './admin-page.html'


Template.admin_page.onCreated(function adminPageOnCreated() {
    console.log(Meteor.user());
    if (!Meteor.user() || !_.contains(Meteor.user().roles, 'admin')) {
        FlowRouter.go('static.home');
    }

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('userPosts.all');
    });
});


Template.admin_page.helpers({
    'userPosts': () => {
        return UserPosts.find();
    }
});


Template.adminDoc.events({
    'click .delete': (e, target) => {
        console.log(target);
        if (confirm("Are you sure about deleting the document with ID: " + target.data._id + "?")){
            //FIXME: currently, there is no power of the admin to edit/delete documents that aren't theirs.  Not sure whether to change it at a collection-level, in editableBy()), or by adding new admin-only methods
        }
    }
});
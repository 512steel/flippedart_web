import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Lists } from '../../api/lists/lists.js';



/* *** New ValidatedMethod() tests *** */
import { UserPosts } from '../../api/user-posts/user-posts.js';
import { insert as userPostInsert,
         edit as userPostEdit,
         upvote as userPostUpvote,
         flag as userPostFlag,
         unflag as userPostUnflag,
         decrementComment as userPostDecrementComment }
        from '../../api/user-posts/methods.js'

import { UserAttributes } from '../../api/user-attributes/user-attributes.js';
import { insert as userAttributesInsert,
         edit as userAttributesEdit,
         updateRank as userAttributesUpdateRank,
         updateRankServer as userAttributesUpdateRankServer }
        from '../../api/user-attributes/methods.js';



import { listRenderHold } from '../launch-screen.js';
import './lists-show-page.html';

// Components used inside the template
import './app-not-found.js';
import '../components/lists-show.js';

Template.Lists_show_page.onCreated(function listsShowPageOnCreated() {
    this.getListId = () => FlowRouter.getParam('_id');

    this.autorun(() => {
        this.subscribe('todos.inList', this.getListId());

        /* *** test subscriptions *** */
        this.subscribe('userPosts.all');
        this.subscribe('userAttributes.all');
    });
});

Template.Lists_show_page.onRendered(function listsShowPageOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            //listRenderHold.release();
        }
    });
});

Template.Lists_show_page.helpers({
    // We use #each on an array of one item so that the "list" template is
    // removed and a new copy is added when changing lists, which is
    // important for animation purposes.
    listIdArray() {
        const instance = Template.instance();
        const listId = instance.getListId();
        return Lists.findOne(listId) ? [listId] : [];
    },
    listArgs(listId) {
        const instance = Template.instance();
        // By finding the list with only the `_id` field set, we don't create a dependency on the
        // `list.incompleteCount`, and avoid re-rendering the todos when it changes
        const list = Lists.findOne(listId, {fields: {_id: true}});
        const todos = list && list.todos();
        return {
            todosReady: instance.subscriptionsReady(),
            // We pass `list` (which contains the full list, with all fields, as a function
            // because we want to control reactivity. When you check a todo item, the
            // `list.incompleteCount` changes. If we didn't do this the entire list would
            // re-render whenever you checked an item. By isolating the reactiviy on the list
            // to the area that cares about it, we stop it from happening.
            list() {
                return Lists.findOne(listId);
            },
            todos,
        };
    },

    /* *** helpers for testing new ValidatedMethod()s *** */
    allUserPosts() {
        console.log('in allUserPosts helper');
        const posts = UserPosts.find({});
        posts.forEach( function(post) {
            console.log(post);
        });
    },
    allUserAttributes() {
        console.log('in allUserAttributes helper');
        const attrs = UserAttributes.find({});
        attrs.forEach( function(attr) {
            console.log(attr);
        });
    },
    thisUserAttributes() {
        console.log('in thisUserAttributes helper');
        if (Meteor.user()) {
            //TODO: make "userId" not a publicField, and find by "username" instead.
            const userAttrs = UserAttributes.find({userId: Meteor.user().userId()});
            attrs.forEach( function(attr) {
                console.log(attr);
            });
        }
        else {
            console.log('user not signed in');
        }
    }
});

Template.Lists_show_page.events({

    /* *** Test events for calling new ValidatedMethod()s here *** */
    'click .userPost-insert' : function() {
        console.log('in userPost-insert test');
        userPostInsert.call({
            text: 'test text',
            tag: ' ',
            imageLinks: [],
        });
    },
    'click .userPost-edit' : function() {
        console.log('in userPost-edit test');
        userPostEdit.call({
            userPostId: 'z9XoBLns2YyqHqFeN',  //TODO: fill in a userPostId here
            text: 'test text edited from only server 8',
            tag: 'new tag?',
            imageLinks: [],
        });
    },
    'click .userPost-upvote' : function() {
        console.log('in userPost-upvote test');
        userPostUpvote.call({
            userPostId: 'z9XoBLns2YyqHqFeN',  //TODO: fill in a userPostId here
        });
    },
    'click .userPost-flag' : function() {
        console.log('in userPost-flag test');
        userPostFlag.call({
            userPostId: 'z9XoBLns2YyqHqFeN',  //TODO: fill in a userPostId here
        });
    },
    'click .userPost-unflag' : function() {
        console.log('in userPost-unflag test');
        userPostUnflag.call({
            userPostId: 'z9XoBLns2YyqHqFeN',  //TODO: fill in a userPostId here
        });
    },
    'click .userPost-decrementComments' : function() {
        console.log('in userPost-decrementComments test');
        userPostDecrementComment.call({
            userPostId: ' ',  //TODO: fill in a userPostId here
        });
    },
    //TODO: userPostDelete() ValidatedMethod

    'click .userAttributes-insert' : function() {
        console.log(' in userAttributes-insert test');
        userAttributesInsert.call({
            bio: 'test bio inserted 7',
            location: 'test location inserted 7',
            profilePhotoLink: ' ',
        });
    },
    'click .userAttributes-edit' : function() {
        console.log(' in userAttributes-edit test');
        userAttributesEdit.call({
            bio: 'test bio edited 14',
            location: 'test location edited 14',
            profilePhotoLink: 'test link here edited 14',
        });
    },
    'click .userAttributes-updateRank' : function() {
        console.log(' in userAttributes-insert test');
        userAttributesUpdateRankServer('4KFncu8zivCjen7hi', 2);
        /*userAttributesUpdateRank.call({
            userAttributesId: '4KFncu8zivCjen7hi',
            amount: 5,
        });*/
    },


});

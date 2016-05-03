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
         decrementComments as userPostDecrementComments,
         deletePost as userPostDeletePost }
        from '../../api/user-posts/methods.js'

import { UserAttributes } from '../../api/user-attributes/user-attributes.js';
import { insert as userAttributesInsert,
         edit as userAttributesEdit,
         updateRank as userAttributesUpdateRank }
        from '../../api/user-attributes/methods.js';

import { Comments } from '../../api/comments/comments.js';
import { insert as commentInsert,
         edit as commentEdit,
         deleteComment as commentDeleteComment }
        from '../../api/comments/methods.js';

import { ExchangeItems } from '../../api/exchange-items/exchange-items.js';
import { insert as exchangeItemInsert,
         edit as exchangeItemEdit,
         lock as exchangeItemLock,
         unlock as exchangeItemUnlock,
         transfer as exchangeItemsTransfer,
         lockMethod as exchangeItemLockMethod,
         unlockMethod as exchangeItemUnlockMethod,
         transferMethod as exchangeItemTransferMethod,
         deleteItem as exchangeItemDeleteItem }
        from '../../api/exchange-items/methods.js';

import { Transactions } from '../../api/transactions/transactions.js';
import { requestTransaction,
         approveTransaction,
         completeTransaction,
         declineTransaction,
         cancelTransaction }
        from '../../api/transactions/methods.js';



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
        this.subscribe('comments.all');
        this.subscribe('exchangeItems.all');
        this.subscribe('transactions.all');
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
    },
    allComments() {
        console.log('in allComments helper');
        const comments = Comments.find({});
        comments.forEach( function(comment) {
            console.log(comment);
        });
    },
    thisPostComments(userPostId) {
        console.log('in thisPostComments helper');
        //...
    },
    allExchangeItems() {
        console.log('in allExchangeItems helper');
        const exchangeItems = ExchangeItems.find({});
        exchangeItems.forEach( function(item) {
            console.log(item);
        });
    },
    allTransactions() {
        console.log('in allTransactions helper');
        const transactions = Transactions.find({});
        transactions.forEach( function(transaction) {
            console.log(transaction);
        });
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
            userPostId: 'dXGWNq7xGHmRQwb68',  //TODO: fill in a userPostId here
            text: 'test text edited from only server 12',
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
    'click .userPost-deletePost' : function() {
        console.log('in userPost-deletePost');
        userPostDeletePost.call({
            userPostId: 'hnjZAeuJSHRmjGLMe',  //TODO: fill in a userPostId here
        });
    },

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
        userAttributesUpdateRank('rWu36b354qwJPqsyM', 2);
    },

    'click .comments-insert' : function() {
        console.log(' in comments-insert test');
        commentInsert.call({
            userPostId: 'hnjZAeuJSHRmjGLMe',  //TODO: fill in a userPostId here
            text: 'Test comment 3',
        })
    },
    'click .comments-edit' : function() {
        console.log(' in comments-edit test');
        commentEdit.call({
            commentId: '29EApHPKRkBtwukvK',  //TODO: fill in a commentId here
            text: 'Comment edited 3',
        });
    },
    'click .comments-delete' : function() {
        console.log(' in comments-delete test');
        commentDeleteComment.call({
            commentId: '29EApHPKRkBtwukvK', //TODO: fill in a commentId here
        })
    },

    'click .exchangeItems-insert' : function() {
        console.log(' in exchangeItems-insert test');
        exchangeItemInsert.call({
            title: 'exItem title 5',
            description: 'exItem description 5',
            imageLinks: [],
            available: true,
            tag: ' ',
        })
    },
    'click .exchangeItems-edit' : function() {
        console.log(' in exchangeItems-edit test');
        exchangeItemEdit.call({
            exchangeItemId: 'zo9Y8KNsqoNTW3x38',  //TODO: fill in an exchangeItemId here
            title: 'exItem title edited 4',
            description: 'exItem description edited 4',
            imageLinks: [],
            available: true,
            tag: 'exItem tag edited 4',
        });
        console.log('exItem edit called?');
    },
    'click .exchangeItems-lock' : function() {
        console.log(' in exchangeItems-lock test');
        exchangeItemLockMethod.call({
            itemIds: ['zo9Y8KNsqoNTW3x38']
        });
    },
    'click .exchangeItems-unlock' : function() {
        console.log(' in exchangeItems-unlock test');
        exchangeItemUnlockMethod.call({
            itemIds: ['zo9Y8KNsqoNTW3x38']
        });
    },
    'click .exchangeItems-transfer' : function() {
        console.log(' in exchangeItems-transfer test');
        exchangeItemTransferMethod.call({
            itemIds: ['zo9Y8KNsqoNTW3x38'],
            oldOwnerId: 'j9nhN65WcpqpoXWgy',
            newOwnerId: 'BSLLPh3TCSiXrGc52'
        });
        //exchangeItemsTransfer(['K92NKf92Fe7hmvhd6'], 'j9nhN65WcpqpoXWgy', 'BSLLPh3TCSiXrGc52')
    },
    'click .exchangeItems-updateRank' : function() {
        console.log(' in exchangeItems-updateRank test');

    },
    'click .exchangeItems-deleteItem' : function() {
        console.log(' in exchangeItems-deleteItem test');
        exchangeItemDeleteItem.call({
            exchangeItemId: 'YNXFoFh6YAL3skubu'  //TODO: fill in an exchangeItemId here
        })
    },

    'click .transaction-request' : function () {
        console.log(' in transaction-request test');
        requestTransaction.call({
            requesteeName: 'asdf',
            itemIds: ['piz4TPuQj489qm9DT','zo9Y8KNsqoNTW3x38'/*,'tMYLDCr6frDGpEuFX'*/],  //TODO: fill this array with exchangeItem ids
        });
    },
    'click .transaction-approve' : function () {
        console.log(' in transaction-approve test');
        approveTransaction.call({
            transactionId: 'LtTdAGvTZREpvKqPw' //TODO: fill in a transactionId here
        });
    },
    'click .transaction-complete' : function () {
        console.log(' in transaction-complete test');
        completeTransaction.call({
            transactionId: 'LtTdAGvTZREpvKqPw' //TODO: fill in a transactionId here
        });
    },
    'click .transaction-decline' : function () {
        console.log(' in transaction-decline test');
        declineTransaction.call({
            transactionId: '9rgi7MkNvvCJ4sYTC' //TODO: fill in a transactionId here
        });
    },
    'click .transaction-cancel' : function () {
        console.log(' in transaction-cancel test');
        cancelTransaction.call({
            transactionId: '8EMKDL3k242SWftJh' //TODO: fill in a transactionId here
        });
    },

});

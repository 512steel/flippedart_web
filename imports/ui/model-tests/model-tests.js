import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';


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
    deleteItem as exchangeItemDeleteItem }
    from '../../api/exchange-items/methods.js';

import { Transactions } from '../../api/transactions/transactions.js';
import { requestTransaction,
    approveTransaction,
    completeTransaction,
    declineTransaction,
    cancelTransaction }
    from '../../api/transactions/methods.js';

import { Notifications } from '../../api/notifications/notifications.js';
import { clearAllNotifications,
    clearSingleNotification } from '../../api/notifications/methods.js';

import { ChatSessions } from '../../api/chat-sessions/chat-sessions.js';

import { ChatMessages } from '../../api/chat-messages/chat-messages.js';
import { insert as chatMessageInsert,
    remove as chatMessageRemove } from '../../api/chat-messages/methods.js';


import { listRenderHold } from '../launch-screen.js';
//import './lists-show-page.html';

import './model-tests.html';

// Components used inside the template
import './../components/app-not-found.js';

Template.model_tests_page.onCreated(function listsShowPageOnCreated() {
    this.getListId = () => FlowRouter.getParam('_id');

    this.autorun(() => {
        this.subscribe('todos.inList', this.getListId());

        /* *** test subscriptions *** */
        this.subscribe('userPosts.all');
        this.subscribe('userAttributes.all');
        this.subscribe('comments.all');
        this.subscribe('exchangeItems.all');
        this.subscribe('transactions.all');
        this.subscribe('notifications.user');
        this.subscribe('chatSessions.all');
        this.subscribe('chatMessages.all');
    });
});

Template.model_tests_page.onRendered(function listsShowPageOnRendered() {
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            //listRenderHold.release();
        }
    });
});

Template.model_tests_page.helpers({
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
    },
    userNotifications() {
        console.log('in userNotifications helper');
        const notifications = Notifications.find({});
        notifications.forEach( function(notifications) {
            console.log(notifications);
        });
    },
    allChatSessions() {
        console.log('in allChatSessions helper');
        const chatSessions = ChatSessions.find({});
        chatSessions.forEach( function(chatSession) {
            console.log(chatSession);
        });
    },
    allChatMessages() {
        console.log('in allChatMessages helper');
        const chatMessages = ChatMessages.find({});
        chatMessages.forEach( function(chatMessage) {
            console.log(chatMessage);
        });
    },
});

Template.model_tests_page.events({

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
            bio: 'test bio edited 15',
            location: 'test location edited 15',
            profilePhotoLink: 'test link here edited 15',
        });
    },
    'click .userAttributes-updateRank' : function() {
        console.log(' in userAttributes-insert test');
        userAttributesUpdateRank('rWu36b354qwJPqsyM', 2);
    },

    'click .comments-insert' : function() {
        console.log(' in comments-insert test');
        commentInsert.call({
            userPostId: '6Wztnr69NHjj3nhCY',  //TODO: fill in a userPostId here
            text: 'Test comment on asdf from asdf2',
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
            commentId: 'TdnxEeqbcA8bmRHc4', //TODO: fill in a commentId here
        })
    },

    'click .exchangeItems-insert' : function() {
        console.log(' in exchangeItems-insert test');
        exchangeItemInsert.call({
            title: 'exItem title 16',
            description: 'exItem description 16',
            imageLinks: [],
            available: true,
            tag: 'exItem tag 16',
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

    /*
     NOTE these testing methods have been removed from exchangeItems.methods.

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
     */

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
            itemIds: ['FD32hRJvBCkwLpdZF'],  //TODO: fill this array with exchangeItem ids
        });
    },
    'click .transaction-approve' : function () {
        console.log(' in transaction-approve test');
        approveTransaction.call({
            transactionId: 'TdQ698nwivj3zQsCk' //TODO: fill in a transactionId here
        });
    },
    'click .transaction-complete' : function () {
        console.log(' in transaction-complete test');
        completeTransaction.call({
            transactionId: 'ZseZbBT3KQ67nXw4N' //TODO: fill in a transactionId here
        });
    },
    'click .transaction-decline' : function () {
        console.log(' in transaction-decline test');
        declineTransaction.call({
            transactionId: 'TdQ698nwivj3zQsCk' //TODO: fill in a transactionId here
        });
    },
    'click .transaction-cancel' : function () {
        console.log(' in transaction-cancel test');
        cancelTransaction.call({
            transactionId: 'bWCDXTeXvaawcLZNR' //TODO: fill in a transactionId here
        });
    },

    'click .notificatins-clear-all': function () {
        console.log(' in notifications-clear test');
        clearAllNotifications.call({
            //...
        })
    },
    'click .notificatins-clear-single': function () {
        console.log(' in notifications-clear test');
        clearSingleNotification.call({
            notificationId: 'J9z6rYgW63XzDGEWJ'  //TODO: fill in a notificationId here
        })
    },

    'click .chatMessage-insert': function() {
        console.log(' in chatMessage-insert test');
        chatMessageInsert.call({
            chatSessionId: 'eL2Bw2wZZ5GxH7NNX',  //TODO: fill in a chatSessionId here
            text: 'Test message text 2',
            imageLink: ' ',
        });
    },
    'click .chatMessage-delete': function() {
        console.log(' in chatMessage-delete test');
        chatMessageRemove.call({
            chatMessageId: 'dnR234BJ9jCLcAHoJ',  //TODO: fill in a chatMessageId here
        });
    },

});

import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';

// Import to load these templates
import '../../ui/layouts/app-body.js';
import '../../ui/pages/root-redirector.js';
import '../../ui/components/app-not-found.js';
import '../../ui/components/signup-call-to-action';

// Static page imports
import '../../ui/pages/home-page.js';
import '../../ui/pages/about-page.js';
import '../../ui/pages/make-page.js';
import '../../ui/pages/donate-page.js';
import '../../ui/pages/policies-page.js';
import '../../ui/pages/feedback-page.js';
import '../../ui/pages/feedback-thanks-page.js';

// Dynamic page imports
import '../../ui/components/exchanges-pages/exchanges-components.js';


// Import to override accounts templates
import '../../ui/accounts/accounts-templates.js';


//TODO: comment this out before deploying
import '../../ui/model-tests/model-tests.js';
FlowRouter.route('/tests', {
    name: 'model.tests',
    action() {
        BlazeLayout.render('App_body', { main: 'model_tests_page' });
    },
});


/* Dynamic pages */
FlowRouter.route('/profile/:username/post/:userPostId', {
    name: 'profile.post',
    action() {
        BlazeLayout.render('App_body', { main: 'user_post' });
    },
});
FlowRouter.route('/profile/:username/post/:userPostId/edit', {
    name: 'profile.post.edit',
    action() {
        BlazeLayout.render('App_body', { main: 'user_post_edit' });
    },
});

FlowRouter.route('/profile/:username/projects', {
    name: 'profile.projects',
    action() {
        BlazeLayout.render('App_body', { main: 'items_user' });
    },
});

FlowRouter.route('/profile/:username/:postsLimit?', {
    name: 'profile.feed',
    action() {
        BlazeLayout.render('App_body', { main: 'user_profile_feed' });
    },
});
FlowRouter.route('/profile/:username/top/:postsLimit?', {
    name: 'profile.feed.top',
    action() {
        BlazeLayout.render('App_body', { main: 'user_profile_feed_top' });
    },
});

FlowRouter.route('/messages/:username/:messagesLimit?', {
    name: 'chatWindow.user',
    action() {
        BlazeLayout.render('App_body', { main: 'chat_window'});
    }
});

FlowRouter.route('/add', {
    name: 'projects.add',
    action() {
        BlazeLayout.render('App_body', { main: 'items_add' });
    },
});
FlowRouter.route('/projects/:exchangeItemId', {
    name: 'projects.single',
    action() {
        BlazeLayout.render('App_body', { main: 'items_single' });
    },
});

FlowRouter.route('/exchanges', {
    name: 'exchanges.user',
    action() {
        BlazeLayout.render('App_body', { main: 'user_exchanges' });
    },
});
FlowRouter.route('/exchanges/:exchangeId', {
    name: 'exchanges.user.single',
    action() {
        BlazeLayout.render('App_body', { main: 'user_single_exchange' });
    },
});

FlowRouter.route('/top/:thing', {
    name: 'top.thing',
    action() {
        BlazeLayout.render('App_body', { main: 'top_things_page' });
    },
});

FlowRouter.route('/explore', {
    name: 'explore',
    action() {
        BlazeLayout.render('App_body', { main: 'explore_page' });
    },
});
FlowRouter.route('/account', {
    name: 'user.account',
    action() {
        BlazeLayout.render('App_body', { main: 'user_account_page' });
    },
});


/* Static pages */
FlowRouter.route('/about', {
    name: 'static.about',
    action() {
        BlazeLayout.render('App_body', { main: 'about_page' });
    },
});
FlowRouter.route('/make', {
    name: 'static.make',
    action() {
        BlazeLayout.render('App_body', { main: 'make_page' });
    },
});
FlowRouter.route('/feedback', {
    name: 'static.feedback',
    action() {
        BlazeLayout.render('App_body', { main: 'feedback_page' });
    },
});
FlowRouter.route('/feedback/thanks', {
    name: 'static.feedback.thanks',
    action() {
        BlazeLayout.render('App_body', { main: 'feedback_thanks_page' });
    },
});
FlowRouter.route('/policies', {
    name: 'static.policies',
    action() {
        BlazeLayout.render('App_body', { main: 'policies_page' });
    },
});
FlowRouter.route('/donate', {
    name: 'static.donate',
    action() {
        BlazeLayout.render('App_body', { main: 'donate_page' });
    },
});
FlowRouter.route('/', {
    name: 'static.home',  //TODO: used to be "App.home"
    action() {
        BlazeLayout.render('App_body', { main: 'home_page' });
    },
});


// the App_notFound template is used for unknown routes and missing lists
FlowRouter.notFound = {
    action() {
        BlazeLayout.render('App_body', { main: 'App_notFound' });
    },
};

AccountsTemplates.configureRoute('signIn', {
    name: 'signin',
    path: '/signin',
});

AccountsTemplates.configureRoute('signUp', {
    name: 'join',
    path: '/join',
});

AccountsTemplates.configureRoute('forgotPwd');

AccountsTemplates.configureRoute('resetPwd', {
  name: 'resetPwd',
  path: '/reset-password',
});



/*
***************************
     Iron router temp
***************************
 */

/*
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'not_found', //FIXME: template name is "notFound"
    trackPageView: true,
    waitOn: function() {
        return [Meteor.subscribe('notifications')];
    }
});
*/



/****        Flipped Art:        ****/


/*
Router.route('/profile/:username/post/:userPostId', {
    name: 'userPostPage',
    waitOn: function() {
        return [
            Meteor.subscribe('singleUserPost', this.params.userPostId),
            Meteor.subscribe('comments', this.params.userPostId)
        ];
    },
    data: function() { return UserPosts.findOne(this.params.userPostId); }
});
Router.route('/profile/:username/post/:userPostId/edit', {
    name: 'userPostEdit',
    waitOn: function() {
        return Meteor.subscribe('singleUserPost', this.params.userPostId);
    },
    data: function() { return UserPosts.findOne(this.params.userPostId); }
});

UserInventoryController = RouteController.extend({
    template: 'userInventoryPage',
    findOptions: function() {
        return {sort: {createdAt: -1}}
    },
    subscriptions: function () {
        this.userInventorySub = [
            Meteor.subscribe('singleUserItems', decodeURI(this.params.username), this.findOptions()),
            Meteor.subscribe('allUsernames')
        ];
    },
    user: function() {
        return Meteor.users.findOne({username: this.params.username})
    },
    items: function() {
        return ExchangeItems.find({}, this.findOptions())
    },
    data: function() {
        return {
            user: this.user(),
            items: this.items()
        }
    }
});
Router.route('/profile/:username/items', {
    name: 'userInventoryPage',
    controller: UserInventoryController
});

ProfilePageController = RouteController.extend({
    template: 'profilePage',
    increment: 5,
    userPostsLimit: function() {
        return parseInt(this.params.postsLimit) || this.increment;
    },
    findOptions: function() {
        return {sort: this.sort, limit: this.userPostsLimit()};
    },
    subscriptions: function() {
        var currentUserId = Meteor.userId();
        if (!currentUserId) {
            currentUserId = " ";
        }
        this.userPostsSub = [
            Meteor.subscribe('userPosts', decodeURI(this.params.username), this.findOptions()),
            Meteor.subscribe('allUsernames'),
            Meteor.subscribe('singleUserItems', decodeURI(this.params.username), {sort: {createdAt: -1}}),
            Meteor.subscribe('userAttributesByUsername', decodeURI(this.params.username)),
            Meteor.subscribe('chatSession', decodeURI(this.params.username), currentUserId)
        ];
    },
    userPosts: function() {
        return UserPosts.find({}, this.findOptions());
    },
    userAttributes: function() {
        return UserAttributes.findOne({username : decodeURI(this.params.username)});
    },
    userItems: function() {
        return ExchangeItems.find({});
    },
    user: function() {
        return Meteor.users.findOne({username: decodeURI(this.params.username)});
    },
    chatExists: function () {
        if (Meteor.user()) {
            var chatSession = ChatSessions.findOne({});
            if (chatSession) {
                return true;
            }
        }
        return false;
    },
    data: function() {
        //TODO: denormalize to check for total number of userPosts in the database to see if
        // we've reached the end in the case where the currently-loaded amount of userPosts
        // is exactly equal to the total number in the database
        var hasMore = this.userPosts().count() === this.userPostsLimit();
        return {
            userPosts: this.userPosts(),
            userAttributes: this.userAttributes(),
            userItems: this.userItems(),
            user: this.user(),
            chatExists: this.chatExists(),
            toggleSortText: this.toggleSortText(),
            toggleSortLink: this.toggleSortLink(),
            ready: this.userPostsSub[0].ready,
            nextPath: hasMore ? this.nextPath() : null
        };
    }
});
ChronologicalUserPostsController = ProfilePageController.extend({
    sort: {createdAt: -1},
    toggleSortText: function() {
        return "top posts";
    },
    toggleSortLink: function() {
        return "rankedUserPosts";
    },
    nextPath: function () {
        return Router.routes.chronologicalUserPosts.path({
            username: this.params.username,
            postsLimit: this.userPostsLimit() + this.increment
        })
    }
});
RankedUserPostsController = ProfilePageController.extend({
    sort: {upvotes: -1, createdAt: -1},
    toggleSortText: function() {
        return "posts by date";
    },
    toggleSortLink: function() {
        return "chronologicalUserPosts";
    },
    nextPath: function() {
        return Router.routes.rankedUserPosts.path({
            username: this.params.username,
            postsLimit: this.userPostsLimit() + this.increment
        })
    }
});
Router.route('/profile/:username/top/:postsLimit?', {name: 'rankedUserPosts'});
Router.route('/profile/:username/:postsLimit?', {name: 'chronologicalUserPosts'});

Router.route('/add', {
    name: 'addSingleItem'
});

ChatWindowController = RouteController.extend({
    template: 'chatWindow',
    increment: 15,
    chatMessagesLimit: function() {
        return parseInt(this.params.messagesLimit) || this.increment;
    },
    findOptions: function() {
        return {sort: {createdAt: -1}, limit: this.chatMessagesLimit()};
    },
    subscriptions: function() {
        var currentUserId = Meteor.userId();
        if (!currentUserId) {
            currentUserId = " ";
        }
        this.chatMessagesSub = [
            Meteor.subscribe('chatSession', decodeURI(this.params.username), currentUserId),
            Meteor.subscribe('chatMessages', decodeURI(this.params.username), currentUserId, this.findOptions())
            //Meteor.subscribe('allChatMessages', this.findOptions())
        ];
    },
    chatSession: function() {
        return ChatSessions.findOne({});
    },
    chatMessages: function() {
        return ChatMessages.find({}, this.findOptions());
    },
    usernamePath: function() {
        return decodeURI(this.params.username);
    },
    nextPath: function () {
        return Router.routes.chatWindow.path({
            username: this.params.username,
            messagesLimit: this.chatMessagesLimit() + this.increment
        })
    },
    data: function() {
        var hasMore = this.chatMessages().count() === this.chatMessagesLimit();
        return {
            chatSession: this.chatSession(),
            chatMessages: this.chatMessages(),
            usernamePath: this.usernamePath(),
            ready: this.chatMessagesSub[1].ready,
            nextPath: hasMore ? this.nextPath() : null
        };
    }
});
Router.route('/messages/:username/:messagesLimit?', {
    name: 'chatWindow',
    controller: ChatWindowController  //unnecessary?
});

//FIXME: lots of repeated code below - consolidate.
UserSingleExchangeController = RouteController.extend({
    template: 'userSingleExchange',
    findTransactionsOptions: function() {
        return {sort: {state: 1, createdAt: -1}}
    },
    subscriptions: function() {
        var currentUserId = Meteor.userId();
        if (!currentUserId) {
            currentUserId = " "
        }
        this.userSingleExchangeSub =  [
            Meteor.subscribe('userTransactionsRequester', currentUserId, this.findTransactionsOptions()),
            Meteor.subscribe('userTransactionsRequestee', currentUserId, this.findTransactionsOptions()),
            Meteor.subscribe('transactionExchangeItems', decodeURI(this.params.exchangeId))
        ];
    },
    transaction: function() {
        return Transactions.findOne({_id: decodeURI(this.params.exchangeId)});
    },
    exchangeItems: function() {
        return ExchangeItems.find({});
    },
    data: function() {
        return {
            user: Meteor.user(),
            items: this.exchangeItems(),
            exchange: this.transaction()
        }
    }
});
Router.route('/exchanges/:exchangeId', {
    name: 'userSingleExchange',
    controller: UserSingleExchangeController
});

SingleItemController = RouteController.extend({
    template: 'singleItemPage',
    subscriptions: function() {
        this.singleItemSub = [
            Meteor.subscribe('singleItem', decodeURI(this.params.exchangeItemId)),
            Meteor.subscribe('singleUserByItem', decodeURI(this.params.exchangeItemId))
        ];
    },
    singleItem: function() {
        return ExchangeItems.findOne({});
    },
    owner: function() {
        var item = ExchangeItems.findOne({});
        if (item) {
            return Meteor.users.findOne({_id: item.ownerId});
        }
    },
    data: function() {
        return {
            item: this.singleItem(),
            owner: this.owner()
        }
    }
});
Router.route('/items/:exchangeItemId', {
    name: 'singleItemPage',
    controller: SingleItemController
});

UserExchangesController = RouteController.extend({
    template: 'userExchanges',
    findTransactionsOptions: function() {
        return {sort: {state: 1, createdAt: -1}}
    },
    subscriptions: function() {
        var currentUserId = Meteor.userId();
        if (!currentUserId) {
            currentUserId = " "
        }
        this.userExchangesSub = [
            Meteor.subscribe('userTransactionsRequester', currentUserId, this.findTransactionsOptions()),
            Meteor.subscribe('userTransactionsRequestee', currentUserId, this.findTransactionsOptions())
        ];
    },
    transactions: function() {
        return Transactions.find({}, this.findTransactionsOptions())
    },
    requestedEx: function () {
        return Transactions.find({state: 0}, this.findTransactionsOptions())
    },
    pendingEx: function () {
        return Transactions.find({state: 1}, this.findTransactionsOptions())
    },
    completedEx: function () {
        return Transactions.find({state: 2}, this.findTransactionsOptions())
    },
    declinedEx: function () {
        return Transactions.find({state: 3}, this.findTransactionsOptions())
    },
    cancelledEx: function () {
        return Transactions.find({state: 4}, this.findTransactionsOptions())
    },
    allCancelledEx: function () {
        return Transactions.find({$or : [{state: 3, state: 4}]}, this.findTransactionsOptions())
    },
    data: function() {
        return {
            user: Meteor.user(),
            exchanges: this.transactions(),
            requestedEx: this.requestedEx(),
            pendingEx: this.pendingEx(),
            completedEx: this.completedEx(),
            declinedEx: this.declinedEx(),
            cancelledEx: this.cancelledEx(),
            allCancelledEx: this.allCancelledEx()
        }
    }
});
Router.route('/exchanges', {
    name: 'userExchanges',
    controller: UserExchangesController
});

TopThingsController = RouteController.extend({
    template: 'topThings',
    findOptions: function() {
        return {sort: {rank: -1}, limit: 10}
    },
    subscriptions: function() {
        this.topThingsSub = [
            Meteor.subscribe('allUserAttributes', this.findOptions()),
            Meteor.subscribe('allUserPosts', this.findOptions()),
            Meteor.subscribe('exchangeItems', this.findOptions())
        ];
    },
    things: function() {
        var thingType = decodeURI(this.params.thing);
        if (thingType == "posts") {
            return UserPosts.find({});
        }
        else if (thingType == "items") {
            return ExchangeItems.find({});
        }
        else if (thingType == "users") {
            return UserAttributes.find({});
        }
        else {
            Router.go('explore', {});
        }
    },
    data: function() {
        return {
            things: this.things(),
            thingType: decodeURI(this.params.thing)
        }
    }
});
Router.route('/top/:thing', {  //NOTE: for now, ":thing" can be "posts", "items", or "users"
    name: 'topThings',
    controller: TopThingsController
});

ExploreController = RouteController.extend({
    template: 'explore',
    findOptions: function() {
        return {sort: {rank: -1}, limit: 6}
    },
    subscriptions: function() {
        this.topThingsSub = [
            Meteor.subscribe('allUserAttributes', this.findOptions()),
            Meteor.subscribe('allUserPosts', this.findOptions()),
            Meteor.subscribe('exchangeItems', this.findOptions())
        ];
    },
    posts: function() {
        return UserPosts.find({});
    },
    items: function() {
        return ExchangeItems.find({});
    },
    users: function() {
        return UserAttributes.find({});
    },
    data: function() {
        return {
            posts: this.posts(),
            items: this.items(),
            userAttributes: this.users()
        }
    }
});
Router.route('/explore', {
    name: 'explore',
    controller: ExploreController
});

MyAccountController = RouteController.extend({
    template: 'my-account',
    userAttributes: function() {
        return UserAttributes.findOne({userId: Meteor.userId()});
    },
    findTransactionsOptions: function() {
        return {sort: {state: 1, createdAt: -1}}
    },
    subscriptions: function() {
        var currentUserId = Meteor.userId();
        if (!currentUserId) {
            currentUserId = " ";
        }
        this.userAccountSub = [
            Meteor.subscribe('userAttributes', currentUserId),
            Meteor.subscribe('userTransactionsRequester', currentUserId, this.findTransactionsOptions()),
            Meteor.subscribe('userTransactionsRequestee', currentUserId, this.findTransactionsOptions())
        ];
    },
    transactions: function() {
        return Transactions.find({}, this.findTransactionsOptions())
    },
    data: function () {
        return {
            user: Meteor.user(),
            userAttributes: this.userAttributes() ,
             //exchanges: this.transactions()
        }
    }
});
Router.route('/account', {
    name: 'my-account',
    controller: MyAccountController
});

SearchController = RouteController.extend({
    template: 'searchResults',
    data: function () {
        return {
            query: sanitizeString(decodeURI(this.params.query.q))
        }
    }
});
Router.route('/search', {
    name: 'searchResults',
    controller: SearchController
});

//Static info pages
Router.route('/about', {name: 'aboutpage'});
Router.route('/make', {name: 'makeyourownpage'});
Router.route('/feedback', {name: 'feedback'});
Router.route('/feedback/thanks', {name: 'feedbackThanks'});
Router.route('/policies', {name: 'policies'});

HomeController = RouteController.extend({
    template: 'homepage'
});
Router.route('/', {
    name: 'home',
    layoutTemplate: 'infoPagesLayout',
    controller: HomeController
});


var requireLogin = function() {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        }
        else {
            this.render('accessDenied');
        }
    }
    else {
        this.next();
    }
};


Router.onBeforeAction('dataNotFound');
Router.onBeforeAction(requireLogin, {only: ['postSubmit', 'editMyAccountForm']});  //TODO: add more route names to this list
*/

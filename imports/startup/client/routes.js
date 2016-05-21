import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';

// Import to load these templates
import '../../ui/layouts/app-body.js';
import '../../ui/pages/root-redirector.js';
import '../../ui/components/app-not-found.js';
import '../../ui/components/app-not-authorized.js';
import '../../ui/components/signup-call-to-action.js';

// Static page imports
import '../../ui/pages/home-page.js';
import '../../ui/pages/about-page.js';
import '../../ui/pages/make-page.js';
import '../../ui/pages/donate-page.js';
import '../../ui/pages/policies-page.js';
import '../../ui/pages/feedback-page.js';
import '../../ui/pages/feedback-thanks-page.js';

// Dynamic page imports
import '../../ui/components/transactions-pages/transactions-components.js';
import '../../ui/components/exchangeItems/exchangeItems-components.js';
import '../../ui/components/user-posts/user-posts-components.js';


// Import to override accounts templates
import '../../ui/accounts/accounts-templates.js';


//FIXME: comment this out before deploying
import '../../ui/model-tests/model-tests.js';
FlowRouter.route('/tests', {
    name: 'model.tests',
    action() {
        BlazeLayout.render('App_body', { main: 'model_tests_page' });
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

FlowRouter.route('/messages/:username/:messagesLimit?', {
    name: 'chatWindow.user',
    action() {
        BlazeLayout.render('App_body', { main: 'chat_window'});
    }
});


/* Dynamic pages */
FlowRouter.route('/add', {
    name: 'projects.add',
    action() {
        BlazeLayout.render('App_body', { main: 'project_submit_page' });
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


FlowRouter.route('/:username/exchanges', {
    name: 'exchanges.user',
    action() {
        BlazeLayout.render('App_body', { main: 'user_transactions' });
    },
});
FlowRouter.route('/:username/exchanges/:exchangeId', {
    name: 'exchanges.user.single',
    action() {
        BlazeLayout.render('App_body', { main: 'user_single_transaction' });
    },
});
/*
    The following two are aliases for the '/exchanges' route.
    TODO: when using the FlowRouter.go() method, include the :username param for more semantic routes?
*/
FlowRouter.route('/exchanges', {
    name: 'exchanges.user',
    action() {
        BlazeLayout.render('App_body', { main: 'user_transactions' });
    },
});
FlowRouter.route('/exchanges/:exchangeId', {
    name: 'exchanges.user.single',
    action() {
        BlazeLayout.render('App_body', { main: 'user_single_transaction' });
    },
});


//TODO: make these "posts" routes more semantic
FlowRouter.route('/:username/posts', {
    name: 'profile.posts',
    action() {
        BlazeLayout.render('App_body', {main: 'user_posts_all'});
    },
});
FlowRouter.route('/:username/posts/all', {
    name: 'profile.posts.new',
    action() {
        BlazeLayout.render('App_body', {main: 'user_posts_all'});
    },
});
FlowRouter.route('/:username/posts/top', {  //TODO...
    name: 'profile.posts.top',
    action() {
        BlazeLayout.render('App_body', {main: 'user_posts_all'});
    },
});
//FIXME: the following two are old routes from chalkboard_exchange.  Assimilate their meaning into the routes above.
/*FlowRouter.route('/:username/:postsLimit?', {
    name: 'profile.feed',
    action() {
        BlazeLayout.render('App_body', { main: 'user_profile_feed' });
    },
});
FlowRouter.route('/:username/top/:postsLimit?', {
    name: 'profile.feed.top',
    action() {
        BlazeLayout.render('App_body', { main: 'user_profile_feed_top' });
    },
});*/


FlowRouter.route('/:username/posts/:userPostId', {
    name: 'profile.post',
    action() {
        BlazeLayout.render('App_body', { main: 'user_post_single_page' });
    },
});
FlowRouter.route('/:username/posts/:userPostId/edit', {
    name: 'profile.post.edit',
    action() {
        BlazeLayout.render('App_body', { main: 'user_post_edit' });
    },
});


FlowRouter.route('/:username/projects', {
    name: 'profile.projects',
    action() {
        BlazeLayout.render('App_body', { main: 'projects_user_all' });
    },
});
FlowRouter.route('/:username/projects/:exchangeItemId', {
    name: 'projects.single',
    action() {
        BlazeLayout.render('App_body', { main: 'project_single_page' });
    },
});

import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { DocHead } from 'meteor/kadira:dochead';

// Import to load these templates
import '../../ui/layouts/app-body.js';
import '../../ui/pages/root-redirector.js';
import '../../ui/components/app-not-found.js';
import '../../ui/components/app-not-authorized.js';
import '../../ui/components/signup-call-to-action.js';

// Static page imports
import '../../ui/pages/home-page.js';
import '../../ui/pages/about-page.js';
import '../../ui/pages/donate-page.js';
import '../../ui/pages/policies-page.js';
import '../../ui/pages/feedback-page.js';
import '../../ui/pages/feedback-thanks-page.js';
import '../../ui/pages/howto-page.js';
import '../../ui/pages/newsletter-page.js';
import '../../ui/pages/booking-page.js';
import '../../ui/pages/state-of-the-arts-page.js';
import '../../ui/pages/tiny-studio-page.js';
import '../../ui/pages/press-page.js';

// Dynamic page imports
import '../../ui/components/transactions-pages/transactions-components.js';
import '../../ui/components/exchangeItems/exchangeItems-components.js';
import '../../ui/components/user-posts/user-posts-components.js';
import '../../ui/components/user-profile/profile-page-components.js';
import '../../ui/components/chat/chat-window-components.js';
import '../../ui/components/admin/admin-components.js';
import '../../ui/components/eventCalendar/event-calendar-components.js';


// Import to override accounts templates
import '../../ui/accounts/accounts-templates.js';


//FIXME: comment this out before deploying
/*import '../../ui/model-tests/model-tests.js';
FlowRouter.route('/tests', {
    name: 'model.tests',
    action() {
        BlazeLayout.render('App_body', { main: 'model_tests_page' });
    },
});*/


FlowRouter.triggers.enter([
    function() {
        DocHead.removeDocHeadAddedTags();
    }
]);


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

AccountsTemplates.configureRoute('verifyEmail', {
    name: 'verifyEmail',
    path: '/verify-email',
});


FlowRouter.route('/admin', {
    name: 'static.admin',
    action() {
        BlazeLayout.render('App_body', { main: 'admin_page' });
    },
});


/* Static pages */
FlowRouter.route('/about', {
    name: 'static.about',
    action() {
        BlazeLayout.render('App_body', { main: 'about_page' });
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
FlowRouter.route('/support', {
    name: 'static.support',
    action() {
        BlazeLayout.render('App_body', { main: 'donate_page' });
    },
});
FlowRouter.route('/howto', {
    name: 'static.howto',
    action() {
        BlazeLayout.render('App_body', { main: 'howto_page' });
    }
});
FlowRouter.route('/newsletter', {
    name: 'static.newsletter',
    action() {
        BlazeLayout.render('App_body', { main: 'newsletter_page' });
    }
});
FlowRouter.route('/booking', {
    name: 'static.booking',
    action() {
        BlazeLayout.render('App_body', { main: 'booking_page' });
    }
});
FlowRouter.route('/booking/thanks', {
    name: 'static.booking.thanks',
    action() {
        BlazeLayout.render('App_body', { main: 'booking_page_thanks' });
    }
});
FlowRouter.route('/tiny-studio', {
    name: 'static.tinyStudio',
    action() {
        BlazeLayout.render('App_body', { main: 'tiny_studio_page' });
    }
});
FlowRouter.route('/press', {
    name: 'static.press',
    action() {
        BlazeLayout.render('App_body', { main: 'press_page' });
    }
});
FlowRouter.route('/', {
    name: 'static.home',
    action() {
        BlazeLayout.render('App_body', { main: 'home_page' });
    },
});

FlowRouter.route('/messages', {
    name: 'chatSessions.list',
    action() {
        BlazeLayout.render('App_body', { main: 'chat_sessions_list_page' });
    }
});
FlowRouter.route('/messages/:username/:messagesLimit?', {
    name: 'chatWindow.user',
    action() {
        BlazeLayout.render('App_body', { main: 'chat_window_card'});
    }
});


/* Commentable pages */
FlowRouter.route('/state-of-the-arts', {
    name: 'page.state-of-the-arts',
    action() {
        BlazeLayout.render('App_body', { main: 'state_of_the_arts_page' });
    }
});


/* Dynamic pages */
FlowRouter.route('/add', {
    name: 'projects.add',
    action() {
        BlazeLayout.render('App_body', { main: 'project_submit_page' });
    },
});

FlowRouter.route('/notifications', {
    name: 'notifications.page',
    action() {
        BlazeLayout.render('App_body', { main: 'notifications_page' });
    }
});

FlowRouter.route('/top/:thing', {
    name: 'top.thing',
    action() {
        BlazeLayout.render('App_body', { main: 'top_things_page' });
    },
});

FlowRouter.route('/explore', {
    name: 'explore.page',
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

FlowRouter.route('/calendar', {
    name: 'eventCalendar.page',
    action() {
        BlazeLayout.render('App_body', { main: 'event_calendar_page' });
    }
});
FlowRouter.route('/calendar/add', {
    name: 'eventCalendar.add',
    action() {
        BlazeLayout.render('App_body', { main: 'event_calendar_add_page' });
    }
});
FlowRouter.route('/calendar/:MMDDYY', {
    name: 'eventCalendar.singleDate',
    action() {
        BlazeLayout.render('App_body', { main: 'event_calendar_single_date_page' });
    }
});
FlowRouter.route('/calendar/:MMDDYY/:eventName/:nameSlug', {
    name: 'eventCalendar.singleEvent',
    action() {
        BlazeLayout.render('App_body', { main: 'event_calendar_single_event_page' });
    }
});
FlowRouter.route('/calendar/:MMDDYY/:eventName/:nameSlug/edit', {
    name: 'eventCalendar.singleEvent.edit',
    action() {
        BlazeLayout.render('App_body', { main: 'event_calendar_single_event_edit' });
    }
});

FlowRouter.route('/make', {
    name: 'makeProjects.page',
    action() {
        BlazeLayout.render('App_body', { main: 'make_projects_page' });
    },
});
FlowRouter.route('/make/add', {
    name: 'makeProjects.add',
    action() {
        BlazeLayout.render('App_body', { main: 'make_projects_add_page' });
    },
});
FlowRouter.route('/make/:makeProjectName', {
    name: 'makeProjects.singleProject',
    action() {
        BlazeLayout.render('App_body', { main: 'make_projects_page' });
    },
});
FlowRouter.route('/make/:makeProjectName/edit', {
    name: 'makeProjects.edit',
    action() {
        BlazeLayout.render('App_body', { main: 'make_projects_edit' });
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


FlowRouter.route('/:username', {
    name: 'profile.page',
    action() {
        BlazeLayout.render('App_body', {main: 'profile_page_card'});
    },
});

//TODO: make these "posts" routes more semantic
FlowRouter.route('/:username/posts', {
    name: 'profile.posts',
    action() {
        BlazeLayout.render('App_body', {main: 'user_posts_all_page'});
    },
});
FlowRouter.route('/:username/posts/new', {
    name: 'profile.posts.new',
    action() {
        BlazeLayout.render('App_body', {main: 'user_posts_all_page'});
    },
});
FlowRouter.route('/:username/posts/top', {
    name: 'profile.posts.top',
    action() {
        BlazeLayout.render('App_body', {main: 'user_posts_all_page'});
    },
});


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
        BlazeLayout.render('App_body', { main: 'projects_user_all_page' });
    },
});
FlowRouter.route('/:username/projects/:exchangeItemId', {
    name: 'projects.single',
    action() {
        BlazeLayout.render('App_body', { main: 'project_single_page' });
    },
});

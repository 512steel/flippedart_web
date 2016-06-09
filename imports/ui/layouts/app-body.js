//import './app-body.html';
//import './app-body-foundation-top-bar.html';
import './app-body-foundation-off-canvas.html';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { TAPi18n } from 'meteor/tap:i18n';

import { UserAttributes } from '../../api/user-attributes/user-attributes.js';

import { Notifications } from '../../api/notifications/notifications.js';
import { clearAllNotifications } from '../../api/notifications/methods.js';

import {
  throwError,
  throwWarning,
  throwSuccess } from '../lib/temporary-alerts.js';

import '../components/notifications/notifications-components.js';
import '../components/temporary_notifications.js';
import '../components/loading.js';

const CONNECTION_ISSUE_TIMEOUT = 5000;

// A store which is local to this file?
const showConnectionIssue = new ReactiveVar(false);

Meteor.startup(() => {
  // Only show the connection error box if it has been 5 seconds since
  // the app started
  setTimeout(() => {
    // FIXME:
    // Launch screen handle created in lib/router.js
    // dataReadyHold.release();

    // Show the connection error box
    showConnectionIssue.set(true);
  }, CONNECTION_ISSUE_TIMEOUT);
});

Template.App_body.onCreated(function appBodyOnCreated() {

  this.subscribe('notifications.user', {sort: {createdAt: -1}});

  this.autorun(() => {
    if (Meteor.user()) {
      this.subscribe('userAttributes.byUsername', Meteor.user().username);
    }
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    menuOpen: false,
    userMenuOpen: false,
  });
});

Template.App_body.onRendered(function() {
  $(document).foundation();
});

Template.App_body.helpers({
  userNotifications() {
      return Notifications.find({});
  },
  currentUsername() {
    if (Meteor.user()) {
      return Meteor.user().username;
    }
  },


  menuOpen() {
    const instance = Template.instance();
    return instance.state.get('menuOpen') && 'menu-open';
  },
  cordova() {
    return Meteor.isCordova && 'cordova';
  },
  emailLocalPart() {
    const email = Meteor.user().emails[0].address;
    return email.substring(0, email.indexOf('@'));
  },
  userMenuOpen() {
    const instance = Template.instance();
    return instance.state.get('userMenuOpen');
  },
  connected() {
    if (showConnectionIssue.get()) {
      return Meteor.status().connected;
    }

    return true;
  },

  /* UI-force user to fill in their userAttributes */
  hasUserAttributes() {
    if (Meteor.user() && UserAttributes.findOne({username: Meteor.user().username})) {
      return true;
    }
    else return false;
  },

  loadingIcon() {
    return '<svg version="1.1" id="Layer_1" class="spinner float-left xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
    'width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">' +
        '<g>' +
        '<path d="M83.729,23.57c-0.007-0.562-0.32-1.084-0.825-1.337c-0.503-0.259-1.107-0.212-1.568,0.114l-5.944,4.262l-0.468,0.336' +
    'c-6.405-6.391-15.196-10.389-24.938-10.389c-13.284,0-24.878,7.354-30.941,18.201l0.024,0.013' +
    'c-0.548,1.183-0.124,2.607,1.026,3.271c0.001,0,0.001,0,0.002,0.001l8.136,4.697c1.218,0.704,2.777,0.287,3.48-0.932' +
    'c0.006-0.011,0.009-0.023,0.015-0.034c3.591-6.404,10.438-10.747,18.289-10.747c4.879,0,9.352,1.696,12.914,4.5l-1.001,0.719' +
    'l-5.948,4.262c-0.455,0.327-0.696,0.89-0.611,1.447c0.081,0.558,0.471,1.028,1.008,1.208l25.447,8.669' +
    'c0.461,0.162,0.966,0.084,1.367-0.203c0.399-0.29,0.629-0.746,0.627-1.23L83.729,23.57z"/>' +
    '<path d="M79.904,61.958c0,0-0.001,0-0.002-0.001l-8.136-4.697c-1.218-0.704-2.777-0.287-3.48,0.932' +
    'c-0.006,0.011-0.009,0.023-0.015,0.034c-3.591,6.404-10.438,10.747-18.289,10.747c-4.879,0-9.352-1.696-12.914-4.5l1.001-0.719' +
    'l5.948-4.262c0.455-0.327,0.696-0.89,0.611-1.447c-0.081-0.558-0.471-1.028-1.008-1.208l-25.447-8.669' +
    'c-0.461-0.162-0.966-0.084-1.367,0.203c-0.399,0.29-0.629,0.746-0.627,1.23l0.092,26.828c0.007,0.562,0.32,1.084,0.825,1.337' +
    'c0.503,0.259,1.107,0.212,1.568-0.114l5.944-4.262l0.468-0.336c6.405,6.391,15.196,10.389,24.938,10.389' +
    'c13.284,0,24.878-7.354,30.941-18.201L80.93,65.23C81.478,64.046,81.055,62.623,79.904,61.958z"/>' +
    '</g>' +
    '</svg>';
  },

  templateGestures: {
    'swipeleft .cordova'(event, instance) {
      instance.state.set('menuOpen', false);
    },
    'swiperight .cordova'(event, instance) {
      instance.state.set('menuOpen', true);
    },
  },
});

Template.App_body.events({
  'click .notifications-clear-all': function () {
    console.log(' in notifications-clear test');
    clearAllNotifications.call({ });
  },


  'click .js-menu'(event, instance) {
    instance.state.set('menuOpen', !instance.state.get('menuOpen'));
  },

  'click .content-overlay'(event, instance) {
    instance.state.set('menuOpen', false);
    event.preventDefault();
  },

  'click .js-user-menu'(event, instance) {
    instance.state.set('userMenuOpen', !instance.state.get('userMenuOpen'));
    // stop the menu from closing
    event.stopImmediatePropagation();
  },

  'click #menu a'(event, instance) {
    instance.state.set('menuOpen', false);
  },

  'click .js-logout'() {
    //FIXME: this should be AccountsTemplates.logout() instead of Meteor.logout().
    Meteor.logout();

    //TODO: FlowRouter.go(...)
  },
});

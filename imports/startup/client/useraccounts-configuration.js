import { AccountsTemplates } from 'meteor/useraccounts:core';
import { TAPi18n } from 'meteor/tap:i18n';

AccountsTemplates.configure({
  showForgotPasswordLink: true,
  texts: {
    errors: {
      loginForbidden: TAPi18n.__('Incorrect username or password'),
      pwdMismatch: TAPi18n.__('Passwords don\'t match'),
    },
    title: {
      signIn: TAPi18n.__('Sign In'),
      signUp: TAPi18n.__('Join'),
    },
  },
  defaultTemplate: 'Auth_page',
  defaultLayout: 'App_body',
  defaultContentRegion: 'main',
  defaultLayoutRegions: {},
});

var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
    _id: "username",
    type: "text",
    displayName: "username",
    required: true,
    minLength: 3,

    /*
     TODO: this is the username blacklist, since routes are configured with '/:username' off the root.
     Is there a cleaner way to configure this regex, pulling from a global USERNAME_BLACKLIST variable?
    */
    re: /^((?!(\bsignin\b|\bjoin\b|\breset-password\b|\babout\b|\bmake\b|\bfeedback\b|\bpolicies\b|\bdonate\b|\bmessages\b|\badd\b|\bexchanges\b|\btop\b|\bexplore\b|\baccount\b|\badmin\b)).)*$/,
    errStr: 'Reserved username',
  },
  {
    _id: 'email',
    type: 'email',
    required: true,
    displayName: "email",
    re: /.+@(.+){2,}\.(.+){2,}/,
    errStr: 'Invalid email',
  },
  pwd
]);
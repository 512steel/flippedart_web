import { AccountsTemplates } from 'meteor/useraccounts:core';
import { TAPi18n } from 'meteor/tap:i18n';

import { EMAIL_REGEX } from './../../ui/lib/globals.js';

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
  sendVerificationEmail: true,
});

var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
    _id: "username",
    type: "text",
    displayName: "username",
    required: true,
    trim: true,

    /*
     NOTE: this is the username blacklist, since routes are configured with '/:username' off the root.
     Is there a cleaner way to configure this regex, pulling from a global USERNAME_BLACKLIST variable?
     TODO: prevent including special characters in the username, including @, #, ?, &, ^, <, >, *, (, ), !, $, and possibly space
    */
    re: /^((?!(\bsignin\b|\bjoin\b|\breset-password\b|\breset_password\b|\btest\b|\btests\b|\babout\b|\bmake\b|\bfeedback\b|\bbr\b|\bdiv\b|\bspan\b|\btable\b|\bsection\b|\bframeset\b|\biframe\b|\bhead\b|\bheader\b|\baddress\b|\barticle\b|\bcanvas\b|\bbutton\b|\bcode\b|\bembed\b|\bform\b|\binput\b|\btextarea\b|\bscript\b|\bnewsletter\b|\bpolicies\b|\bdonate\b|\bsupport\b|\bmessages\b|\badd\b|\bexchanges\b|\btop\b|\bexplore\b|\baccount\b|\bthanks\b|\badmin\b|\bstart\b|\bnotifications\b|\bhow\b|\bhowto\b|\brobots\b|\bsitemap\b|\bbook\b|\bbooking\b|\bpress\b|\bstate\b|\bstate-of-the-arts\b|\bstate_of_the_arts\b|\bstudio\b|\btiny-studio\b|\btiny_studio\b|\bspace\b|\bmakerspace\b|\bsurvey\b|\bcalendar\b|\bfavicon\b|\brobots\.txt\b|\bsitemap\.xml\b|\bfavicon\.png\b|loaderio.*|.*\ .*|.*\!.*|.*\@.*|.*\#.*|.*\$.*|.*\%.*|.*\^.*|.*\&.*|.*\*.*|.*\(.*|.*\).*|.*\~.*|.*\+.*|.*\=.*|.*\\.*|.*\/.*|.*\?.*|.*\..*|.*\,.*|.*\<.*|.*\>.*|.*\'.*|.*\".*|.*\[.*|.*\].*|.*\{.*|.*\}.*)).)*$/i,

    minLength: 3,
    maxLength: 25,
    errStr: 'Reserved or invalid username (only letters and underscores)',
  },
  {
    _id: 'email',
    type: 'email',
    required: true,
    displayName: "email",
    re: EMAIL_REGEX,
    errStr: 'Invalid email',
  },
  pwd
]);
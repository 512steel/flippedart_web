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
    trim: true,

    /*
     NOTE: this is the username blacklist, since routes are configured with '/:username' off the root.
     Is there a cleaner way to configure this regex, pulling from a global USERNAME_BLACKLIST variable?
     FIXME: it seems to be easy to get around this regex by inputting an invalid name, then a valid name, then back to the invalid one.
     TODO: prevent including special characters in the username, including @, #, ?, &, ^, <, >, *, (, ), !, $, and possibly space
     FIXME: this blacklist is not case-insensitive.
    */
    re: /^((?!(\bsignin\b|\bjoin\b|\breset-password\b|\btest\b|\btests\b|\babout\b|\bmake\b|\bfeedback\b|\bbr\b|\bdiv\b|\bspan\b|\btable\b|\bsection\b|\bframeset\b|\biframe\b|\bhead\b|\bheader\b|\baddress\b|\barticle\b|\bcanvas\b|\bbutton\b|\bcode\b|\bembed\b|\bform\b|\binput\b|\btextarea\b|\bscript\b|\bnewsletter\b|\bpolicies\b|\bdonate\b|\bsupport\b|\bmessages\b|\badd\b|\bexchanges\b|\btop\b|\bexplore\b|\baccount\b|\bthanks\b|\badmin\b|\bstart\b|\bnotifications\b|\bhow\b|\bhowto\b|\brobots\b|\bsitemap\b|\bfavicon\b|\brobots\.txt\b|\bsitemap\.xml\b|\bfavicon\.png\b|.*\!.*|.*\@.*|.*\#.*|.*\$.*|.*\%.*|.*\^.*|.*\&.*|.*\*.*|.*\(.*|.*\).*|.*\~.*|.*\+.*|.*\=.*|.*\\.*|.*\/.*|.*\?.*|.*\..*|.*\,.*|.*\<.*|.*\>.*|.*\'.*|.*\".*|.*\[.*|.*\].*|.*\{.*|.*\}.*)).)*$/i,

    minLength: 3,
    maxLength: 25,
    errStr: 'Reserved or invalid username',
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
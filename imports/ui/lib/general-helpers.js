import { sanitizeHtml as sanitizeHtmlServer } from 'meteor/djedi:sanitize-html';
import { sanitizeHtml as sanitizeHtmlClient } from 'meteor/djedi:sanitize-html-client';

/*
 NOTE: the sanitizeHtml meteor package has a separate package for client and server.
    Allow them both to be called from here.

    Also note that I took matters into my own hands by trim()ming the input text.  Split the
    default functionality and the additional into separate functions if need be.
*/
export const sanitizeHtml = (text) => {
    if (Meteor.isClient) {
        //text = escape(text).replace(/(?:\r\n|\r|\n|%0A|%0a)/g, '<br />');
        return sanitizeHtmlClient(text.trim());
    }
    else if (Meteor.isServer) {
        text = unescape(escape(text.trim()).replace(/(?:\r\n|\r|\n|%0A|%0a)/g, '<br />'));
        return sanitizeHtmlServer(text.trim());
    }
};
export const sanitizeHtmlNoReturns = (text) => {
    if (Meteor.isClient) {
        return sanitizeHtmlClient(text.trim());
    }
    else if (Meteor.isServer) {
        return sanitizeHtmlServer(text.trim());
    }
};

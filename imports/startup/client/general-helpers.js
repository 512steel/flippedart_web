import { EMAIL_REGEX } from './../../ui/lib/globals.js';

/*** Blaze helpers ***/

Template.registerHelper('pluralize', function(n, thing) {
    if (n === 1) {
        return thing;
    } else {
        return thing + 's';
    }
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
Template.registerHelper('notEquals', function(a, b) {
    return a !== b;
});
Template.registerHelper('greaterThan', function(a, b) {
    return a > b;
});
Template.registerHelper('lessThan', function(a, b) {
    return a < b;
});
Template.registerHelper('and', function(a, b) {
    return a && b;
});
Template.registerHelper('or', function(a, b) {
    return a || b;
});
Template.registerHelper('times', function(n) {  //thanks SO: http://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js/11924998#11924998
    let accum = [];
    for(var i = 0; i < n; ++i)
        accum.push(i);
    return accum;
});
Template.registerHelper('timesOneIndexed', function(n) {  //thanks SO: http://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js/11924998#11924998
    let accum = [];
    for(var i = 1; i < n+1; ++i)
        accum.push(i);
    return accum;
});
Template.registerHelper('increment', function(n) {
    return n+1;
});

Template.registerHelper('truthy', function(a) {
    if (typeof a === "string") {
        a = a.toLowerCase().trim();
        if (a != "" && a != "no" && a != "0" && a != "false") {
            return true;
        }
    }
    else if (a && a != 0) {
        return true;
    }
    return false;
});
Template.registerHelper('falsy', function(a) {
    if (typeof a === "string") {
        a = a.toLowerCase().trim();
        if (a == "no" || a == "none" || a == "false" || a == "0" || a == "") {
            return true;
        }
    }
    else if (a || a == 0) {
        return true;
    }
    return false;
});

Template.registerHelper('dateTimeAgo', function (date) {
    return moment(date).from(moment());
});
Template.registerHelper('timeToMinutes', function(date) {
    return moment(date).format("MMM Do YYYY, h:mm a");
});

Template.registerHelper('photoFullLink', function(link) {
    //Returns the proper image link depending on if it's a local or Cloudinary upload
    if (link.slice(0,7) == "http://" || link.slice(0,8) == "https://") {
        return link;
    }
    else {
        //TODO: more nuanced checks here as the sources begin coming from many different places
        return Cloudinary._helpers.url(link, {});
    }
});

Template.registerHelper('cursorNotEmpty', function(cursor) {
    if (cursor) {
        if (cursor.fetch() && cursor.fetch().length > 0) {
            return true;
        }
    }
});

Template.registerHelper('reversed', function(cursor) {
    if (cursor) {
        return cursor.fetch().reverse();
    }
});

Template.registerHelper('limitLength', function(str, len) {
    check(str, String);
    check(len, Number);

    if (str.length > len) {
        str = str.slice(0,len) + '...';
    }
    return str;
});

Template.registerHelper('toLowerCase', function(str) {
    check(str, String);
    return str.toLowerCase();
});

Template.registerHelper('matchesEmailRegex', function(str) {
    check(str, String);
    return str.match(EMAIL_REGEX);
});

Template.registerHelper('trim', function(str) {
    if (str) {
        check(str, String);
        return str.trim();
    }
    else return false;
});

Template.registerHelper('loadingIcon', function() {
    return '<svg version="1.1" id="Layer_1" class="spinner xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
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
});


/***  copy helpers  ***/
firstMessageCopy = "test copy";

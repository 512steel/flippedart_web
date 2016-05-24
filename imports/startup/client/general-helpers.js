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

Template.registerHelper('truthy', function(a) {
    if (typeof a === "string") {
        a = a.toLowerCase();
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
        a = a.toLowerCase();
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


/***  copy helpers  ***/
firstMessageCopy = "test copy";

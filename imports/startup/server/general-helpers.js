// check that the userId specified owns the documents
ownsDocument = function(userId, doc) {
    return doc && doc.userId === userId;
};
isItemOwner = function(userId, item) {
    return item && item.ownerId === userId;
};

//thanks, SO!  http://stackoverflow.com/questions/23187013/is-there-a-better-way-to-sanitize-input-with-javascript
sanitizeString = function(str) {
    str = str.replace(/[^a-z0-9áéíóúñüâäàçåêëèïîìÄÅÉæÆôöòûùÿÖÜÑËÈÊÍÎÏÓÔÒõÕÚÛÙ\'\"\*\&\^\$\@\#\!\?\(\)\[\]\+\=\:\; \.\\/,_-]/gim,"");
    return str.trim().substr(0, 5000);
};
sanitizeStringLong = function(str) {
    str = str.replace(/[^a-z0-9áéíóúñüâäàçåêëèïîìÄÅÉæÆôöòûùÿÖÜÑËÈÊÍÎÏÓÔÒõÕÚÛÙ\'\"\*\&\^\$\@\#\!\?\(\)\[\]\+\=\:\; \.\\/,_-]/gim,"");
    return str.trim().substr(0, 25000);
};

sanitizeLink = function(str) {
    return encodeURI(str.trim());
};
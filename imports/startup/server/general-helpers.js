// check that the userId specified owns the documents
ownsDocument = function(userId, doc) {
    return doc && doc.userId === userId;
};
isItemOwner = function(userId, item) {
    return item && item.ownerId === userId;
};

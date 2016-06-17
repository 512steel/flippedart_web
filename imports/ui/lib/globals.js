//export const GLOBAL_VAR = "My global var";

/*
 Points system:  The numbers here are rudimentary but will work getting started:
    UserPosts:
        2 points per upvote
        1 point per comment
    ExchangeItems:
        1 point every time it’s requested
        2 points for every time it’s part of a “completed” transaction
    UserAttributes:
        1 point for every comment made
        2 points for every post made
        3 points for every exchangeItem added
        4 points for every exchangeItem given away
*/
export const POINTS_SYSTEM = {
    'UserPosts': {
        'upvote': 2,
        'comment': 1,
    },
    'UserAttributes': {
        'comment': 1,
        'post': 2,
        'exchangeItemAdd': 3,
        'exchangeItemGive': 4,
    },
    'ExchangeItems': {
        'requested': 1,
        'completed': 2,
    },
};


export const UPLOAD_LIMITS = {
    'projects': 5,
    'images': 6,
};


export const PROJECT_TAGS = [
    'Painting',
    'Drawing',
    'Sculpture',
    'Chalkboard',
    'Book',
    'Plant',
    'Frame',
    'Stand',
    'Other',
];


export const FLAG_THRESHOLD = {
    'post': 2,
    'comment': 2,
};
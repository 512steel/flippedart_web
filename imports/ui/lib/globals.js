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


export const HEAD_DEFAULTS = {
    'title': "Flipped Art - Maker community and mobile art studio",
    'title_short': "Flipped Art",
    'description': "Make things and share them for free. Based in Des Moines. Wannabes are welcome here.",
    'image': "http://res.cloudinary.com/dwgim6or9/image/upload/v1467765602/flippedart_og_image_3_qtkwew.png",
};


export const HEAD_DEFAULT_TAGS = {

};


export const EMAIL_WORD_BANK = [
    'gmail',
    'mail',
    'aol',
    'live',
    'yahoo',
    'hotmail',
    'outlook',
    'inbox',
];

export const TLD_WORD_BANK = [
    'com',
    'org',
    'co',
    'net',
    'info',
    'me',
    'biz',
    'xyz',
    'io'
];


//TODO: make this regex more robust
export const EMAIL_REGEX = /.+@(.+){2,}\.(.+){2,}/;


export const BLANK_PROFILE_PHOTO_LINK = "https://res.cloudinary.com/dwgim6or9/image/upload/v1466305702/anonymous-user_1_dlslwr.png";


export const TRANSACTION_STATES = {
    'requested': 'requested',
    'approved': 'approved',
    'completed': 'completed,',
    'declined': 'declined',
    'cancelled': 'cancelled'
};


export const COMMENT_EVENT_TYPES = {
    'single': "single",
    'multiple': "multiple"
};


export const RECENT_ACTIVITY_TYPES = {
    'like': 'like',
    'comment': 'comment',
    'newPost': 'newPost',
    'newProject': 'newProject',
    'newUser': 'newUser',
    'transactionComplete': 'transactionComplete'
};

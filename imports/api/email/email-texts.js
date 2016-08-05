export const WELCOME_EMAIL_TEXT = (username) => {
    const emailText =
        "<html>" +
        "<p>We heard you like making things. You'll fit right in.</p>" +
        "<p>Flipped Art is 100% local to Des Moines, and we're excited to see what you have to share. " +
        "Be sure to browse the <a href='https://www.flippedart.org'>website</a> to " +
        "see what other people are up to, exchange ideas and work with them, and to learn more about " +
        "what we do.  Then fill out <a href='https://www.flippedart.org/" + username + "'>your profile</a> " +
        "and let people know what you're working on.</p>" +
        "<p>See you around!</p>" +
        "</html>";

    return emailText;
};

export const FEEDBACK_EMAIL_TEXT = (senderName, senderEmail, signedInUser, text) => {
    const emailText =
        "<html>" +
        "<p>" + senderName + " (" + senderEmail + ") said:</p>" +
        "<p>" + text + "</p>" +
        "<p>" + signedInUser + "</p>" +
        "</html>";

    return emailText;
};


//TODO: include the snippet of text from the post and comment themselves in a styled section of the email.
export const SOMEONE_HAS_COMMENTED_ON_YOUR_POST_TEXT = (commenteeName, commenterName, userPostId, userPostText) => {
    const emailText = "<html>" +
        "<p>" + "Hi " + commenteeName + "!</p>" +
        "<p>" + "<a href='https://www.flippedart.org/" + commenterName + "'>" + commenterName + "</a> has commented " +
        "on <a href='https://www.flippedart.org/" + commenteeName + "/posts/" + userPostId + "'>your post</a>.  " +
        "Go to your post to contintue the discussion." + "</p>" +
        "</html>";

    return emailText;
};

export const MORE_PEOPLE_HAVE_COMMENTED_ON_YOUR_POST_TEXT = (commenteeName, userPostId, userPostText) => {
    const emailText = "<html>" +
        "<p>" + "It looks like your post is getting popular!  <a href='https://www.flippedart.org/" + commenteeName + "/posts/" + userPostId + "'>View it</a> on the Flipped Art website to hop in the discussion." + "</p>" +
        "</html>";

    return emailText;
};

export const YOUR_PROJECT_HAS_BEEN_REQUESTED_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +
        "<p>" + "Hi " + requesteeName + ",</p>" +
        "<p>" + requesterName + ", a fellow Flipped Art user, has put in a request for a project of yours. " +
        "Have a look at <a href='https://www.flippedart.org/" + requesteeName + "/exchanges'>your exchanges</a> to " +
        "see what " + requesterName + " is interested in, and to start a conversation with them." + "</p>" +
        "<p>" + "Click the 'Approve' button on Flipped Art's website to begin the process. " +
        "Thanks for being an awesome community member!" + "</p>" +
        "</html>";

    return emailText;
};

export const YOU_HAVE_REQUESTED_A_PROJECT_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +
        "<p>" + "Hi " + requesterName + ",</p>" +
        "<p>" + "It looks like you've requested a project from " + requesteeName + ". " +
        "While you're waiting for " + requesteeName + " to approve your request, keep in contact " +
        "by sending them a <a href='https://www.flippedart.org/messages/" + requesteeName + "'>message</a>. " + "</p>" +
        "<p>" + "<br>Thanks!" + "</p>" +
        "</html>";

    return emailText;
};

export const YOUR_PROJECT_REQUEST_HAS_BEEN_APPROVED_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +
        "<p>" + "Howdy " + requesterName + ",</p>" +
        "<p>" + requesteeName + " has approved your project request! Now it's important to . " +
        "send " + requesteeName + " a <a href='https://www.flippedart.org/messages/" + requesteeName + "'>message</a> " +
        "in order to discuss the logistics of getting their project into your hands. " + "</p>" +
        "<p>" + "Good luck!" + "</p>" +
        "</html>";

    return emailText;
};

export const YOU_HAVE_APPROVED_A_PROJECT_TRANSACTION_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +
        "<p>" + "Howdy " + requesteeName + ",</p>" +
        "<p>" + "You have approved " + requesterName + "'s request.  Now it's important to " +
        "send them a <a href='https://www.flippedart.org/messages/" + requesterName + "'>message</a> " +
        "in order to discuss the logistics of getting your project into their hands. " + "</p>" +
        "<p>" + "Good luck!" + "</p>" +
        "</html>";

    return emailText;
};

export const YOUR_PROJECT_REQUEST_HAS_BEEN_COMPLETED_TEXT = (requesteeName, requesterName) => {
    const emailText = "";

    return emailText;
};

export const YOUR_PROJECT_REQUEST_HAS_BEEN_DECLINED_TEXT = (requesteeName, requesterName) => {
    const emailText = "";

    return emailText;
};

export const SOMEONE_HAS_CANCELLED_YOUR_PROJECT_REQUEST_TEXT = (requesteeName, requesterName) => {
    const emailText = "";

    return emailText;
};
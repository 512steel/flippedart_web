export const WELCOME_EMAIL_TEXT = (username) => {
    const emailText =
        "<html>" +

        "<p>" +
        "We heard you like making things. You'll fit right in. " +
        "</p>" +

        "<p>" +
        "Flipped Art is 100% local to Des Moines, and we're excited to see " +
        "what you have to share. Be sure to browse the " +
        "<a href='https://www.flippedart.org'>website</a> to see what other " +
        "people are up to, exchange ideas, and to learn " +
        "more about what we do.  Then fill out " +
        "<a href='https://www.flippedart.org/" + username + "'>your profile</a> " +
        "and let people know what you're working on." +
        "</p>" +

        "<p>" +
        "See you around!" +
        "</p>" +

        "</html>";

    return emailText;
};

export const FEEDBACK_EMAIL_TEXT = (senderName, senderEmail, signedInUser, text) => {
    const emailText = "<html>" +

        "<p>" +
        senderName + " (" + senderEmail + ") said: " +
        "</p>" +

        "<p>" +
        text +
        "</p>" +

        "<p>" +
        signedInUser +
        "</p>" +

        "</html>";

    return emailText;
};


//TODO: include the snippet of text from the post and comment themselves in a styled section of the email.
export const SOMEONE_HAS_COMMENTED_ON_YOUR_POST_TEXT = (commenteeName, commenterName, userPostId, userPostText) => {
    const emailText = "<html>" +
        "<p>" +
        "Hi " + commenteeName + "! " +
        "</p>" +

        "<p>" +
        "<a href='https://www.flippedart.org/" + commenterName + "'>" + commenterName + "</a> " +
        "has commented on " +
        "<a href='https://www.flippedart.org/" + commenteeName + "/posts/" + userPostId + "'>your post</a>.  " +
        "Go to your post to contintue the discussion." +
        "</p>" +

        "</html>";

    return emailText;
};

export const MORE_PEOPLE_HAVE_COMMENTED_ON_YOUR_POST_TEXT = (commenteeName, userPostId, userPostText) => {
    const emailText = "<html>" +

        "<p>" +
        "It looks like your post is getting popular!  " +
        "<a href='https://www.flippedart.org/" + commenteeName + "/posts/" + userPostId + "'>View it</a> " +
        "on the Flipped Art website to hop in the discussion." +
        "</p>" +

        "</html>";

    return emailText;
};


//FIXME: include the link to the project ID
export const YOUR_PROJECT_HAS_BEEN_REQUESTED_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +

        "<p>" +
        "Hi " + requesteeName + ", " +
        "</p>" +

        "<p>" +
        requesterName + ", a fellow Flipped Art user, has put in a request " +
        "for a project of yours. Have a look at " +
        "<a href='https://www.flippedart.org/" + requesteeName + "/exchanges'>your exchanges</a> " +
        "to see what " + requesterName + " is interested in, and to start " +
        "a conversation with them." + "</p>" +

        "<p>" +
        "Click the 'Approve' button on Flipped Art's " +
        "<a href='https://www.flippedart.org/" + requesteeName + "/exchanges'>website</a> to begin the process. " +
        "Thanks for being an awesome community member!" +
        "</p>" +
        "</html>";

    return emailText;
};

export const YOU_HAVE_REQUESTED_A_PROJECT_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +

        "<p>" +
        "Hi " + requesterName + ", " +
        "</p>" +

        "<p>" +
        "It looks like you have requested a project from " + requesteeName + ". " +
        "While you're waiting for " + requesteeName + " to approve your request, keep in contact " +
        "by sending them a <a href='https://www.flippedart.org/messages/" + requesteeName + "'>message</a>. " +
        "</p>" +

        "<p>" +
        "<br>Thanks!" +
        "</p>" +

        "</html>";

    return emailText;
};

export const YOUR_PROJECT_REQUEST_HAS_BEEN_APPROVED_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +

        "<p>" +
        "Howdy " + requesterName + ", " +
        "</p>" +

        "<p>" +
        requesteeName +
        " has approved your project request! Now it's important to send " +
        requesteeName +
        " a <a href='https://www.flippedart.org/messages/" + requesteeName + "'>message</a> " +
        "in order to discuss the logistics of getting their project to you. " +
        "</p>" +

        "<p>" +
        "Good luck!" +
        "</p>" +
        "</html>";

    return emailText;
};

export const YOU_HAVE_APPROVED_A_PROJECT_TRANSACTION_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +

        "<p>" +
        "Howdy " + requesteeName + ", " +
        "</p>" +

        "<p>" +
        "You have approved " + requesterName + "'s request.  Now it's important to " +
        "send them a <a href='https://www.flippedart.org/messages/" + requesterName + "'>message</a> " +
        "in order to discuss the logistics of getting your project into their hands. Good luck! " +
        "</p>" +

        "<p>" +
        "If you have any questions about the exchange process, " +
        "<a href='https://www.flippedart.org/howto'>read about how it works</a> or reply " +
        "to this email, and one of us will get back to you ASAP." +
        "</p>" +

        "</html>";

    return emailText;
};

export const YOUR_PROJECT_REQUEST_HAS_BEEN_COMPLETED_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +

        "<p>" +
        "Woohoo! " +
        "</p>" +

        "<p>" +
        requesteeName +
        " has completed your project request.  You should now have their " +
        "project in your hands, and you may use it to display or build new " +
        "things with. " +
        "</p>" +

        "<p>" +
        "If you have any questions about the exchange process, or if you " +
        "encountered any problems, reply to this email or " +
        "<a href='https://www.flippedart.org/howto'>read more about how it works</a>." +
        "</p>" +

        "</html>";

    return emailText;
};

export const YOU_HAVE_COMPLETED_A_PROJECT_REQUEST_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +

        "<p>" +
        "Woohoo! " +
        "</p>" +

        "<p>" +
        "You have completed " + requesterName + "'s request.  " +
        "To be clear, " + requesterName + " should have physical possession " +
        "of your project at this point, as they have control of its online presence " +
        "on <a href='https://www.flippedart.org'>Flipped Art</a>.  If this is not the case, " +
        "send " + requesterName + " a <a href='https://www.flippedart.org/messages/" + requesterName + "'>message</a> " +
        "to work out the details. " +
        "</p>" +

        "<p>" +
        "Be sure to make a post congratulating " + requesterName + "!  " +
        "If you have any questions about the exchange process, or if you " +
        "encountered any problems, reply to this email or " +
        "<a href='https://www.flippedart.org/howto'>read more about how it works</a>." +
        "</p>" +

        "</html>";

    return emailText;
};

export const YOUR_PROJECT_REQUEST_HAS_BEEN_DECLINED_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +

        "<p>" +
        "Hi " + requesterName + ", " +
        "</p>" +

        "<p>" +
        "We're sorry to inform you that " + requesteeName + " has decided to decline " +
        "your project request. Feel free to send " +
        requesteeName + " a <a href='https://www.flippedart.org/messages/" + requesteeName + "'>message</a> " +
        "to find out why this was the case.  We hope you stick around and can " +
        "find more ways to add to the Flipped Art community!" +
        "</p>" +

        "</html>";

    return emailText;
};

export const YOU_HAVE_DECLINED_A_PROJECT_REQUEST_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +

        "<p>" +
        "Hi " + requesteeName + ", " +
        "</p>" +

        "<p>" +
        "This email is confirming that you have declined " + requesterName + "'s " +
        "request of one of your projects.  " +
        "Please send " + requesterName + " a " +
        "<a href='https://www.flippedart.org/messages/" + requesterName + "'>message</a> " +
        "to let them know why this was the case.  We hope you can find other ways to add " +

        "<p>" +
        "If you have any questions about the exchange process, or if you " +
        "encountered any problems, reply to this email or " +
        "<a href='https://www.flippedart.org/howto'>read more about how it works</a>." +
        "</p>" +

        "</html>";

    return emailText;
};

export const YOU_HAVE_CANCELLED_A_PROJECT_REQUEST_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +

        "<p>" +
        "Hi " + requesterName + ", " +
        "</p>" +

        "<p>" +
        "This email is confirming that you have cancelled your request " +
        "of " + requesteeName + "'s project.  " +
        "Please send " + requesteeName + " a " +
        "<a href='https://www.flippedart.org/messages/" + requesteeName + "'>message</a> " +
        "to let them know why this was the case.  We hope you can find other ways to add " +
        "to the Flipped Art community!" +

        "<p>" +
        "If you have any questions about the exchange process, or if you " +
        "encountered any problems, reply to this email or " +
        "<a href='https://www.flippedart.org/howto'>read more about how it works</a>." +
        "</p>" +

        "</html>";

    return emailText;
};

export const SOMEONE_HAS_CANCELLED_YOUR_PROJECT_REQUEST_TEXT = (requesteeName, requesterName) => {
    const emailText = "<html>" +

        "<p>" +
        "Hi " + requesteeName + ", " +
        "</p>" +

        "<p>" +
        "We're sorry to inform you that " + requesterName + " has decided to cancel " +
        "their request of one of your projects.  Feel free to send " +
        requesterName + " a <a href='https://www.flippedart.org/messages/" + requesterName + "'>message</a> " +
        "to find out why this was the case.  We hope you keep posting and adding more of your creative projects " +
        "for the Flipped Art community!" +
        "</p>" +

        "</html>";

    return emailText;
};

//TODO: add to this email text as the object grows
export const BOOKING_REQUEST_EMAIL_TEXT = (bookingRequestObject, signedInUser) => {
    const emailText = "<html>" +

        "<p>" +
        "A booking request has been submitted: " +
        "</p>" +

        "<p>" +
        "Event type: <strong>" + bookingRequestObject.eventType + "</strong> <br>" +
        "Event name: <strong>" + bookingRequestObject.eventName + "</strong> <br>" +
        "Age range: <strong>" + bookingRequestObject.ageRange + "</strong> <br>" +
        "Contact email: <strong>" + bookingRequestObject.contactEmail + "</strong> <br>" +
        "Additional Details: <strong>" + bookingRequestObject.additionalDetails + "</strong> <br>" +
        "</p>" +

        "<p>" +
        signedInUser +
        "</p>" +

        "</html>";

    return emailText;
};

export const BOOKING_REQUEST_CONFIRMATION_TEXT = (bookingRequestObject) => {
    const emailText = "<html>" +

        "<p>" +
        "Hello there! " +
        "</p>" +

        "<p>" +
        "Thanks for putting in your booking request for the Tiny Studio.  We have a " +
        "record of it, and are making sure that we can fit your schedule.  We'll get back " +
        "to you shortly, but in the meantime feel free to get in touch by replying to this email." +
        "</p>" +

        "<p>" +
        "Thanks! " +
        "</p>" +

        "</html>";

    return emailText;
};

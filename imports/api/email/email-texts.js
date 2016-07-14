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


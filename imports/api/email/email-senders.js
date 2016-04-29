if (Meteor.isServer) {
    Meteor.methods({
        //TODO: use Mailgun API here instead
        sendFeedbackEmail: function(message) {
            var user = "not signed in";
            if (Meteor.user()) {
                user = Meteor.user().username.toString();
            }
            //check(Meteor.userId(), String);
            check(message, {
                senderName: String,
                senderEmail: String,
                body: String
            });

            message.senderName = sanitizeString(message.senderName);
            message.senderEmail = sanitizeString(message.senderEmail);
            message.body = sanitizeStringLong(message.body);

            var emailText =  "senderName: " + message.senderName +
                " | senderEmail: " + message.senderEmail +
                " | message body: " + message.body +
                " | sent from " + user;

            Email.send({
                to: "flippedartexchange@gmail.com",
                from: "feedback@smtp.mailgun.org",
                subject: "[Site feedback]",
                text: emailText
            });
        }
    })
}
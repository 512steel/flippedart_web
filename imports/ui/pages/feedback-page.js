import './feedback-page.html';

Template.feedback_page.events({
    'submit form.feedback-form': function(e) {
        e.preventDefault();

        var yourName = $(e.target).find('[name=your-name]').val();
        var yourEmail = $(e.target).find('[name=your-email]').val();
        var body = $(e.target).find('[name=body]').val();
        var emailMessage = {
            senderName: yourName,
            senderEmail: yourEmail,
            body: body
        };

        if (!emailMessage.body) {
            throwError("Please enter some text in the message body");
        }
        else {
            Meteor.call('sendFeedbackEmail', emailMessage, function(error, result) {
                if (error) {
                    throwError(error.reason);
                }
                else {
                    Router.go('feedbackThanks');
                }
            })
        }
    }
});
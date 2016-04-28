//TODO: rename this collection to "TemporaryAlerts", or something, to avoid confusion with the synced collection "Notifications"

/* Temporary, client-side alert-style messages */
TemporaryNotifications = new Mongo.Collection(null);

export const throwError = (message) => {
    TemporaryNotifications.insert({message: message, type: 'danger'});
};

export const throwWarning = (message) => {
    TemporaryNotifications.insert({message: message, type: 'warning'});
};

export const throwSuccess = (message) => {
    TemporaryNotifications.insert({message: message, type: 'success'});
};
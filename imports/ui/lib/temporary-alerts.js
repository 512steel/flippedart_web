//TODO: rename this collection to "TemporaryAlerts", or something, to avoid confusion with the synced collection "Notifications"

/* Temporary, client-side alert-style messages */
export const TemporaryNotifications = new Mongo.Collection(null);

export const throwError = (message) => {
    TemporaryNotifications.insert({message: message, type: 'error'});
};

export const throwWarning = (message) => {
    TemporaryNotifications.insert({message: message, type: 'warning'});
};

export const throwSuccess = (message) => {
    TemporaryNotifications.insert({message: message, type: 'success'});
};
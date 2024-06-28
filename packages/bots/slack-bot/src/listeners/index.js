const eventsListener = require('./events');

module.exports.registerListeners = (app) => {
  eventsListener.register(app);
};

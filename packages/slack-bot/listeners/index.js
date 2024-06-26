const shortcutsListener = require('./shortcuts');
const viewsListener = require('./views');
const eventsListener = require('./events');
const actionsListener = require('./actions');

module.exports.registerListeners = (app) => {
  viewsListener.register(app);
  eventsListener.register(app);
  actionsListener.register(app);
};

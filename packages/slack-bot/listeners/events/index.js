const { appHomeOpenedCallback } = require('./app_home_opened');
const { appMentionCallback } = require('./app_mention_callback');

module.exports.register = (app) => {
  app.event('app_mention', appMentionCallback);
};

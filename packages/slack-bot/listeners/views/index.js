const { newTaskModalCallback } = require('./new-task-modal');

module.exports.register = (app) => {
  app.view('new-task-modal', newTaskModalCallback);
};

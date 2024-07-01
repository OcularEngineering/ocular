const { Modal, Blocks } = require('slack-block-builder');

module.exports = (taskTitle) => Modal({ title: 'Task created', callbackId: 'task-created-modal' })
  .blocks(
    Blocks.Section({
      text: `${taskTitle} created`,
    }),
  ).buildToJSON();

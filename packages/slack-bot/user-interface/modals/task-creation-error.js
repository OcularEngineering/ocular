const { Modal, Blocks } = require('slack-block-builder');

module.exports = (taskTitle) => Modal({ title: 'Something went wrong', callbackId: 'task-creation-error-modal' })
  .blocks(
    Blocks.Section({
      text: `We couldn't create ${taskTitle}. Sorry!`,
    }),
  ).buildToJSON();

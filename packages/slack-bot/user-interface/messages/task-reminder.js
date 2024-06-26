const { Message, Section, Button } = require('slack-block-builder');

module.exports = (postAt, channel, taskTitle, dueDate, taskID) => Message({
  channel,
  postAt,
  text: `You asked me to remind you about "${taskTitle}".`,
}).blocks(
  Section({ text: `:wave: You asked me to remind you about "*${taskTitle}*".` })
    .accessory(Button({ text: 'Mark as done', value: `task-${taskID}`, actionId: 'button-mark-as-done' })),
  Section().fields(['*Task title*', '*Due date*', taskTitle, dueDate]),
).buildToObject();

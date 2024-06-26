const { taskReminder } = require('../index');

test('Returns payload for the task reminder API call', () => {
  const taskTitle = 'Test Task';
  const channel = 'C1234567';
  const postAt = 123456789;
  const dueDate = 'Some date';
  const taskID = 1;
  const expected = {
    channel,
    post_at: postAt,
    text: `You asked me to remind you about "${taskTitle}".`,
    blocks: [
      {
        text: {
          type: 'mrkdwn',
          text: `:wave: You asked me to remind you about "*${taskTitle}*".`,
        },
        accessory: {
          text: {
            type: 'plain_text',
            text: 'Mark as done',
          },
          value: `task-${taskID}`,
          action_id: 'button-mark-as-done',
          type: 'button',
        },
        type: 'section',
      },
      {
        fields: [
          { type: 'mrkdwn', text: '*Task title*' },
          { type: 'mrkdwn', text: '*Due date*' },
          { type: 'mrkdwn', text: taskTitle },
          { type: 'mrkdwn', text: dueDate },
        ],
        type: 'section',
      },
    ],
  };
  expect(taskReminder(postAt, channel, taskTitle, dueDate, taskID))
    .toEqual(expected);
});

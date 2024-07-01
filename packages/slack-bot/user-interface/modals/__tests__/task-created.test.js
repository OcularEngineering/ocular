const { taskCreated } = require('../index');

test('Returns blocks for the task created modal', () => {
  const expected = {
    title: {
      type: 'plain_text',
      text: 'Task created',
    },
    callback_id: 'task-created-modal',
    blocks: [
      {
        text: {
          type: 'mrkdwn',
          text: 'Task Title created',
        },
        type: 'section',
      },
    ],
    type: 'modal',
  };
  expect(taskCreated('Task Title')).toBe(JSON.stringify(expected));
});

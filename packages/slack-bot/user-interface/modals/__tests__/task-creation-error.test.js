const { taskCreationError } = require('../index');

test('Returns blocks for the task creation error modal', () => {
  const expected = {
    title: {
      type: 'plain_text',
      text: 'Something went wrong',
    },
    callback_id: 'task-creation-error-modal',
    blocks: [
      {
        text: {
          type: 'mrkdwn',
          text: "We couldn't create Task Title. Sorry!",
        },
        type: 'section',
      },
    ],
    type: 'modal',
  };
  expect(taskCreationError('Task Title')).toBe(JSON.stringify(expected));
});

const { openTasksView } = require('../index');

test('Returns blocks for the open task list home view if no tasks available', () => {
  const expected = {
    callback_id: 'tasks-home',
    private_metadata: 'open',
    blocks: [
      {
        block_id: 'task-creation-actions',
        elements: [
          {
            text: {
              type: 'plain_text',
              text: 'Open tasks',
            },
            value: 'app-home-nav-open',
            action_id: 'app-home-nav-open',
            style: 'primary',
            type: 'button',
          },
          {
            text: {
              type: 'plain_text',
              text: 'Completed tasks',
            },
            value: 'app-home-nav-completed',
            action_id: 'app-home-nav-completed',
            type: 'button',
          },
          {
            text: {
              type: 'plain_text',
              text: 'Create a task',
            },
            value: 'app-home-nav-create-a-task',
            action_id: 'app-home-nav-create-a-task',
            type: 'button',
          },
        ],
        type: 'actions',
      },
      {
        text: {
          type: 'plain_text',
          text: 'No open tasks',
        },
        type: 'header',
      },
      {
        type: 'divider',
      },
      {
        text: {
          type: 'mrkdwn',
          text: "Looks like you've got nothing to do.",
        },
        type: 'section',
      },
    ],
    type: 'home',
  };
  expect(openTasksView([])).toEqual(JSON.stringify(expected));
});

test.todo('Returns blocks for the open task list home view if open tasks available');

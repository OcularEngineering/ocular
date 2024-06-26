const {
  modalViewPayloadSelectedDateNoTime,
  modalViewPayloadSelectedDateFromPast,
  modalViewPayloadSelectedDateAndTime,
  modalViewPayloadDueDateTooFarInFuture,
  modelViewPayloadTaskAssignedToDifferentUser,
} = require('./__fixtures__/view-fixtures');

const {
  testView,
  testViewAckError,
  testViewError,
} = require('./__utils__/view-test-util-funcs');

const { newTaskModalCallback } = require('../new-task-modal');

describe('New task modal view callback function test ', () => {
  it('returns an ack() with an error if date is selected but time is not selected', async () => {
    await testViewAckError(
      modalViewPayloadSelectedDateNoTime,
      newTaskModalCallback,
      {
        response_action: 'errors',
        errors: {
          taskDueTime: expect.stringContaining('set a time'),
        },
      },
    );
  });
  it('returns an ack() with an error if a due date/time in the past was selected', async () => {
    await testViewAckError(
      modalViewPayloadSelectedDateFromPast,
      newTaskModalCallback,
      {
        response_action: 'errors',
        errors: {
          taskDueTime: expect.stringContaining('future'),
          taskDueDate: expect.stringContaining('future'),
        },
      },
    );
  });

  // TODO: test for the client.views.publish() method as well since reloadAppHome() is called in the callback

  it('schedules a message to remind the user of an upcoming task if the due date is < 120 days in the future', async () => {
    await testView(
      modalViewPayloadSelectedDateAndTime,
      newTaskModalCallback,
      global.chatScheduleMessageMockFunc,
      {
        channel: modalViewPayloadSelectedDateAndTime.user.id,
        post_at: expect.any(Number), // TODO: possibly beef up this test to check for a valid time
        text: expect.stringContaining(
          modalViewPayloadSelectedDateAndTime.view.state.values.taskTitle
            .taskTitle.value,
        ),
      },
    );
  });

  it('posts a message to the user if the due date is > 120 days in the future', async () => {
    await testView(
      modalViewPayloadDueDateTooFarInFuture,
      newTaskModalCallback,
      global.chatPostMessageMockFunc,
      {
        text: expect.stringContaining('more than 120 days from'),
        channel: modalViewPayloadSelectedDateAndTime.user.id,
      },
    );
  });

  it('sends a message to the user who the task was assigned to if the assignee != task creator', async () => {
    const selectedUser =
      modelViewPayloadTaskAssignedToDifferentUser.view.state.values
        .taskAssignUser.taskAssignUser.selected_user;
    await testView(
      modelViewPayloadTaskAssignedToDifferentUser,
      newTaskModalCallback,
      global.chatPostMessageMockFunc,
      {
        text: expect.stringContaining(
          `<@${modalViewPayloadSelectedDateAndTime.user.id}> assigned you`,
        ),
        channel: selectedUser,
      },
    );
  });

  it('Logs an error when the the new view fails to be published', async () => {
    await testViewError(
      modalViewPayloadDueDateTooFarInFuture,
      newTaskModalCallback,
      global.viewPublishMockFunc,
    );
  });
});

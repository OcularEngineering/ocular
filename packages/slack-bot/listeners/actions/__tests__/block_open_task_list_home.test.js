const {
  appHomeBlockChecklistSelectionActionPayload,
} = require('./__fixtures__/action-fixtures');

const {
  testAction,
  testActionError,
} = require('./__utils__/action-test-util-funcs');
const {
  openTaskCheckboxClickedCallback,
} = require('../block_open_task_list_home');

describe('App home nav completed action callback function test ', () => {
  it('Acknowledges the action and reloads the app home', async () => {
    await testAction(
      appHomeBlockChecklistSelectionActionPayload,
      openTaskCheckboxClickedCallback,
    );
  });
  it('Logs an error when the the new view fails to be published', async () => {
    await testActionError(
      appHomeBlockChecklistSelectionActionPayload,
      openTaskCheckboxClickedCallback,
    );
  });
});

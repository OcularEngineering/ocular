const {
  appHomeBlockChecklistSelectionActionPayload,
} = require('./__fixtures__/action-fixtures');

const {
  testAction,
  testActionError,
} = require('./__utils__/action-test-util-funcs');
const {
  appHomeNavCompletedCallback,
} = require('../block_app-home-nav-completed');

describe('App home nav completed action callback function test ', () => {
  it('Acknowledges the action and reloads the app home', async () => {
    await testAction(
      appHomeBlockChecklistSelectionActionPayload,
      appHomeNavCompletedCallback,
    );
  });
  it('Logs an error when the the new view fails to be published', async () => {
    await testActionError(
      appHomeBlockChecklistSelectionActionPayload,
      appHomeNavCompletedCallback,
    );
  });
});

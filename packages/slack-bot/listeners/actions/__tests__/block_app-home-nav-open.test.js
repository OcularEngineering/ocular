const {
  appHomeBlockChecklistSelectionActionPayload,
} = require('./__fixtures__/action-fixtures');

const {
  testAction,
  testActionError,
} = require('./__utils__/action-test-util-funcs');
const { appHomeNavOpenCallback } = require('../block_app-home-nav-open');

describe('App home nav open action callback function test ', () => {
  it('Acknowledges the action and reloads the app home', async () => {
    await testAction(
      appHomeBlockChecklistSelectionActionPayload,
      appHomeNavOpenCallback,
    );
  });
  it('Logs an error when the the new view fails to be published', async () => {
    await testActionError(
      appHomeBlockChecklistSelectionActionPayload,
      appHomeNavOpenCallback,
    );
  });
});

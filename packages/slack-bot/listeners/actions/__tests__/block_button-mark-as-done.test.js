const { messageBlockActionPayload } = require('./__fixtures__/action-fixtures');

const {
  testAction,
  testActionError,
} = require('./__utils__/action-test-util-funcs');
const { buttonMarkAsDoneCallback } = require('../block_button-mark-as-done');

describe('App home nav open action callback function test ', () => {
  it('Acknowledges the action and reloads the app home', async () => {
    await testAction(
      messageBlockActionPayload,
      buttonMarkAsDoneCallback,
      global.chatUpdateMockFunc,
      {
        channel: messageBlockActionPayload.container.channel_id,
        ts: messageBlockActionPayload.container.message_ts,
        text: `~${messageBlockActionPayload.message.text}~`,
        blocks: [], // Remove all the existing blocks, just leaving the text above.
      },
    );
  });
  it('Logs an error when the the new view fails to be published', async () => {
    // TODO: Remove the arguments for the methods on the fail condition, we dont need them when testing for failure
    await testActionError(
      messageBlockActionPayload,
      buttonMarkAsDoneCallback,
      global.chatUpdateMockFunc,
      {
        channel: messageBlockActionPayload.container.channel_id,
        ts: messageBlockActionPayload.container.message_ts,
        text: `~${messageBlockActionPayload.message.text}~`,
        blocks: [], // Remove all the existing blocks, just leaving the text above.
      },
    );
  });
});

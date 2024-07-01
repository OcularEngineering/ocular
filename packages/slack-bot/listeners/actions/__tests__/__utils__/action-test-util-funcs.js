/* -------------------- Functions for generating the inputs to the listener's callback functions. ------------------- */

const mockActionCallbackInput = (actionPayload) => ({
  ack: global.ackMockFunc,
  body: actionPayload,
  client: {
    views: {
      publish: global.viewPublishMockFunc,
      open: global.viewOpenMockFunc,
    },
    chat: {
      update: global.chatUpdateMockFunc,
      deleteScheduledMessage: global.deleteScheduledMessageMockFunc,
    },
  },
  action: actionPayload.actions[0],
});

/* -------------------------- Utility functions for testing the listener callback functions ------------------------- */
// TODO: There's a ton of commonalities between the different action tests, maybe there's room for refactoring across them
// Maybe a utility function that also sets up the test cases :think:

const testAction = async (
  mockActionPayloadData,
  actionCallback,
  mockedApiMethod = global.viewPublishMockFunc,
  mockedApiMethodArgObj = {
    user_id: mockActionPayloadData.user.id,
    view: expect.any(String),
  },
) => {
  const callbackInput = mockActionCallbackInput(mockActionPayloadData);

  const callbackFunctionPromiseToTest = actionCallback(callbackInput);

  const apiMethodsToCall = [{ mockedApiMethod, mockedApiMethodArgObj }];

  await global.testListener(callbackFunctionPromiseToTest, apiMethodsToCall);
};

const testActionError = async (
  mockActionPayloadData,
  actionCallback,
  methodToFail = global.viewPublishMockFunc,
) => {
  const callbackInput = mockActionCallbackInput(mockActionPayloadData);
  await global.testErrorLog(actionCallback(callbackInput), methodToFail);
};

module.exports = {
  testAction,
  testActionError,
};

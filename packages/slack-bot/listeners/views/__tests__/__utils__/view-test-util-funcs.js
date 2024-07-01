/* -------------------- Functions for generating the inputs to the listener's callback functions. ------------------- */

const mockViewCallbackInput = (viewPayload) => ({
  ack: global.ackMockFunc,
  body: viewPayload,
  client: {
    chat: {
      postMessage: global.chatPostMessageMockFunc,
      scheduleMessage: global.chatScheduleMessageMockFunc,
    },
    views: {
      publish: global.viewPublishMockFunc,
    },
  },
  view: viewPayload.view,
});

/* -------------------------- Utility functions for testing the listener callback functions ------------------------- */

const testView = async (
  mockViewPayloadData,
  viewCallback,
  mockedApiMethod,
  mockedApiMethodArgObj,
) => {
  const callbackInput = mockViewCallbackInput(mockViewPayloadData);

  const callbackFunctionPromiseToTest = viewCallback(callbackInput);

  const apiMethodsToCall = [{ mockedApiMethod, mockedApiMethodArgObj }];

  await global.testListener(callbackFunctionPromiseToTest, apiMethodsToCall);
};

const testViewAckError = async (
  mockViewPayloadData,
  viewCallback,
  ackParameters,
) => {
  const callbackInput = mockViewCallbackInput(mockViewPayloadData);

  // Most listeners call ack() with no parameters, but some like the view listener use it to pass errors
  // TODO: Possibly incorporate this case (ack with parameters) in the global.testListener function

  await viewCallback(callbackInput);

  expect(global.ackMockFunc).toHaveBeenLastCalledWith(
    expect.objectContaining(ackParameters),
  );
};

const testViewError = async (
  mockActionPayloadData,
  actionCallback,
  methodToFail,
) => {
  const callbackInput = mockViewCallbackInput(mockActionPayloadData);
  await global.testErrorLog(actionCallback(callbackInput), methodToFail);
};

module.exports = {
  testView,
  testViewError,
  testViewAckError,
};

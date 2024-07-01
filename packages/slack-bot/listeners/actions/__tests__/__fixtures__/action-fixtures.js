/* --------------------------------------------- Hard-coded payload data -------------------------------------------- */
// TODO: Cleanup the payloads,keep only whats needed

const appHomeBlockChecklistSelectionActionPayloadBase = (
  actions,
  additionalProperies,
) => ({
  ...additionalProperies,
  actions,
  type: 'block_actions',
  team: {
    id: 'T9TK3CUKW',
    domain: 'example',
  },
  user: {
    id: 'UA8RXUSPL',
    username: 'jtorrance',
    name: 'jtorrance',
    team_id: 'T9TK3CUKW',
  },
  api_app_id: 'AABA1ABCD',
  token: '9s8d9as89d8as9d8as989',
  container: {
    type: 'view',
    view_id: 'V0PKB1ZFV',
  },
  trigger_id: '24571818370.22717085937.b9c7ca14b87be6b44ff5864edba8306f',
  view: {
    id: 'V0PKB1ZFV',
    team_id: 'T9TK3CUKW',
    type: 'home',
    blocks: [
      {
        type: 'section',
        block_id: '8ZG',
        text: {
          type: 'mrkdwn',
          text: 'A stack of blocks for the simple sample Block Kit Home tab.',
          verbatim: false,
        },
      },
      {
        type: 'actions',
        block_id: '7fhg',
        elements: [
          {
            type: 'button',
            action_id: 'XRX',
            text: {
              type: 'plain_text',
              text: 'Action A',
              emoji: true,
            },
          },
          {
            type: 'button',
            action_id: 'GFBew',
            text: {
              type: 'plain_text',
              text: 'Action B',
              emoji: true,
            },
          },
        ],
      },
      {
        type: 'section',
        block_id: '6evU',
        text: {
          type: 'mrkdwn',
          text: "And now it's slightly more complex.",
          verbatim: false,
        },
      },
    ],
    private_metadata: '',
    callback_id: '',
    state: {
      values: {},
    },
    hash: '1571318366.2468e46f',
    clear_on_close: false,
    notify_on_close: false,
    close: null,
    submit: null,
    previous_view_id: null,
    root_view_id: 'V0PKB1ZFV',
    app_id: 'AABA1ABCD',
    external_id: '',
    app_installed_team_id: 'T9TK3CUKW',
    bot_id: 'B0B00B00',
  },
});

const appHomeBlockChecklistSelectionActionPayload =
  appHomeBlockChecklistSelectionActionPayloadBase([
    {
      selected_options: [
        {
          text: {
            type: 'mrkdwn',
            text: '*example task here*',
            verbatim: false,
          },
          value: 'open-task-2',
        },
      ],
      action_id: 'blockOpenTaskCheckboxClicked',
      block_id: 'open-task-status-change-0',
      type: 'checkboxes',
      action_ts: '1627533904.067682',
    },
  ]);

const messageBlockActionPayload =
  appHomeBlockChecklistSelectionActionPayloadBase(
    [
      {
        action_id: 'WaXA',
        block_id: '=qXel',
        text: {
          type: 'plain_text',
          text: 'View',
          emoji: true,
        },
        value: '0',
        type: 'button',
        action_ts: '1548426417.840180',
      },
    ],
    {
      message: {
        bot_id: 'BAH5CA16Z',
        type: 'message',
        text: "This content can't be displayed.",
        user: 'UAJ2RU415',
        ts: '1548261231.000200',
      },
    },
  );

const buttonPressActionPayload =
  appHomeBlockChecklistSelectionActionPayloadBase([
    {
      action_id: 'reopen-task',
      block_id: 'bByD',
      text: { type: 'plain_text', text: 'Reopen', emoji: true },
      value: '1',
      type: 'button',
      action_ts: '1627534494.853645',
    },
  ]);

module.exports = {
  appHomeBlockChecklistSelectionActionPayload,
  messageBlockActionPayload,
  buttonPressActionPayload,
};

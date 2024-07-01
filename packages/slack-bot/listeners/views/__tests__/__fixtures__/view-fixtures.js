const { DateTime } = require('luxon');

/* --------------------------------------------- Hard-coded payload data -------------------------------------------- */
// TODO: Cleanup the payloads,keep only whats needed

const viewPayloadBase = (
  selectedDate = null,
  selectedTime = null,
  selectedUser = 'U01561Q291S',
  additionalProperties = {},
) => ({
  ...additionalProperties,
  type: 'view_submission',
  team: { id: 'T014K402SOW', domain: 'testteamdomain' },
  user: {
    id: 'U01561Q291S',
    username: 'tester',
    name: 'tester',
    team_id: 'T014K402SOW',
  },
  api_app_id: 'A029RUYCM3J',
  token: 'kD8hEXkgKQSAxJIoDbIdhwG2',
  trigger_id: '2324340212661.1155136084743.396a925caf7c4a07e29778dbd7b577ad',
  view: {
    id: 'V029MB07XS6',
    team_id: 'T014K402SOW',
    type: 'modal',
    blocks: [
      {
        type: 'input',
        block_id: 'taskTitle',
        label: { type: 'plain_text', text: 'New task', emoji: true },
        optional: false,
        dispatch_action: false,
        element: {
          type: 'plain_text_input',
          action_id: 'taskTitle',
          placeholder: {
            type: 'plain_text',
            text: 'Do this thing',
            emoji: true,
          },
          dispatch_action_config: { trigger_actions_on: ['on_enter_pressed'] },
        },
      },
      {
        type: 'input',
        block_id: 'taskAssignUser',
        label: { type: 'plain_text', text: 'Assign user', emoji: true },
        optional: false,
        dispatch_action: false,
        element: {
          type: 'users_select',
          action_id: 'taskAssignUser',
          initial_user: 'U01561Q291S',
        },
      },
      {
        type: 'input',
        block_id: 'taskDueDate',
        label: { type: 'plain_text', text: 'Due date', emoji: true },
        optional: true,
        dispatch_action: false,
        element: { type: 'datepicker', action_id: 'taskDueDate' },
      },
      {
        type: 'input',
        block_id: 'taskDueTime',
        label: { type: 'plain_text', text: 'Time', emoji: true },
        optional: true,
        dispatch_action: false,
        element: { type: 'timepicker', action_id: 'taskDueTime' },
      },
    ],
    private_metadata: '',
    callback_id: 'new-task-modal',
    state: {
      values: {
        taskTitle: {
          taskTitle: {
            type: 'plain_text_input',
            value: 'date and time not selected',
          },
        },
        taskAssignUser: {
          taskAssignUser: {
            type: 'users_select',
            selected_user: selectedUser,
          },
        },
        taskDueDate: {
          taskDueDate: { type: 'datepicker', selected_date: selectedDate },
        },
        taskDueTime: {
          taskDueTime: { type: 'timepicker', selected_time: selectedTime },
        },
      },
    },
    hash: '1627582704.kjn7sBlV',
    title: { type: 'plain_text', text: 'Create new task', emoji: true },
    clear_on_close: false,
    notify_on_close: false,
    close: null,
    submit: { type: 'plain_text', text: 'Create', emoji: true },
    previous_view_id: null,
    root_view_id: 'V029MB07XS6',
    app_id: 'A029RUYCM3J',
    external_id: '',
    app_installed_team_id: 'T014K402SOW',
    bot_id: 'B028VG2GJJJ',
  },
  response_urls: [],
  is_enterprise_install: false,
  enterprise: null,
});

const validDate = DateTime.now().plus({ months: 1, days: 1 }).toISODate();

const pastDate = DateTime.now().minus({ months: 1, days: 1 }).toISODate();

const dateTooFarInFuture = DateTime.now()
  .plus({ months: 11, days: 30 })
  .toISODate();

const modalViewPayloadSelectedDateNoTime = viewPayloadBase(validDate);

const modalViewPayloadSelectedDateFromPast = viewPayloadBase(pastDate, '10:00');

const modalViewPayloadSelectedDateAndTime = viewPayloadBase(validDate, '15:00');

const modalViewPayloadDueDateTooFarInFuture = viewPayloadBase(
  dateTooFarInFuture,
  '13:00',
);

const modelViewPayloadTaskAssignedToDifferentUser = viewPayloadBase(
  validDate,
  '15:00',
  'U014261G301V',
);

module.exports = {
  modalViewPayloadSelectedDateNoTime,
  modalViewPayloadSelectedDateFromPast,
  modalViewPayloadSelectedDateAndTime,
  modalViewPayloadDueDateTooFarInFuture,
  modelViewPayloadTaskAssignedToDifferentUser,
};

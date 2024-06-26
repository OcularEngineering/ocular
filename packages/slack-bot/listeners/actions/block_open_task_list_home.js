const { reloadAppHome, completeTasks } = require('../../utilities');

const openTaskCheckboxClickedCallback = async ({
  ack,
  action,
  client,
  body,
}) => {
  await ack();
  if (action.selected_options.length > 0) {
    const tasksToUpdate = action.selected_options.map(
      (option) => option.value.split('-')[2],
    );
    await completeTasks(tasksToUpdate, body.user.id, client);
  }
  await reloadAppHome(client, body.user.id, body.team.id);
};

// TODO: reformat action_ids to all be snake cased
module.exports = {
  openTaskCheckboxClickedCallback,
};

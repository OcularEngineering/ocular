const { completeTasks, reloadAppHome } = require('../../utilities');

const buttonMarkAsDoneCallback = async ({ ack, action, client, body }) => {
  try {
    await ack();
    const taskID = action.value.split('-')[1];
    await completeTasks([taskID], body.user.id, client);
    await client.chat.update({
      channel: body.container.channel_id,
      ts: body.container.message_ts,
      text: `~${body.message.text}~`,
      blocks: [], // Remove all the existing blocks, just leaving the text above.
    });
    await reloadAppHome(client, body.user.id, body.team.id, 'completed');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

module.exports = {
  buttonMarkAsDoneCallback,
};

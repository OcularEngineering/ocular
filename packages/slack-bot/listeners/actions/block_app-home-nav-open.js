const reloadAppHome = require('../../utilities/reload-app-home');

const appHomeNavOpenCallback = async ({ body, ack, client }) => {
  try {
    await ack();
    await reloadAppHome(client, body.user.id, body.team.id, 'open');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

module.exports = {
  appHomeNavOpenCallback,
};

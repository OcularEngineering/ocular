const { Op } = require('sequelize');

const { Task } = require('../models');

module.exports = async (taskIDs, slackUserID, client) => {
  Task.update({ status: 'CLOSED' }, { where: { id: taskIDs } });
  // Find all the tasks provided where we have a scheduled message ID
  const tasksFromDB = await Task.findAll(
    {
      where: {
        [Op.and]: [
          { id: taskIDs },
          { scheduledMessageId: { [Op.not]: null } },
        ],
      },
    },
  );
  // If a reminder is scheduled, cancel it and remove the ID from the datastore
  tasksFromDB.map(async (task) => {
    if (task.scheduledMessageId) {
      try {
        await client.chat.deleteScheduledMessage({
          channel: slackUserID,
          scheduled_message_id: task.scheduledMessageId,
        });
        Task.update({ scheduledMessageId: null }, { where: { id: task.id } });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  });
};

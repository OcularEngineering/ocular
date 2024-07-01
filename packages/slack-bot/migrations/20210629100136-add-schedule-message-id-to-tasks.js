module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn(
    'Tasks',
    'scheduledMessageId',
    {
      type: Sequelize.STRING,
      allowNull: true,
    },
  ),

  down: async (queryInterface) => queryInterface.removeColumn(
    'Tasks',
    'scheduledMessageId',
  ),
};

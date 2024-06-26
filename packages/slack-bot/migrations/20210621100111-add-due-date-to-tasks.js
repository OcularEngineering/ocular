module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn(
    'Tasks',
    'dueDate',
    {
      type: Sequelize.DATE,
      allowNull: true,
    },
  ),

  down: async (queryInterface) => queryInterface.removeColumn(
    'Tasks',
    'dueDate',
  ),
};

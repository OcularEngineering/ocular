module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn(
    'Tasks',
    'UserId',
    {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  ),

  down: async (queryInterface) => queryInterface.removeColumn(
    'Tasks',
    'UserID',
  ),
};

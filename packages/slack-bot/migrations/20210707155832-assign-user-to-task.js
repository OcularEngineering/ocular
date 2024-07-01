module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'Tasks',
      'UserId',
      'creatorId',
      {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    );
    await queryInterface.addColumn(
      'Tasks',
      'currentAssigneeId',
      {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'Tasks',
      'CurrentAssigneeId',
    );
    await queryInterface.renameColumn(
      'Tasks',
      'creatorId',
      'UserId',
      {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    );
  },
};

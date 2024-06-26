const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Task, { as: 'createdTasks', foreignKey: 'creatorId' });
      User.hasMany(models.Task, { as: 'assignedTasks', foreignKey: 'currentAssigneeId' });
    }
  }
  User.init({
    slackUserID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slackOrganizationID: {
      type: DataTypes.STRING,
    },
    slackWorkspaceID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};

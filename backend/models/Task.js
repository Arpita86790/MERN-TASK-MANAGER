const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Task = sequelize.define('Task', {
  title: DataTypes.STRING,
  description: DataTypes.STRING,
  status: DataTypes.STRING,
  priority: DataTypes.STRING,
  assignedUserId: DataTypes.INTEGER
});

Task.belongsTo(User, { foreignKey: 'assignedUserId' });

module.exports = Task;

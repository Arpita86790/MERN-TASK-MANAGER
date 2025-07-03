const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const ActivityLog = sequelize.define('ActivityLog', {
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Associate with user
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = ActivityLog;

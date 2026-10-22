const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  lecturer_id: { type: DataTypes.INTEGER, allowNull: false },
  color: { type: DataTypes.STRING(20), defaultValue: '#6366f1' },
}, { tableName: 'subjects' });

module.exports = Subject;

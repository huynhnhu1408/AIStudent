const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Topic = sequelize.define('Topic', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'topics' });

module.exports = Topic;

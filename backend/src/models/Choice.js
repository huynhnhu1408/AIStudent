const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Choice = sequelize.define('Choice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  question_id: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
  order_index: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'choices' });

module.exports = Choice;

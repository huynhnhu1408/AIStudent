const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AttemptAnswer = sequelize.define('AttemptAnswer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  attempt_id: { type: DataTypes.INTEGER, allowNull: false },
  question_id: { type: DataTypes.INTEGER, allowNull: false },
  selected_choice_id: { type: DataTypes.INTEGER, allowNull: true },
  is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
  time_spent_seconds: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'attempt_answers' });

module.exports = AttemptAnswer;

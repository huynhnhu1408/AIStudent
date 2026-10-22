const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attempt = sequelize.define('Attempt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  exam_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  submitted_at: { type: DataTypes.DATE, allowNull: true },
  score: { type: DataTypes.FLOAT, defaultValue: 0 },
  total_correct: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('in_progress', 'submitted', 'timed_out'), defaultValue: 'in_progress' },
}, { tableName: 'attempts' });

module.exports = Attempt;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define('Exam', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 30 },
  total_questions: { type: DataTypes.INTEGER, defaultValue: 10 },
  shuffle_questions: { type: DataTypes.BOOLEAN, defaultValue: true },
  shuffle_choices: { type: DataTypes.BOOLEAN, defaultValue: true },
  start_time: { type: DataTypes.DATE, allowNull: true },
  end_time: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('draft', 'active', 'closed'), defaultValue: 'draft' },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  pass_score: { type: DataTypes.INTEGER, defaultValue: 50 },
}, { tableName: 'exams' });

module.exports = Exam;

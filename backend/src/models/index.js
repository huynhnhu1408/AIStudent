const sequelize = require('../config/database');
const User = require('./User');
const Subject = require('./Subject');
const Topic = require('./Topic');
const Question = require('./Question');
const Choice = require('./Choice');
const Exam = require('./Exam');
const ExamQuestion = require('./ExamQuestion');
const Attempt = require('./Attempt');
const AttemptAnswer = require('./AttemptAnswer');

// User → Subject (Lecturer creates subjects)
User.hasMany(Subject, { foreignKey: 'lecturer_id', as: 'subjects' });
Subject.belongsTo(User, { foreignKey: 'lecturer_id', as: 'lecturer' });

// Subject → Topic
Subject.hasMany(Topic, { foreignKey: 'subject_id', as: 'topics' });
Topic.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

// Topic → Question
Topic.hasMany(Question, { foreignKey: 'topic_id', as: 'questions' });
Question.belongsTo(Topic, { foreignKey: 'topic_id', as: 'topic' });

// User → Question (creator)
User.hasMany(Question, { foreignKey: 'created_by', as: 'createdQuestions' });
Question.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Question → Choice
Question.hasMany(Choice, { foreignKey: 'question_id', as: 'choices', onDelete: 'CASCADE' });
Choice.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// Subject → Exam
Subject.hasMany(Exam, { foreignKey: 'subject_id', as: 'exams' });
Exam.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

// User → Exam (creator)
User.hasMany(Exam, { foreignKey: 'created_by', as: 'createdExams' });
Exam.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Exam ↔ Question (many-to-many via ExamQuestion)
Exam.belongsToMany(Question, { through: ExamQuestion, foreignKey: 'exam_id', as: 'questions' });
Question.belongsToMany(Exam, { through: ExamQuestion, foreignKey: 'question_id', as: 'exams' });
Exam.hasMany(ExamQuestion, { foreignKey: 'exam_id', as: 'examQuestions' });
ExamQuestion.belongsTo(Exam, { foreignKey: 'exam_id' });
ExamQuestion.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// Exam → Attempt
Exam.hasMany(Attempt, { foreignKey: 'exam_id', as: 'attempts' });
Attempt.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });

// User (Student) → Attempt
User.hasMany(Attempt, { foreignKey: 'student_id', as: 'attempts' });
Attempt.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Attempt → AttemptAnswer
Attempt.hasMany(AttemptAnswer, { foreignKey: 'attempt_id', as: 'answers', onDelete: 'CASCADE' });
AttemptAnswer.belongsTo(Attempt, { foreignKey: 'attempt_id' });

// Question → AttemptAnswer
Question.hasMany(AttemptAnswer, { foreignKey: 'question_id', as: 'attemptAnswers' });
AttemptAnswer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// Choice → AttemptAnswer
Choice.hasMany(AttemptAnswer, { foreignKey: 'selected_choice_id', as: 'selectedAnswers' });
AttemptAnswer.belongsTo(Choice, { foreignKey: 'selected_choice_id', as: 'selectedChoice' });

module.exports = { sequelize, User, Subject, Topic, Question, Choice, Exam, ExamQuestion, Attempt, AttemptAnswer };

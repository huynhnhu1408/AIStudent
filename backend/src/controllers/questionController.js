const { Question, Choice, Topic, Subject, User } = require('../models');
const { Op } = require('sequelize');

const questionInclude = [
  { model: Choice, as: 'choices', order: [['order_index', 'ASC']] },
  { model: Topic, as: 'topic', include: [{ model: Subject, as: 'subject' }] },
  { model: User, as: 'creator', attributes: ['id', 'name'] },
];

// GET /api/questions
const getQuestions = async (req, res, next) => {
  try {
    const { topic_id, subject_id, status, difficulty, ai_generated, page = 1, limit = 20, search } = req.query;
    const where = {};
    if (topic_id) where.topic_id = topic_id;
    if (status) where.status = status;
    if (difficulty) where.difficulty = difficulty;
    if (ai_generated !== undefined) where.ai_generated = ai_generated === 'true';
    if (search) where.content = { [Op.like]: `%${search}%` };

    const offset = (page - 1) * limit;
    const { count, rows } = await Question.findAndCountAll({
      where,
      include: questionInclude,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
};

// GET /api/questions/:id
const getQuestion = async (req, res, next) => {
  try {
    const q = await Question.findByPk(req.params.id, { include: questionInclude });
    if (!q) return res.status(404).json({ success: false, message: 'Câu hỏi không tồn tại' });
    res.json({ success: true, data: q });
  } catch (err) { next(err); }
};

// POST /api/questions
const createQuestion = async (req, res, next) => {
  try {
    const { topic_id, content, difficulty, explanation, choices } = req.body;
    const question = await Question.create({
      topic_id, content, difficulty, explanation,
      created_by: req.user.id, ai_generated: false, status: 'approved',
    });
    if (choices && choices.length > 0) {
      await Choice.bulkCreate(choices.map((c, i) => ({
        question_id: question.id, content: c.content, is_correct: c.is_correct, order_index: i,
      })));
    }
    const full = await Question.findByPk(question.id, { include: questionInclude });
    res.status(201).json({ success: true, data: full });
  } catch (err) { next(err); }
};

// PUT /api/questions/:id
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Câu hỏi không tồn tại' });
    const { choices, ...rest } = req.body;
    await question.update(rest);
    if (choices) {
      await Choice.destroy({ where: { question_id: question.id } });
      await Choice.bulkCreate(choices.map((c, i) => ({
        question_id: question.id, content: c.content, is_correct: c.is_correct, order_index: i,
      })));
    }
    const full = await Question.findByPk(question.id, { include: questionInclude });
    res.json({ success: true, data: full });
  } catch (err) { next(err); }
};

// PATCH /api/questions/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Câu hỏi không tồn tại' });
    await question.update({ status });
    res.json({ success: true, data: question, message: `Câu hỏi đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}` });
  } catch (err) { next(err); }
};

// DELETE /api/questions/:id
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Câu hỏi không tồn tại' });
    await question.destroy();
    res.json({ success: true, message: 'Xóa câu hỏi thành công' });
  } catch (err) { next(err); }
};

module.exports = { getQuestions, getQuestion, createQuestion, updateQuestion, updateStatus, deleteQuestion };

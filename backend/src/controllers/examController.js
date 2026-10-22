const { Exam, ExamQuestion, Question, Choice, Subject, User, Topic } = require('../models');
const { Op } = require('sequelize');

// GET /api/exams
const getExams = async (req, res, next) => {
  try {
    const { status, subject_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (subject_id) where.subject_id = subject_id;
    if (req.user.role === 'lecturer') where.created_by = req.user.id;

    const exams = await Exam.findAll({
      where,
      include: [
        { model: Subject, as: 'subject' },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: exams });
  } catch (err) { next(err); }
};

// GET /api/exams/:id
const getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [
        { model: Subject, as: 'subject' },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        {
          model: Question, as: 'questions',
          include: [{ model: Choice, as: 'choices' }, { model: Topic, as: 'topic' }],
        },
      ],
    });
    if (!exam) return res.status(404).json({ success: false, message: 'Bài thi không tồn tại' });
    res.json({ success: true, data: exam });
  } catch (err) { next(err); }
};

// POST /api/exams
const createExam = async (req, res, next) => {
  try {
    const { subject_id, title, description, duration_minutes, shuffle_questions, shuffle_choices, start_time, end_time, pass_score, question_ids } = req.body;
    
    const exam = await Exam.create({
      subject_id, title, description, duration_minutes,
      shuffle_questions, shuffle_choices, start_time, end_time, pass_score,
      total_questions: question_ids?.length || 0,
      created_by: req.user.id,
      status: 'draft',
    });

    if (question_ids && question_ids.length > 0) {
      await ExamQuestion.bulkCreate(
        question_ids.map((qid, i) => ({ exam_id: exam.id, question_id: qid, order_index: i }))
      );
    }

    res.status(201).json({ success: true, data: exam, message: 'Tạo bài thi thành công' });
  } catch (err) { next(err); }
};

// PUT /api/exams/:id
const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, created_by: req.user.id } });
    if (!exam) return res.status(404).json({ success: false, message: 'Bài thi không tồn tại' });
    if (exam.status === 'active') {
      return res.status(400).json({ success: false, message: 'Không thể chỉnh sửa bài thi đang hoạt động' });
    }
    const { question_ids, ...rest } = req.body;
    await exam.update({ ...rest, total_questions: question_ids?.length || exam.total_questions });
    if (question_ids) {
      await ExamQuestion.destroy({ where: { exam_id: exam.id } });
      await ExamQuestion.bulkCreate(question_ids.map((qid, i) => ({ exam_id: exam.id, question_id: qid, order_index: i })));
    }
    res.json({ success: true, data: exam });
  } catch (err) { next(err); }
};

// PATCH /api/exams/:id/activate
const activateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, created_by: req.user.id } });
    if (!exam) return res.status(404).json({ success: false, message: 'Bài thi không tồn tại' });
    await exam.update({ status: 'active' });
    res.json({ success: true, data: exam, message: 'Bài thi đã được kích hoạt' });
  } catch (err) { next(err); }
};

// PATCH /api/exams/:id/close
const closeExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, created_by: req.user.id } });
    if (!exam) return res.status(404).json({ success: false, message: 'Bài thi không tồn tại' });
    await exam.update({ status: 'closed' });
    res.json({ success: true, data: exam, message: 'Bài thi đã đóng' });
  } catch (err) { next(err); }
};

module.exports = { getExams, getExam, createExam, updateExam, activateExam, closeExam };

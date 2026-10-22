const { Subject, Topic, User } = require('../models');

// GET /api/subjects
const getSubjects = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.role === 'lecturer') where.lecturer_id = req.user.id;
    
    const subjects = await Subject.findAll({
      where,
      include: [
        { model: User, as: 'lecturer', attributes: ['id', 'name', 'email'] },
        { model: Topic, as: 'topics' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: subjects });
  } catch (err) { next(err); }
};

// GET /api/subjects/:id
const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id, {
      include: [
        { model: User, as: 'lecturer', attributes: ['id', 'name'] },
        { model: Topic, as: 'topics' },
      ],
    });
    if (!subject) return res.status(404).json({ success: false, message: 'Môn học không tồn tại' });
    res.json({ success: true, data: subject });
  } catch (err) { next(err); }
};

// POST /api/subjects
const createSubject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const subject = await Subject.create({ name, description, color, lecturer_id: req.user.id });
    res.status(201).json({ success: true, data: subject, message: 'Tạo môn học thành công' });
  } catch (err) { next(err); }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ where: { id: req.params.id, lecturer_id: req.user.id } });
    if (!subject) return res.status(404).json({ success: false, message: 'Môn học không tồn tại' });
    await subject.update(req.body);
    res.json({ success: true, data: subject });
  } catch (err) { next(err); }
};

// DELETE /api/subjects/:id
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ where: { id: req.params.id, lecturer_id: req.user.id } });
    if (!subject) return res.status(404).json({ success: false, message: 'Môn học không tồn tại' });
    await subject.destroy();
    res.json({ success: true, message: 'Xóa môn học thành công' });
  } catch (err) { next(err); }
};

// POST /api/subjects/:id/topics
const createTopic = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const topic = await Topic.create({ name, description, subject_id: req.params.id });
    res.status(201).json({ success: true, data: topic });
  } catch (err) { next(err); }
};

// PUT /api/topics/:id
const updateTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Chủ đề không tồn tại' });
    await topic.update(req.body);
    res.json({ success: true, data: topic });
  } catch (err) { next(err); }
};

// DELETE /api/topics/:id
const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Chủ đề không tồn tại' });
    await topic.destroy();
    res.json({ success: true, message: 'Xóa chủ đề thành công' });
  } catch (err) { next(err); }
};

module.exports = { getSubjects, getSubject, createSubject, updateSubject, deleteSubject, createTopic, updateTopic, deleteTopic };

const { Attempt, AttemptAnswer, Question, Topic, Exam, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/stats/me — student stats
const getMyStats = async (req, res, next) => {
  try {
    const attempts = await Attempt.findAll({
      where: { student_id: req.user.id, status: { [Op.in]: ['submitted', 'timed_out'] } },
      include: [{ model: Exam, as: 'exam' }],
      order: [['createdAt', 'ASC']],
    });

    const totalAttempts = attempts.length;
    const avgScore = totalAttempts ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts) : 0;
    const passed = attempts.filter(a => a.score >= 50).length;

    const scoreHistory = attempts.map(a => ({
      date: a.submitted_at || a.createdAt,
      score: a.score,
      exam_title: a.exam?.title,
    }));

    res.json({ success: true, data: { totalAttempts, avgScore, passed, failed: totalAttempts - passed, scoreHistory } });
  } catch (err) { next(err); }
};

// GET /api/stats/exam/:id — lecturer view class results
const getExamStats = async (req, res, next) => {
  try {
    const attempts = await Attempt.findAll({
      where: { exam_id: req.params.id, status: { [Op.in]: ['submitted', 'timed_out'] } },
      include: [{ model: Exam, as: 'exam' }],
    });

    const scores = attempts.map(a => a.score);
    const avg = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    const distribution = { '0-49': 0, '50-69': 0, '70-89': 0, '90-100': 0 };
    scores.forEach(s => {
      if (s < 50) distribution['0-49']++;
      else if (s < 70) distribution['50-69']++;
      else if (s < 90) distribution['70-89']++;
      else distribution['90-100']++;
    });

    res.json({ success: true, data: { totalAttempts: attempts.length, avgScore: avg, distribution, attempts } });
  } catch (err) { next(err); }
};

module.exports = { getMyStats, getExamStats };

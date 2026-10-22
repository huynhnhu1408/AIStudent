const express = require('express');
const router = express.Router();
const { getExams, getExam, createExam, updateExam, activateExam, closeExam } = require('../controllers/examController');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', getExams);
router.get('/:id', getExam);
router.post('/', requireRole('lecturer', 'admin'), createExam);
router.put('/:id', requireRole('lecturer', 'admin'), updateExam);
router.patch('/:id/activate', requireRole('lecturer', 'admin'), activateExam);
router.patch('/:id/close', requireRole('lecturer', 'admin'), closeExam);

module.exports = router;

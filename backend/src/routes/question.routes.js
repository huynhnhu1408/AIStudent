const express = require('express');
const router = express.Router();
const { getQuestions, getQuestion, createQuestion, updateQuestion, updateStatus, deleteQuestion } = require('../controllers/questionController');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', getQuestions);
router.get('/:id', getQuestion);
router.post('/', requireRole('lecturer', 'admin'), createQuestion);
router.put('/:id', requireRole('lecturer', 'admin'), updateQuestion);
router.patch('/:id/status', requireRole('lecturer', 'admin'), updateStatus);
router.delete('/:id', requireRole('lecturer', 'admin'), deleteQuestion);

module.exports = router;

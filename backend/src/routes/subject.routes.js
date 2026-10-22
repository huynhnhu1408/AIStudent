const express = require('express');
const router = express.Router();
const { getSubjects, getSubject, createSubject, updateSubject, deleteSubject, createTopic, updateTopic, deleteTopic } = require('../controllers/subjectController');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', getSubjects);
router.get('/:id', getSubject);
router.post('/', requireRole('lecturer', 'admin'), createSubject);
router.put('/:id', requireRole('lecturer', 'admin'), updateSubject);
router.delete('/:id', requireRole('lecturer', 'admin'), deleteSubject);
router.post('/:id/topics', requireRole('lecturer', 'admin'), createTopic);

const topicRouter = express.Router();
topicRouter.put('/:id', authenticate, requireRole('lecturer', 'admin'), updateTopic);
topicRouter.delete('/:id', authenticate, requireRole('lecturer', 'admin'), deleteTopic);

module.exports = { subjectRouter: router, topicRouter };

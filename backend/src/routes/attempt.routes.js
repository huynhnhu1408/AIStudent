const express = require('express');
const router = express.Router();
const { startAttempt, submitAttempt, getMyAttempts, getAttemptResult } = require('../controllers/attemptController');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/my', getMyAttempts);
router.post('/', requireRole('student'), startAttempt);
router.post('/:id/submit', requireRole('student'), submitAttempt);
router.get('/:id/result', getAttemptResult);

module.exports = router;

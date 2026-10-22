const express = require('express');
const router = express.Router();
const { getMyStats, getExamStats } = require('../controllers/statsController');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/me', requireRole('student'), getMyStats);
router.get('/exam/:id', requireRole('lecturer', 'admin'), getExamStats);

module.exports = router;

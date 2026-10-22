const express = require('express');
const router = express.Router();
const { register, login, refresh, getMe } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);

module.exports = router;

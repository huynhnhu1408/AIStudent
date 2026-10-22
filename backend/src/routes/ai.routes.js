const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateQuestions, extractAndGenerate } = require('../controllers/aiController');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ hỗ trợ file PDF và TXT'));
  },
});

router.use(authenticate, requireRole('lecturer', 'admin'));
router.post('/generate', generateQuestions);
router.post('/extract', upload.single('file'), extractAndGenerate);

module.exports = router;

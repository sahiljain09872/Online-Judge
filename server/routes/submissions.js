const express = require('express');
const router = express.Router();
const {
  submitCode,
  submitRun,
  getSubmission,
  getMySubmissions,
  getProblemSubmissions
} = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');
const { submissionLimiter } = require('../middleware/rateLimiter');

// All submission routes require authentication
router.use(protect);

router.post('/', submissionLimiter, submitCode);
router.post('/run', submissionLimiter, submitRun);
router.get('/my', getMySubmissions);
router.get('/problem/:problemId', getProblemSubmissions);
router.get('/:id', getSubmission);

module.exports = router;

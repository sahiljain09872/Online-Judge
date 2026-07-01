const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max: 100,                   // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' }
});

// Strict submission rate limit
const submissionLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 5,                      // Limit each IP to 5 requests per `window` (here, per minute)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Submission rate limit exceeded. Max 5 per minute.' }
});

module.exports = { apiLimiter, submissionLimiter };

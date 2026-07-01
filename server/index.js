require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Import Queue Workers and Events (initializes them)
require('./services/queue/queueEvents');
require('./services/queue/submissionWorker');

const redisClient = require('./config/redis');
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, submissionLimiter } = require('./middleware/rateLimiter');

const app = express();

// Connect to MongoDB
connectDB();

// Verify Redis Connection (handled internally in config/redis)
// We just import it so the connection starts

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

// Apply rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/users', require('./routes/users'));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

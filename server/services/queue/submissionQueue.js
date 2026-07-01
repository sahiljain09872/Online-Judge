const { Queue } = require('bullmq');
const redisConnection = require('../../config/redis');

const submissionQueue = new Queue('code-submissions', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,                                    // Retry once on failure
    backoff: { type: 'exponential', delay: 1000 },  // 1s, then 2s
    removeOnComplete: { count: 100 },               // Keep last 100 completed
    removeOnFail: { count: 50 }                     // Keep last 50 failed
  }
});

module.exports = submissionQueue;

const { QueueEvents } = require('bullmq');
const redisConnection = require('../../config/redis');
const Submission = require('../../models/Submission');

const queueEvents = new QueueEvents('code-submissions', {
  connection: redisConnection
});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed: verdict=${returnvalue.verdict}`);
});

queueEvents.on('failed', async ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed: ${failedReason}`);
  
  try {
    // Attempt to mark submission as failed if it completely crashes
    const submissionId = jobId; // In our setup we'll use submissionId as jobId
    await Submission.findByIdAndUpdate(submissionId, {
      status: 'failed',
      errorMessage: 'Execution worker crashed or failed to process the job.'
    });
  } catch (error) {
    console.error('Error updating failed job status:', error);
  }
});

queueEvents.on('stalled', ({ jobId }) => {
  console.warn(`Job ${jobId} stalled — will be retried`);
});

module.exports = queueEvents;

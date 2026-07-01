const { Worker } = require('bullmq');
const redisConnection = require('../../config/redis');
const DockerExecutor = require('../judge/DockerExecutor');
const Submission = require('../../models/Submission');
const TestCase = require('../../models/TestCase');

async function processSubmission(job) {
  const { submissionId } = job.data;

  // 1. Load submission from DB
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error(`Submission ${submissionId} not found`);

  // 2. Update status to 'processing'
  submission.status = 'processing';
  await submission.save();

  // 3. Fetch test cases for the problem
  let testCases;
  if (submission.isRun) {
    if (submission.customInput !== null) {
      // Use the custom input provided by the user
      testCases = [{ input: submission.customInput, output: null, isHidden: false, isCustom: true }];
    } else {
      // Only fetch visible sample test cases
      testCases = await TestCase.find({ problem: submission.problem, isHidden: false });
    }
  } else {
    // Fetch all test cases
    testCases = await TestCase.find({ problem: submission.problem });
  }

  // 4. Execute code via DockerExecutor
  let result;
  try {
    result = await DockerExecutor.execute(
      submission.code,
      submission.language,
      testCases.map(tc => ({ input: tc.input, output: tc.output, isHidden: tc.isHidden, isCustom: tc.isCustom || false }))
    );
  } catch (error) {
    console.error('DockerExecutor crashed:', error);
    submission.status = 'failed';
    submission.errorMessage = 'Execution engine failed internally: ' + error.message;
    await submission.save();
    return { submissionId, verdict: 'System Error' };
  }

  // 5. Update submission with results
  submission.status = 'completed';
  submission.verdict = result.overallVerdict;
  submission.executionTime = result.maxExecutionTime;
  submission.memoryUsed = result.maxMemoryUsed;
  submission.testCasesPassed = result.testCasesPassed;
  submission.totalTestCases = result.totalTestCases;
  submission.errorMessage = result.compilationError || null;
  submission.testCaseResults = result.testCaseResults || [];
  await submission.save();

  return { submissionId, verdict: result.overallVerdict };
}

const worker = new Worker('code-submissions', processSubmission, {
  connection: redisConnection,
  concurrency: 3    // Max 3 simultaneous Docker executions
});

module.exports = worker;

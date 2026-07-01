const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const submissionQueue = require('../services/queue/submissionQueue');

// @route   POST /api/submissions
// @desc    Submit code for a problem
// @access  Private
exports.submitCode = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'Please provide problemId, code, and language' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Create submission record
    const submission = new Submission({
      user: req.user.id,
      problem: problemId,
      code,
      language,
      status: 'queued'
    });

    await submission.save();

    // Enqueue job with jobId matching submissionId
    const job = await submissionQueue.add(
      'process-submission',
      { submissionId: submission._id },
      { jobId: submission._id.toString() }
    );

    submission.jobId = job.id;
    await submission.save();

    res.status(202).json({
      success: true,
      submissionId: submission._id,
      status: 'queued'
    });
  } catch (error) {
    console.error('Error in submitCode:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/submissions/run
// @desc    Run code for a problem against sample test cases only
// @access  Private
exports.submitRun = async (req, res) => {
  try {
    const { problemId, code, language, customInput } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'Please provide problemId, code, and language' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Create submission record with isRun: true
    const submission = new Submission({
      user: req.user.id,
      problem: problemId,
      code,
      language,
      status: 'queued',
      isRun: true,
      customInput: customInput || null
    });

    await submission.save();

    // Enqueue job with jobId matching submissionId
    const job = await submissionQueue.add(
      'process-submission',
      { submissionId: submission._id },
      { jobId: submission._id.toString() }
    );

    submission.jobId = job.id;
    await submission.save();

    res.status(202).json({
      success: true,
      submissionId: submission._id,
      status: 'queued'
    });
  } catch (error) {
    console.error('Error in submitRun:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/submissions/:id
// @desc    Get submission by ID
// @access  Private
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'name code difficulty')
      .populate('user', 'fullName');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Security: Only the owner or an admin can view the submission
    if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json({ success: true, submission });
  } catch (error) {
    console.error('Error in getSubmission:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/submissions/my
// @desc    Get current user's submissions
// @access  Private
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user.id, isRun: false })
      .sort({ createdAt: -1 })
      .populate('problem', 'name code difficulty');
    
    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    console.error('Error in getMySubmissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/submissions/problem/:problemId
// @desc    Get current user's submissions for a specific problem
// @access  Private
exports.getProblemSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      user: req.user.id,
      problem: req.params.problemId,
      isRun: false
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    console.error('Error in getProblemSubmissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

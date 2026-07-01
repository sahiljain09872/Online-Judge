const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

// @desc    Get all problems (public)
// @route   GET /api/problems
// @access  Public
const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find({}).select('name code difficulty createdAt');
    res.status(200).json({ success: true, count: problems.length, data: problems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single problem by slug/code (public)
// @route   GET /api/problems/:slug
// @access  Public
const getProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({ code: req.params.slug });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    res.status(200).json({ success: true, data: problem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new problem (admin only)
// @route   POST /api/problems
// @access  Private/Admin
const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update problem (admin only)
// @route   PUT /api/problems/:id
// @access  Private/Admin
const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    res.status(200).json({ success: true, data: problem });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete problem (admin only)
// @route   DELETE /api/problems/:id
// @access  Private/Admin
const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    // Delete all associated test cases
    await TestCase.deleteMany({ problem: problem._id });
    await problem.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add test case to a problem (admin only)
// @route   POST /api/problems/:id/test-cases
// @access  Private/Admin
const addTestCase = async (req, res) => {
  try {
    req.body.problem = req.params.id;
    const testCase = await TestCase.create(req.body);
    res.status(201).json({ success: true, data: testCase });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get test cases for a problem
// @route   GET /api/problems/:id/test-cases
// @access  Public (only non-hidden) / Admin (all)
const getTestCases = async (req, res) => {
  try {
    let query = { problem: req.params.id };
    
    // If user is not admin, only show non-hidden test cases
    if (!req.user || req.user.role !== 'admin') {
      query.isHidden = false;
    }
    
    const testCases = await TestCase.find(query);
    res.status(200).json({ success: true, count: testCases.length, data: testCases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  addTestCase,
  getTestCases
};

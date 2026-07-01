const express = require('express');
const router = express.Router();
const { 
  getProblems, 
  getProblem, 
  createProblem, 
  updateProblem, 
  deleteProblem,
  addTestCase,
  getTestCases
} = require('../controllers/problemController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getProblems);
router.get('/:slug', getProblem);

// Optionally public route (middleware handles admin check internally for hidden cases)
router.get('/:id/test-cases', protect, getTestCases); 

// Admin routes
router.post('/', protect, admin, createProblem);
router.put('/:id', protect, admin, updateProblem);
router.delete('/:id', protect, admin, deleteProblem);
router.post('/:id/test-cases', protect, admin, addTestCase);

module.exports = router;

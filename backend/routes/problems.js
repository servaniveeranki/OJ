const express = require('express');
const router = express.Router();
const problemController = require('../controllers/ProblemController');

// @route   POST /api/problems
// @desc    Create a new problem
router.post('/', problemController.createProblem);

// @route   GET /api/problems
// @desc    Get all problems
router.get('/', problemController.getAllProblems);

// @route   GET /api/problems/:id
// @desc    Get a single problem by ID
router.get('/:id', problemController.getProblemById);

// @route   POST /api/problems/submit
// @desc    Submit code for a problem
router.post('/submit', problemController.submitCode);

// @route   POST /api/problems/run-test
// @desc    Run a custom test case
router.post('/run-test', problemController.runTest);

module.exports = router;

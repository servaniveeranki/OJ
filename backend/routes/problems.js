const express = require('express');
const router = express.Router();
const problemController = require('../controllers/ProblemController');
const { isAdmin } = require('../middleware/admin');
const { verifyToken } = require('../middleware/auth');

// @route   POST /api/problems
// @desc    Create a new problem (admin only)
router.post('/', isAdmin, problemController.createProblem);

// @route   GET /api/problems
// @desc    Get all problems
router.get('/', problemController.getAllProblems);

// @route   GET /api/problems/:id
// @desc    Get a single problem by ID
router.get('/:id', problemController.getProblemById);

// @route   POST /api/problems/:id/submit
// @desc    Submit code for a problem
router.post('/:id/submit', problemController.submitCode);

// @route   POST /api/problems/run-test
// @desc    Run a custom test case
router.post('/run-test', problemController.runTest);

// @route   POST /api/problems/run-custom
// @desc    Execute code with custom input
router.post('/run-custom', problemController.executeCustomInput);

// @route   PUT /api/problems/:id
// @desc    Update a problem (admin only)
router.put('/:id', isAdmin, problemController.updateProblem);

// @route   DELETE /api/problems/:id
// @desc    Delete a problem (admin only)
router.delete('/:id', isAdmin, problemController.deleteProblem);

module.exports = router;

const Problem = require('../models/Problem');
const { executeUserCode } = require('../services/executor');

// POST /api/problems
async function createProblem(req, res) {
  try {
    const problem = new Problem(req.body);
    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET /api/problems
async function getAllProblems(req, res) {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/problems/:id
async function getProblemById(req, res) {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/problems/submit
async function submitCode(req, res) {
  const { problemId, code, language } = req.body;
  if (!problemId || !code || !language)
    return res.status(400).json({ error: 'Missing required fields' });

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const results = await executeUserCode({ problem, code, language });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function runTest(req, res) {
    const { code, input, language } = req.body;
  
    if (!code || !input || !language) {
      return res.status(400).json({ error: 'Missing code, input, or language' });
    }
  
    try {
      // This route runs one custom test case (not tied to a problem)
      const testCase = {
        input: input,
        output: '', // No output to match, just return actual output
      };
  
      const problem = { testCases: [testCase] }; // Wrap into fake "problem" for reuse
  
      const results = await executeUserCode({ problem, code, language });
      res.json({ result: results[0] }); // return only the first test result
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  submitCode,
  runTest
};

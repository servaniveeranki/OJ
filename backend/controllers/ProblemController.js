const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { executeUserCode } = require('../services/executor');

// Helper function to track user submission statistics
async function trackSubmission(userId, problemId, language, status, executionTime) {
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return;
    }
    
    // Update total submissions count
    user.totalSubmissions += 1;
    
    // Update status-specific counts
    if (status === 'Accepted') {
      user.submissionStats.accepted += 1;
      
      // Check if this problem is already solved by the user
      const alreadySolved = user.solvedProblems.includes(problemId);
      
      if (!alreadySolved) {
        // Add to solved problems list
        user.solvedProblems.push(problemId);
        user.problemsSolved += 1;
      }
    } else if (status === 'Wrong Answer') {
      user.submissionStats.wrongAnswer += 1;
    } else if (status === 'Time Limit Exceeded') {
      user.submissionStats.timeLimitExceeded += 1;
    } else if (status === 'Runtime Error') {
      user.submissionStats.runtimeError += 1;
    } else if (status === 'Compilation Error') {
      user.submissionStats.compilationError += 1;
    }
    
    // Save the updated user document
    await user.save();
    
    console.log(`Updated statistics for user ${userId}: ${status} submission for problem ${problemId}`);
    
    // Also track submission in a separate collection if needed
    // This could be implemented later for more detailed submission history
  } catch (err) {
    console.error('Error tracking submission:', err);
    throw err;
  }
}

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

// POST /api/problems/:id/submit
async function submitCode(req, res) {
  const problemId = req.params.id;
  const { code, language, userId } = req.body;
  
  console.log('Submission received:', { problemId, language, userId });
  
  if (!code || !language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Find the problem by ID
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    const startTime = Date.now();
    
    // Execute the code against all test cases
    const results = await executeUserCode({ 
      problem, 
      code, 
      language, 
      testCases: problem.testCases 
    });
    
    const executionTime = Date.now() - startTime;
    
    // Calculate overall status
    let passedCount = 0;
    const totalTests = results.length;
    
    results.forEach(result => {
      if (result.passed) passedCount++;
    });
    
    const status = passedCount === totalTests ? 'Accepted' : 'Wrong Answer';
    
    // Create a new submission record
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status,
      testResults: results.map(result => ({
        input: result.input,
        expected: result.expected,
        output: result.output,
        passed: result.passed,
        error: result.error
      })),
      executionTime,
      memory: Math.floor(Math.random() * 10000), // Placeholder for memory usage
      createdAt: new Date()
    });
    
    await submission.save();
    console.log(`Submission saved with ID: ${submission._id}`);
    
    // Track submission statistics
    if (userId && userId !== 'anonymous') {
      try {
        // Update user statistics
        await trackSubmission(userId, problemId, language, status, executionTime);
      } catch (statsErr) {
        console.error('Failed to update submission statistics:', statsErr);
        // Continue with the response even if stats tracking fails
      }
    }
    
    // Return the results to the client
    res.json({
      status,
      results,
      executionTime,
      passedCount,
      totalTests,
      submissionId: submission._id
    });
  } catch (err) {
    console.error('Error in submission:', err);
    res.status(500).json({ error: err.message });
  }
}


async function runTest(req, res) {
  const { code, language, problem } = req.body;

  if (!code || !language || !problem || !problem.testCases) {
    return res.status(400).json({ error: 'Missing code, language, or problem with testCases' });
  }

  try {
    const results = await executeUserCode({
      problem,
      code,
      language,
      testCases: problem.testCases
    });

    res.json({ results }); // Send all results properly structured
  } catch (err) {
    console.error('Error executing test:', err);
    res.status(500).json({ error: err.message });
  }
}

// Handle custom input execution
async function executeCustomInput(req, res) {
  const { code, language, input, problemId } = req.body;
  
  console.log('Received custom input execution request:', { 
    problemId, 
    hasCode: !!code, 
    language, 
    hasInput: !!input 
  });

  if (!code || !language || !input) {
    return res.status(400).json({ error: 'Missing code, language, or input' });
  }
  
  if (!problemId) {
    return res.status(400).json({ error: 'Missing problemId' });
  }

  // Get the problem from database using problemId
  let problem;
  try {
    problem = await Problem.findById(problemId);
    if (!problem) {
      console.error(`Problem not found with ID: ${problemId}`);
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    console.log(`Found problem: ${problem.title}, functionName: ${problem.functionName}`);
  } catch (err) {
    console.error('Error finding problem:', err);
    return res.status(500).json({ error: 'Error retrieving problem information' });
  }
  
  // Validate that problem has the necessary fields
  if (!problem.functionName || !problem.functionSignature) {
    console.error('Problem missing required fields:', { 
      hasFunctionName: !!problem.functionName, 
      hasFunctionSignature: !!problem.functionSignature 
    });
    return res.status(400).json({ error: 'Invalid problem information - missing function details' });
  }

  try {
    // Create a single test case with the input
    const customTestCase = {
      input: input,
      output: "" // Output doesn't matter for custom input
    };

    const results = await executeUserCode({
      problem,
      code,
      language,
      testCases: [customTestCase]
    });

    // Return the response in the format expected by the frontend
    res.json({ 
      status: results[0].passed ? 'Success' : (results[0].error ? 'Runtime Error' : 'Execution Complete'),
      output: results[0].output,
      error: results[0].error || null,
      executionTime: results[0].time
    });
  } catch (err) {
    console.error('Error executing custom input:', err);
    res.status(500).json({ error: err.message });
  }
}


module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  submitCode,
  runTest,
  executeCustomInput
};
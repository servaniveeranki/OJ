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
    
    // Initialize submissionStats if it doesn't exist
    if (!user.submissionStats) {
      user.submissionStats = {
        accepted: 0,
        wrongAnswer: 0,
        timeLimitExceeded: 0,
        runtimeError: 0,
        compilationError: 0
      };
    }
    
    // Initialize streak if it doesn't exist
    if (!user.streak) {
      user.streak = {
        current: 0,
        longest: 0,
        lastSubmissionDate: null
      };
    }
    
    // Update total submissions count
    user.totalSubmissions = (user.totalSubmissions || 0) + 1;
    
    // Update status-specific counts
    if (status === 'Accepted') {
      user.submissionStats.accepted = (user.submissionStats.accepted || 0) + 1;
      
      // Check if this problem is already solved by the user
      const alreadySolved = user.solvedProblems.includes(problemId);
      
      if (!alreadySolved) {
        // Add to solved problems list
        user.solvedProblems.push(problemId);
        user.problemsSolved = (user.problemsSolved || 0) + 1;
      }
      
      // Update streak for accepted submissions
      const today = new Date();
      const lastSubmission = user.streak.lastSubmissionDate;
      
      if (!lastSubmission) {
        // First submission
        user.streak.current = 1;
        user.streak.longest = 1;
      } else {
        const daysDiff = Math.floor((today - lastSubmission) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          user.streak.current += 1;
          user.streak.longest = Math.max(user.streak.longest, user.streak.current);
        } else if (daysDiff === 0) {
          // Same day, maintain streak
          // Do nothing
        } else {
          // Streak broken
          user.streak.current = 1;
        }
      }
      
      user.streak.lastSubmissionDate = today;
    } else if (status === 'Wrong Answer') {
      user.submissionStats.wrongAnswer = (user.submissionStats.wrongAnswer || 0) + 1;
    } else if (status === 'Time Limit Exceeded') {
      user.submissionStats.timeLimitExceeded = (user.submissionStats.timeLimitExceeded || 0) + 1;
    } else if (status === 'Runtime Error') {
      user.submissionStats.runtimeError = (user.submissionStats.runtimeError || 0) + 1;
    } else if (status === 'Compilation Error') {
      user.submissionStats.compilationError = (user.submissionStats.compilationError || 0) + 1;
    }
    
    // Save the updated user document
    await user.save();
    
    console.log(`Updated statistics for user ${userId}: ${status} submission for problem ${problemId}`);
    console.log(`Current stats:`, {
      totalSubmissions: user.totalSubmissions,
      problemsSolved: user.problemsSolved,
      submissionStats: user.submissionStats,
      streak: user.streak
    });
    
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
    
    // Prepare the response
    const response = {
      status,
      results,
      executionTime,
      passedCount,
      totalTests,
      submissionId: submission._id
    };
    
    // If the submission has errors, use AI to analyze them
    if (status !== 'Accepted') {
      // Find the first failed test with an error
      const failedTest = results.find(result => !result.passed && result.error);
      
      if (failedTest) {
        try {
          // Import the AI service
          const { analyzeCodeError } = require('../services/ai');
          
          // Get AI analysis for the error
          const errorAnalysis = await analyzeCodeError(code, language, failedTest.error, failedTest.input);
          
          // Add the AI analysis to the response
          response.aiAnalysis = errorAnalysis;
          console.log('Added AI error analysis to submission results');
        } catch (aiError) {
          console.error('Error analyzing code error:', aiError);
          // Continue without AI analysis if it fails
        }
      }
    }
    
    // Return the results to the client
    res.json(response);
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

    // Prepare the response
    const response = { results };
    
    // Check if any test case failed with an error
    const failedTest = results.find(result => !result.passed && result.error);
    
    // If there's a failed test with an error, use the AI service to analyze it
    if (failedTest) {
      try {
        // Import the AI service
        const { analyzeCodeError } = require('../services/ai');
        
        // Get AI analysis for the error
        const errorAnalysis = await analyzeCodeError(code, language, failedTest.error, failedTest.input);
        
        // Add the AI analysis to the response
        response.aiAnalysis = errorAnalysis;
        console.log('Added AI error analysis to test results');
      } catch (aiError) {
        console.error('Error analyzing code error:', aiError);
        // Continue without AI analysis if it fails
      }
    }

    res.json(response);
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

    // Prepare the response
    const response = { 
      status: results[0].passed ? 'Success' : (results[0].error ? 'Runtime Error' : 'Execution Complete'),
      output: results[0].output,
      error: results[0].error || null,
      executionTime: results[0].time
    };
    
    // If there's an error, use the AI service to analyze it
    if (results[0].error) {
      try {
        // Import the AI service
        const { analyzeCodeError } = require('../services/ai');
        
        // Get AI analysis for the error
        const errorAnalysis = await analyzeCodeError(code, language, results[0].error, input);
        
        // Add the AI analysis to the response
        response.aiAnalysis = errorAnalysis;
        console.log('Added AI error analysis to response');
      } catch (aiError) {
        console.error('Error analyzing code error:', aiError);
        // Continue without AI analysis if it fails
      }
    }

    // Return the response
    res.json(response);
  } catch (err) {
    console.error('Error executing custom input:', err);
    res.status(500).json({ error: err.message });
  }
}


// PUT /api/problems/:id
async function updateProblem(req, res) {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE /api/problems/:id
async function deleteProblem(req, res) {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json({ message: 'Problem deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  submitCode,
  runTest,
  executeCustomInput
};
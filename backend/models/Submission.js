const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'java', 'python']
  },
  languageVersion: {
    type: String,
    default: 'default' // e.g., 'Python 3.10', 'G++ 11'
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending'],
    default: 'Pending'
  },
  verdict: {
    type: String // optional human-readable message
  },
  testResults: [
    {
      input: String,
      expected: String,
      output: String,
      passed: Boolean,
      error: String
    }
  ],
  executionTime: {
    type: Number,
    default: 0 // ms
  },
  memory: {
    type: Number,
    default: 0 // KB or MB (depending on your implementation)
  },
  isLatest: {
    type: Boolean,
    default: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);

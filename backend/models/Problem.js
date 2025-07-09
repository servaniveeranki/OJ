const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  category: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  constraints: {
    type: String
  },
  testCases: [
    {
      input: String,
      output: String,
      isHidden: {
        type: Boolean,
        default: false
      }
    }
  ],
  sampleCode: {
    cpp: {
      type: String,
      default: '// Write your C++ code here\n#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}'
    },
    java: {
      type: String,
      default: '// Write your Java code here\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}'
    },
    python: {
      type: String,
      default: '# Write your Python code here\n\ndef main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()'
    }
  },
  functionName: {
    type: String,
    required: true,
    trim: true
  },
  functionSignature: {
    type: String,
    required: true,
    trim: true
  },
  timeLimit: {
    type: Number,
    default: 2000 // ms
  },
  memoryLimit: {
    type: Number,
    default: 256 // MB
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Problem', ProblemSchema);

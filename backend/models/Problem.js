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
      default: 'import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    // Write your solution method here\n    \n    public static void main(String[] args) {\n        // Your code here\n    }\n}'
    },
    python: {
      type: String,
      default: 'from typing import List\n\nclass Solution:\n    # Write your solution method here\n    \n    def main(self):\n        # Your code here\n        pass\n\nif __name__ == "__main__":\n    solution = Solution()\n    solution.main()'
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

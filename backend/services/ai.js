const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Estimate time/space complexity using regex pattern detection
function calculateTimeComplexity(code, language = 'cpp') {
  let result = {
    timeComplexity: 'Unknown',
    spaceComplexity: 'Unknown',
    details: []
  };

  try {
    const patterns = {
      quadratic: {
        cpp: /for\s*\([^{]*\)\s*{[^}]*for\s*\(/g,
        java: /for\s*\([^{]*\)\s*{[^}]*for\s*\(/g,
        python: /for\s+[^:]*:[^:]*for\s+/g
      },
      linear: {
        cpp: /for\s*\([^{]*\)/g,
        java: /for\s*\([^{]*\)/g,
        python: /for\s+[^:]*/g
      },
      logarithmic: {
        cpp: /(binary_search|\/=\s*2|>>=|mid\s*=)/g,
        java: /(binarySearch|\/=\s*2|>>=|mid\s*=)/g,
        python: /(bisect|\/\/\s*2|mid\s*=)/g
      },
      constant: {
        cpp: /(unordered_map|unordered_set)/g,
        java: /(HashMap|HashSet)/g,
        python: /dict\(|set\(|\{\}|\{\s*:/g
      },
      recursive: {
        cpp: /\w+\s*\([^)]*\)\s*{[^}]*\1\s*\(/g,
        java: /\w+\s*\([^)]*\)\s*{[^}]*\1\s*\(/g,
        python: /def\s+(\w+)[^:]*:[^:]*\1\s*\(/g
      }
    };

    const langPatterns = {
      cpp: Object.fromEntries(Object.entries(patterns).map(([k, v]) => [k, v.cpp])),
      java: Object.fromEntries(Object.entries(patterns).map(([k, v]) => [k, v.java])),
      python: Object.fromEntries(Object.entries(patterns).map(([k, v]) => [k, v.python]))
    }[language] || patterns.cpp;

    let complexityIndicators = {};
    for (const [key, regex] of Object.entries(langPatterns)) {
      complexityIndicators[key] = (code.match(regex) || []).length;
    }

    if (complexityIndicators.recursive > 0) {
      result.timeComplexity = 'O(2^n)';
      result.details.push('Detected recursive pattern');
    } else if (complexityIndicators.quadratic > 0) {
      result.timeComplexity = 'O(n²)';
      result.details.push('Detected nested loops');
    } else if (complexityIndicators.linear > 0 && complexityIndicators.logarithmic > 0) {
      result.timeComplexity = 'O(n log n)';
      result.details.push('Detected loop + log');
    } else if (complexityIndicators.linear > 0) {
      result.timeComplexity = 'O(n)';
      result.details.push('Detected single loops');
    } else if (complexityIndicators.logarithmic > 0) {
      result.timeComplexity = 'O(log n)';
      result.details.push('Detected divide & conquer');
    } else if (complexityIndicators.constant > 0) {
      result.timeComplexity = 'O(1)';
    }

    if (code.includes('new ') || code.includes('malloc') || code.includes('= []') || code.includes('= {}')) {
      result.spaceComplexity = complexityIndicators.quadratic > 0 ? 'O(n²)' : 'O(n)';
    } else {
      result.spaceComplexity = 'O(1)';
    }
  } catch (err) {
    console.error('Error calculating code complexity:', err);
  }

  return result;
}

const JSON5 = require('json5'); // Add at the top

async function getGeminiOptimizations(code, language, problemId, complexityAnalysis) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an expert software engineer specializing in algorithm optimization.
Analyze the following ${language} code for problem #${problemId}:

\`\`\`${language}
${code}
\`\`\`

The code has a time complexity of approximately ${complexityAnalysis.timeComplexity}
and space complexity of ${complexityAnalysis.spaceComplexity}.

Please provide:
1. A brief analysis of the approach used
2. Suggestions for optimizing the code (if possible)
3. An improved version of the code with better time/space complexity or better readability
4. Explanation of the improvements made

Format your response as JSON with the following structure:
{
  "analysis": "...",
  "suggestions": ["..."],
  "optimizedCode": "...",
  "improvements": "...",
  "optimizedTimeComplexity": "O(?)",
  "optimizedSpaceComplexity": "O(?)"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Safely extract JSON block
    let jsonStart = responseText.indexOf('{');
    let jsonEnd = responseText.lastIndexOf('}');
    let jsonStr = responseText.slice(jsonStart, jsonEnd + 1);

    // Replace smart quotes with standard quotes
    jsonStr = jsonStr.replace(/[\u2018\u2019\u201c\u201d]/g, '"');

    // Parse with JSON5 for robustness
    const parsed = JSON5.parse(jsonStr);

    return parsed;
  } catch (error) {
    console.error("Gemini failed, using OpenAI as fallback...\n", error.message);
    return await getOpenAIOptimizations(code, language, problemId, complexityAnalysis);
  }
}


async function getOpenAIOptimizations(code, language, problemId, complexityAnalysis) {
  try {
    const prompt = `
You are an expert software engineer specializing in algorithm optimization.
Analyze the following ${language} code for problem #${problemId}:

\`\`\`${language}
${code}
\`\`\`

The code has a time complexity of approximately ${complexityAnalysis.timeComplexity}
and space complexity of ${complexityAnalysis.spaceComplexity}.

Please provide:
1. A brief analysis of the approach used
2. Suggestions for optimizing the code (if possible)
3. An improved version of the code with better time/space complexity or better readability
4. Explanation of the improvements made

Format your response as JSON with the following structure:
{
  "analysis": "...",
  "suggestions": ["..."],
  "optimizedCode": "...",
  "improvements": "...",
  "optimizedTimeComplexity": "O(?)",
  "optimizedSpaceComplexity": "O(?)"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    let text = completion.choices[0].message.content;

    let jsonStr = text;
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }

    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse OpenAI JSON:", e.message);
      throw e;
    }
  } catch (err) {
    console.error("OpenAI fallback failed:", err.message);
    return {
      analysis: "OpenAI fallback failed.",
      suggestions: ["Review the code manually"],
      optimizedCode: code,
      improvements: "Could not analyze due to fallback failure",
      optimizedTimeComplexity: complexityAnalysis?.timeComplexity || "Unknown",
      optimizedSpaceComplexity: complexityAnalysis?.spaceComplexity || "Unknown"
    };
  }
}

async function analyzeCode(code, language, problemId, passed) {
  let complexityAnalysis = {
    timeComplexity: 'Unknown',
    spaceComplexity: 'Unknown',
    details: []
  };

  try {
    complexityAnalysis = calculateTimeComplexity(code, language);

    const suggestions = await getGeminiOptimizations(
      code,
      language,
      problemId,
      complexityAnalysis
    );

    return {
      passed,
      complexity: complexityAnalysis,
      suggestions
    };
  } catch (err) {
    console.error("Error analyzing code:", err);
    return {
      error: "Failed to analyze code",
      passed,
      complexity: complexityAnalysis,
      suggestions: {
        analysis: "AI analysis failed",
        suggestions: [],
        optimizedCode: code,
        improvements: "N/A",
        optimizedTimeComplexity: complexityAnalysis.timeComplexity,
        optimizedSpaceComplexity: complexityAnalysis.spaceComplexity
      }
    };
  }
}

async function analyzeCodeError(code, language, errorMessage, testCase = '') {
  // Check if API keys are available
  const hasGeminiKey = process.env.GOOGLE_GEMINI_API && process.env.GOOGLE_GEMINI_API.trim() !== '';
  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
  
  // If no API keys are available, return a basic analysis
  if (!hasGeminiKey && !hasOpenAIKey) {
    console.warn('No AI API keys available, providing basic error analysis');
    return getBasicErrorAnalysis(code, language, errorMessage, testCase);
  }

  // Try Gemini first if available
  if (hasGeminiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

      const prompt = `
You are an expert software engineer and debugging specialist.
Analyze the following ${language} code that produced an error:

\`\`\`${language}
${code}
\`\`\`

The error message is:
\`\`\`
${errorMessage}
\`\`\`

${testCase ? `The input that caused the error was:\n\`\`\`\n${testCase}\n\`\`\`\n\n` : ''}

Please provide a detailed analysis including:
1. The exact location of the error in the code
2. What caused the error
3. How to fix it
4. A corrected code snippet
5. Tips to prevent similar errors in the future
6. Whether this is a common mistake that beginners make

Format your response as JSON with the following structure:
{
  "errorLocation": "...",
  "errorCause": "...",
  "fixSuggestion": "...",
  "codeSnippet": "...",
  "preventionTips": ["..."],
  "isCommonMistake": true/false
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.replace(/```json\s*|```/g, '');

      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini error analysis failed:", error.message);
      // Fall through to OpenAI or basic analysis
    }
  }

  // Try OpenAI as fallback if available
  if (hasOpenAIKey) {
    try {
      return await getOpenAIErrorAnalysis(code, language, errorMessage, testCase);
    } catch (error) {
      console.error("OpenAI error analysis failed:", error.message);
      // Fall through to basic analysis
    }
  }

  // If all AI services fail, provide basic analysis
  console.warn('All AI services failed, providing basic error analysis');
  return getBasicErrorAnalysis(code, language, errorMessage, testCase);
}

// Basic error analysis fallback when AI services are unavailable
function getBasicErrorAnalysis(code, language, errorMessage, testCase = '') {
  // Common error patterns and their explanations
  const errorPatterns = {
    'compilation error': {
      cause: 'Code has syntax errors or missing dependencies',
      suggestions: ['Check for missing semicolons, brackets, or parentheses', 'Verify all imports and dependencies are correct']
    },
    'runtime error': {
      cause: 'Error occurred during code execution',
      suggestions: ['Check for null pointer exceptions', 'Verify array bounds', 'Handle edge cases']
    },
    'timeout': {
      cause: 'Code execution took too long',
      suggestions: ['Optimize algorithm complexity', 'Check for infinite loops', 'Use more efficient data structures']
    },
    'memory': {
      cause: 'Code used too much memory',
      suggestions: ['Optimize memory usage', 'Use more efficient data structures', 'Avoid storing unnecessary data']
    },
    'index': {
      cause: 'Array or string index out of bounds',
      suggestions: ['Check array/string bounds before accessing', 'Verify loop conditions', 'Handle empty arrays/strings']
    },
    'null': {
      cause: 'Null pointer or undefined variable access',
      suggestions: ['Initialize variables before use', 'Check for null/undefined values', 'Use proper error handling']
    },
    'type': {
      cause: 'Type mismatch or conversion error',
      suggestions: ['Check variable types', 'Use proper type casting', 'Validate input types']
    }
  };

  // Analyze error message for common patterns
  let matchedPattern = null;
  const lowerError = errorMessage.toLowerCase();
  
  for (const [pattern, info] of Object.entries(errorPatterns)) {
    if (lowerError.includes(pattern)) {
      matchedPattern = info;
      break;
    }
  }

  // Default analysis if no pattern matches
  if (!matchedPattern) {
    matchedPattern = {
      cause: 'Unknown error occurred',
      suggestions: ['Review the error message carefully', 'Check code logic and syntax', 'Test with different inputs']
    };
  }

  // Generate basic code snippet suggestion
  let codeSnippet = code;
  if (language === 'python' && lowerError.includes('indentation')) {
    codeSnippet = '# Fix indentation errors\n' + code.split('\n').map(line => line.trim() ? '    ' + line.trim() : line).join('\n');
  } else if (language === 'java' && lowerError.includes('semicolon')) {
    codeSnippet = '// Add missing semicolons\n' + code;
  } else if (language === 'cpp' && lowerError.includes('include')) {
    codeSnippet = '#include <iostream>\n#include <vector>\n#include <string>\n\n' + code;
  }

  return {
    errorLocation: 'Unable to determine exact location without AI analysis',
    errorCause: matchedPattern.cause,
    fixSuggestion: matchedPattern.suggestions.join('. '),
    codeSnippet: codeSnippet,
    preventionTips: [
      'Test your code with various inputs',
      'Use proper error handling',
      'Follow language-specific best practices',
      'Use debugging tools and print statements'
    ],
    isCommonMistake: true,
    note: 'This is a basic analysis. For detailed AI-powered analysis, please check your API quotas.'
  };
}

async function getOpenAIErrorAnalysis(code, language, errorMessage, testCase = '') {
  try {
    const prompt = `
You are an expert software engineer and debugging specialist.
Analyze the following ${language} code that produced an error:

\`\`\`${language}
${code}
\`\`\`

The error message is:
\`\`\`
${errorMessage}
\`\`\`

${testCase ? `The input that caused the error was:\n\`\`\`\n${testCase}\n\`\`\`\n\n` : ''}

Please provide a detailed analysis including:
1. The exact location of the error in the code
2. What caused the error
3. How to fix it
4. A corrected code snippet
5. Tips to prevent similar errors in the future
6. Whether this is a common mistake that beginners make

Format your response as JSON with the following structure:
{
  "errorLocation": "...",
  "errorCause": "...",
  "fixSuggestion": "...",
  "codeSnippet": "...",
  "preventionTips": ["..."],
  "isCommonMistake": true/false
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    const text = completion.choices[0].message.content;
    const jsonStr = text.replace(/```json\s*|```/g, '');

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("OpenAI error analysis failed:", error.message);
    // If it's a quota error, provide a more helpful message
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.warn('OpenAI quota exceeded, falling back to basic analysis');
      return getBasicErrorAnalysis(code, language, errorMessage, testCase);
    }
    // For other errors, still provide basic analysis
    return getBasicErrorAnalysis(code, language, errorMessage, testCase);
  }
}

module.exports = {
  analyzeCode,
  analyzeCodeError
};

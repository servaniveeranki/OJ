const axios = require('axios');
const { normalizeOutput, deepCompare } = require('../utils/inputParser');

function assembleFullCode(problem, userCode, language, testInput) {
  if (language === 'javascript') {
    // Build function header
    const header = `function ${problem.functionName}${problem.functionSignature} {`;
    const functionCode = `${header}\n${userCode}\n}`;
    // Test harness: parse input string into arguments
    // Handles cases like '[1,2,3], 4' -> twoSum([1,2,3], 4)
    const testCode = `
// Parse input string into arguments
const __inputs = (function() {
  // Split on commas not inside brackets
  const input = ${JSON.stringify(testInput)};
  const result = [];
  let curr = '', depth = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '[' || c === '{' || c === '(') depth++;
    if (c === ']' || c === '}' || c === ')') depth--;
    if (c === ',' && depth === 0) {
      result.push(curr.trim()); curr = '';
    } else {
      curr += c;
    }
  }
  if (curr.trim().length > 0) result.push(curr.trim());
  return result.map(x => eval(x));
})();
let __result;
const __ret = ${problem.functionName}(...__inputs);
if (typeof __ret === 'undefined' && Array.isArray(__inputs[0])) {
  __result = __inputs[0];
} else {
  __result = __ret;
}
console.log(__result);`;
    return `${functionCode}\n${testCode}`;
  } else if (language === 'python') {
    // Build function header
    const header = `def ${problem.functionName}${problem.functionSignature}`;
    const functionCode = `${header}\n${userCode}`;
    // Test harness: parse input string into arguments
    const testCode = `\nimport ast\n__inputs = []\n_input = '''${testInput}'''.strip()\ncurr = ''\ndepth = 0\nfor c in _input:\n    if c in '[{(':\n        depth += 1\n    if c in ']})':\n        depth -= 1\n    if c == ',' and depth == 0:\n        __inputs.append(curr.strip())\n        curr = ''\n    else:\n        curr += c\nif curr.strip():\n    __inputs.append(curr.strip())\n__inputs = [ast.literal_eval(x) for x in __inputs]\nprint(${problem.functionName}(*__inputs))`;
    return `${functionCode}\n${testCode}`;
  }
  // Fallback: just return user code
  return userCode;
}


async function executeUserCode({ problem, code, language }) {
  const results = [];

  for (let i = 0; i < problem.testCases.length; i++) {
    const testCase = problem.testCases[i];
    const result = {
      idx: i,
      input: testCase.input,
      expected: testCase.output
    };

    try {
      const fullCode = assembleFullCode(problem, code, language, testCase.input);
      const start = Date.now();
      const execRes = await axios.post('http://localhost:5000/api/execute', {
        language,
        code: fullCode,
        input: '' // input is now handled in the code
      });

      const raw = execRes.data.stdout;
      const err = execRes.data.error || '';
      const time = Date.now() - start;

      result.output = normalizeOutput(raw);
      result.error = err;
      result.time = `${time}ms`;
      result.passed = deepCompare(testCase.output, raw) && !err;
    } catch (e) {
      result.output = '';
      result.error = e.message;
      result.passed = false;
      result.time = 'N/A';
    }

    results.push(result);
  }

  return results;
}

module.exports = { executeUserCode };

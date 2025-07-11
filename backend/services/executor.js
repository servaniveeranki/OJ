
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
const _ret = ${problem.functionName}(..._inputs);
if (typeof _ret === 'undefined' && Array.isArray(_inputs[0])) {
  __result = __inputs[0];
} else {
  __result = _ret;
}
console.log(__result);`;
    return `${functionCode}\n${testCode}`;
  } else if (language === 'python') {
    // Build function header
    const header = `def ${problem.functionName}${problem.functionSignature}`;
    const functionCode = `${header}\n${userCode}`;
    // Test harness: parse input string into arguments
    const testCode = `
import ast
__inputs = []
_input = '''${testInput}'''.strip()
curr = ''
depth = 0
for c in _input:
    if c in '[{(':
        depth += 1
    if c in ']})':
        depth -= 1
    if c == ',' and depth == 0:
        __inputs.append(curr.strip())
        curr = ''
    else:
        curr += c
if curr.strip():
    __inputs.append(curr.strip())
__inputs = [ast.literal_eval(x) for x in __inputs]
print(${problem.functionName}(*__inputs))`;
    return `${functionCode}\n${testCode}`;
  }
  
  else if(language === 'cpp'){
    const includes = `
    #include <iostream>
    #include <vector>
    #include <string>
    #include <sstream>
    #include <algorithm>
    #include <iterator>
    #include <unordered_map>
    using namespace std;
    `;
    
        const functionCode = userCode;
        const input = testInput;
    
        // Parse the function signature to extract param names
        const signature = problem.functionSignature;
        const returnType = signature.substring(0, signature.indexOf(problem.functionName)).trim();

        console.log("RETURN TYPE : ", returnType);
        const paramListStr = signature.substring(signature.indexOf('(') + 1, signature.lastIndexOf(')'));
        const paramPairs = paramListStr.split(',').map(param => {
            const parts = param.trim().split(/\s+/); // split by space
            const type = parts.slice(0, -1).join(' ');
            const name = parts[parts.length - 1];
            return { type, name };
        });
    
        // Parse input string into separate arguments
        // const splitInputs = (() => {
        //     const result = [];
        //     let curr = '', depth = 0;
        //     for (let i = 0; i < input.length; i++) {
        //         const c = input[i];
        //         if (c === '[' || c === '{' || c === '(') depth++;
        //         if (c === ']' || c === '}' || c === ')') depth--;
        //         if (c === ',' && depth === 0) {
        //             result.push(curr.trim());
        //             curr = '';
        //         } else {
        //             curr += c;
        //         }
        //     }
        //     if (curr.trim().length > 0) result.push(curr.trim());
        //     return result;
        // })();

        const splitInputs = (() => {
  const result = [];
  let curr = '', depth = 0, inString = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"' && input[i - 1] !== '\\') {
      inString = !inString; // toggle string mode
    }
    if (!inString) {
      if (c === '[' || c === '{' || c === '(') depth++;
      if (c === ']' || c === '}' || c === ')') depth--;
      if (c === ',' && depth === 0) {
        result.push(curr.trim());
        curr = '';
        continue;
      }
    }
    curr += c;
  }
  if (curr.trim().length > 0) result.push(curr.trim());
  // STRIP variable names like 'nums = [2,7,11,15]'
  return result.map(x => {
    const eqIdx = x.indexOf('=');
    if (eqIdx !== -1) return x.slice(eqIdx + 1).trim();
    return x.trim();
  });
})();
        
    
        let inputParsingCode = ``;
        paramPairs.forEach((param, index) => {
            const arg = splitInputs[index];
            if (param.type.includes("vector")) {
                inputParsingCode += `
        string ${param.name}Str = ${JSON.stringify(arg)};
        ${param.name}Str.erase(remove(${param.name}Str.begin(), ${param.name}Str.end(), '['), ${param.name}Str.end());
        ${param.name}Str.erase(remove(${param.name}Str.begin(), ${param.name}Str.end(), ']'), ${param.name}Str.end());
        stringstream ss_${param.name}(${param.name}Str);
        vector<int> ${param.name};
        int temp_${param.name};
        while (ss_${param.name} >> temp_${param.name}) {
            ${param.name}.push_back(temp_${param.name});
            if (ss_${param.name}.peek() == ',') ss_${param.name}.ignore();
        }`;
            }
            else if (param.type === 'int' || param.type === 'double') {
                inputParsingCode += `
        ${param.type} ${param.name} = ${arg};`;
            }
            else if (param.type === 'string') {
              // Strip outer quotes if present (e.g., from "babad")
              let cleaned = arg.trim();
              if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                cleaned = cleaned.slice(1, -1);
              }
              inputParsingCode += `
              string ${param.name} = "${cleaned.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";`;
            }
            
            else {
                inputParsingCode += `
        // Unrecognized type for input: ${param.type} ${param.name}`;
            }
        });
    
        const mainCallArgs = paramPairs.map(p => p.name).join(', ');
        let printCode = '';
        if (returnType === 'vector<int>') {
            printCode = `
    cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        cout << res[i];
        if (i != res.size() - 1) cout << ",";
    }
    cout << "]";`;
        } else if (returnType === 'bool') {
            
            printCode = `cout << (res ? "true" : "false");`;
        } else if (returnType === 'string') {
          printCode = `cout << '"' << res << '"';`;
        } else {
            // Default for int, double, float, etc.
            printCode = `cout << res;`;
        }

        const mainCode = `
        int main() {
            ${inputParsingCode}

            auto res = ${problem.functionName}(${mainCallArgs});
            ${printCode}
            cout << endl;
            return 0;
        }
        `;
        console.log("==== CPP FINAL FULL CODE ====");
        console.log(`${includes}\n${functionCode}\n${mainCode}`);
        console.log("==============================");
    
        return `${includes}\n${functionCode}\n${mainCode}`;
  }
}


async function executeUserCode({ problem, testCases, code, language }) {
  const results = [];

  console.log("---------------------------------------------");
  console.log("PROBLEM", problem);
  console.log("---------------------------------------------");

  for (let i = 0; i < testCases.length; i++) {
    const { input: testCaseInput, output: testCaseOutput } = testCases[i];

    const result = {
      idx: i,
      input: testCaseInput,
      expected: testCaseOutput
    };

    try {
      const fullCode = assembleFullCode(problem, code, language, testCaseInput);
      const start = Date.now();

      const execRes = await axios.post('http://localhost:5000/api/execute', {
        language,
        code: fullCode,
        input: testCaseInput // still sent for stdin compatibility
      });

      const raw = execRes.data.stdout;
      const err = execRes.data.error || '';
      const time = Date.now() - start;

      console.log("-----------------------------------------------");
      console.log("RAW", raw);
      console.log("-----------------------------------------------");

      const actual = normalizeOutput(raw);
      const expected = normalizeOutput(testCaseOutput);

      result.output = actual;
      result.error = err;
      result.time = `${time}ms`;
      result.passed = deepCompare(expected, actual, problem.title) && !err;

      console.log("-----------------------------------------------");
      console.log("OUTPUT", result.output);
      console.log("-----------------------------------------------");
      console.log("EXPECTED", expected);
      console.log("ACTUAL", actual);
      console.log("RESULT", result.passed);
      console.log("-----------------------------------------------");

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
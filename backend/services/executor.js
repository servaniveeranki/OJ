const axios = require('axios');
const { normalizeOutput, deepCompare } = require('../utils/inputParser');

function assembleFullCode(problem, userCode, language, testInput) {
  if (language === 'java') {
    const className = 'Main'; // must match file name Main.java in executor
    const functionCode = userCode.trim();

    const signature = problem.functionSignature;
    const paramListStr = signature.substring(signature.indexOf('(') + 1, signature.lastIndexOf(')'));
    const params = paramListStr.split(',').map(param => param.trim().split(/\s+/).pop());

    const inputs = (() => {
      const result = [];
      let curr = '', depth = 0;
      for (let i = 0; i < testInput.length; i++) {
        const c = testInput[i];
        if (c === '[' || c === '{' || c === '(') depth++;
        if (c === ']' || c === '}' || c === ')') depth--;
        if (c === ',' && depth === 0) {
          result.push(curr.trim()); curr = '';
        } else {
          curr += c;
        }
      }
      if (curr.trim().length > 0) result.push(curr.trim());
      return result.map(x => {
        const eqIdx = x.indexOf('=');
        return eqIdx !== -1 ? x.slice(eqIdx + 1).trim() : x.trim();
      });
    })();

    let inputParsing = '';
    let argsList = '';
    params.forEach((name, idx) => {
      const val = inputs[idx];
      if (val.startsWith("\"") || isNaN(val)) {
        inputParsing += `String ${name} = ${val};\n        `;
      } else if (val.includes(".")) {
        inputParsing += `double ${name} = ${val};\n        `;
      } else {
        inputParsing += `int ${name} = ${val};\n        `;
      }
      argsList += `${name}, `;
    });
    argsList = argsList.replace(/, $/, '');

    const testCode = `
public class ${className} {
    ${functionCode}

    public static void main(String[] args) {
        ${inputParsing}
        System.out.println(${problem.functionName}(${argsList}));
    }
}`;
    return testCode;

  } else if (language === 'python') {
    const header = `def ${problem.functionName}${problem.functionSignature}:`;
    const indentedUserCode = userCode
      .split('\n')
      .map(line => '    ' + line)
      .join('\n');

    const testCode = `
import ast
_input = '''${testInput}'''.strip()
__inputs = []
curr = ''
depth = 0
for c in _input:
    if c in '[{(':
        depth += 1
    elif c in ']})':
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

    return `${header}\n${indentedUserCode}\n${testCode}`;
  }

  // C++ (already good)
  else if (language === 'cpp') {
    const includes = `
#include <iostream>
#include <vector>
#include <string>
#include <climits> 
#include <sstream>
#include <algorithm>
#include <iterator>
#include <unordered_map>
using namespace std;
`;

    const functionCode = userCode;
    const input = testInput;

    const signature = problem.functionSignature;
    const returnType = signature.substring(0, signature.indexOf(problem.functionName)).trim();
    const paramListStr = signature.substring(signature.indexOf('(') + 1, signature.lastIndexOf(')'));
    const paramPairs = paramListStr.split(',').map(param => {
      const parts = param.trim().split(/\s+/);
      return {
        type: parts.slice(0, -1).join(' '),
        name: parts[parts.length - 1]
      };
    });

    const splitInputs = (() => {
      const result = [];
      let curr = '', depth = 0, inString = false;
      for (let i = 0; i < input.length; i++) {
        const c = input[i];
        if (c === '"' && input[i - 1] !== '\\') {
          inString = !inString;
        }
        if (!inString) {
          if (c === '[' || c === '{' || c === '(') depth++;
          if (c === ']' || c === '}' || c === ')') depth--;
          if (c === ',' && depth === 0) {
            result.push(curr.trim()); curr = ''; continue;
          }
        }
        curr += c;
      }
      if (curr.trim().length > 0) result.push(curr.trim());
      return result.map(x => {
        const eqIdx = x.indexOf('=');
        return eqIdx !== -1 ? x.slice(eqIdx + 1).trim() : x.trim();
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
      } else if (param.type === 'int' || param.type === 'double') {
        inputParsingCode += `\n${param.type} ${param.name} = ${arg};`;
      } else if (param.type === 'string') {
        let cleaned = arg.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.slice(1, -1);
        }
        inputParsingCode += `\nstring ${param.name} = "${cleaned.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";`;
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
        input: testCaseInput // for stdin languages
      });

      const raw = execRes.data.stdout || '';
      const err = execRes.data.error || '';
      const time = Date.now() - start;

      const actual = normalizeOutput(raw);
      const expected = normalizeOutput(testCaseOutput);

      result.output = actual;
      result.error = err;
      result.time = `${time}ms`;
      result.passed = deepCompare(expected, actual, problem.title) && !err;

      console.log("-----------------------------------------------");
      console.log("OUTPUT", result.output);
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

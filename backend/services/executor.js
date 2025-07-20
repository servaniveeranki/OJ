const axios = require('axios');
const { normalizeOutput, deepCompare } = require('../utils/inputParser');

function assembleFullCode(problem, userCode, language, testInput) {
  if (language === 'java') {
    const className = 'Main';
    const functionCode = userCode.trim();
  
    const signature = problem.functionSignature;
    console.log("==== JAVA DEBUG INFO ====");
    console.log("Function Signature:", signature);
    console.log("Function Name:", problem.functionName);
    console.log("Test Input:", testInput);
    
    let returnType = signature.substring(0, signature.indexOf(problem.functionName)).trim();
  
    // Fix common type mismatches and map C++ types to Java types
    if (returnType === 'bool') returnType = 'boolean';
    if (returnType === 'string') returnType = 'String';
    if (returnType.includes('vector<int>')) returnType = 'int[]';
    if (returnType.includes('vector<string>')) returnType = 'String[]';
    if (returnType.includes('vector<double>')) returnType = 'double[]';
    if (returnType.includes('vector<bool>')) returnType = 'boolean[]';
    if (returnType.includes('vector<')) {
      // Generic vector mapping
      returnType = returnType.replace(/vector<(.+)>/, '$1[]');
    }
  
    // Inject 'static' into the method declaration
    // Make all methods static
    const staticFunctionCode = functionCode
    // Only add `static` if it's not already there
    .replace(
      new RegExp(`\\b(public\\s+)(?!static)(${returnType})\\s+${problem.functionName}\\b`),
      `public static $2 ${problem.functionName}`
    )
    // Add static to any other `public` methods missing `static`
    .replace(/public\s+(?!static)(\w[\s\S]*?)\s+(\w+)\s*\(/g, 'public static $1 $2(');
  

  
    const paramListStr = signature.substring(signature.indexOf('(') + 1, signature.lastIndexOf(')'));
    const paramPairs = paramListStr.split(',').map(param => {
      const parts = param.trim().split(/\s+/);
      return {
        type: parts.slice(0, -1).join(' '),
        name: parts[parts.length - 1]
      };
    });
    
    // Map C++ types to Java types for parameters
    paramPairs.forEach(param => {
      if (param.type.includes('vector<int>')) param.type = 'int[]';
      if (param.type.includes('vector<string>')) param.type = 'String[]';
      if (param.type.includes('vector<double>')) param.type = 'double[]';
      if (param.type.includes('vector<bool>')) param.type = 'boolean[]';
      if (param.type.includes('vector<')) {
        param.type = param.type.replace(/vector<(.+)>/, '$1[]');
      }
      if (param.type === 'string') param.type = 'String';
      if (param.type === 'bool') param.type = 'boolean';
    });
  
    const splitInputs = (() => {
      const result = [];
      let curr = '', depth = 0, inString = false;
      for (let i = 0; i < testInput.length; i++) {
        const c = testInput[i];
        if (c === '"' && testInput[i - 1] !== '\\') inString = !inString;
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
  
    let inputParsingCode = '';
    paramPairs.forEach((param, index) => {
      const arg = splitInputs[index];
      const { type, name } = param;
  
      if (type.includes('[]') || type.includes('List<')) {
        if (type.includes('int')) {
          inputParsingCode += `
          String ${name}Str = ${JSON.stringify(arg)};
          ${name}Str = ${name}Str.replace("[", "").replace("]", "").trim();
          String[] ${name}Parts = ${name}Str.split(",");
          int[] ${name} = new int[${name}Parts.length];
          for (int i = 0; i < ${name}Parts.length; i++) {
              ${name}[i] = Integer.parseInt(${name}Parts[i].trim());
          }`;
        } else if (type.includes('String')) {
          inputParsingCode += `
          String ${name}Str = ${JSON.stringify(arg)};
          ${name}Str = ${name}Str.replace("[", "").replace("]", "").trim();
          String[] ${name} = ${name}Str.split(",");
          for (int i = 0; i < ${name}.length; i++) {
              ${name}[i] = ${name}[i].trim().replaceAll("\\\"", "").replaceAll("^\"|\"$", "");
          }`;
        }
      } else if (type === 'int' || type === 'Integer') {
        inputParsingCode += `\n        int ${name} = ${arg};`;
      } else if (type === 'double' || type === 'Double') {
        inputParsingCode += `\n        double ${name} = ${arg};`;
      } else if (type === 'boolean' || type === 'Boolean') {
        inputParsingCode += `\n        boolean ${name} = ${arg.toLowerCase()};`;
      } else if (type === 'String') {
        let cleaned = arg.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.slice(1, -1);
        }
        inputParsingCode += `\n        String ${name} = "${cleaned.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";`;
      }
       else if (type === 'char') {
        let cleaned = arg.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.slice(1, -1);
        }
        inputParsingCode += `\n        char ${name} = '${cleaned.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}';`;
      }
    });
  
    const mainCallArgs = paramPairs.map(p => p.name).join(', ');
    let printCode = '';
  
    if (returnType.includes('int[]')) {
      printCode = `
          System.out.print("[");
          for (int i = 0; i < result.length; i++) {
              System.out.print(result[i]);
              if (i < result.length - 1) System.out.print(",");
          }
          System.out.print("]");`;
    } else if (returnType.includes('String[]')) {
      printCode = `
          System.out.print("[");
          for (int i = 0; i < result.length; i++) {
              System.out.print("\\"" + result[i] + "\\"");
              if (i < result.length - 1) System.out.print(",");
          }
          System.out.print("]");`;
    } else if (returnType === 'boolean') {
      printCode = `System.out.print(result ? "true" : "false");`;
    } else if (returnType === 'String') {
      printCode = `System.out.print("\\"" + result + "\\"");`;
    } else {
      printCode = `System.out.print(result);`;
    }
  
    // Add necessary imports
    const imports = `
import java.util.*;
import java.io.*;
`;

    const testCode = `${imports}
    public class ${className} {
        ${staticFunctionCode}
    
        public static void main(String[] args) {${inputParsingCode}
            ${returnType} result = ${problem.functionName}(${mainCallArgs});
            ${printCode}
        }
    }`;
  
    console.log("==== JAVA FINAL FULL CODE ====");
    console.log(testCode);
    console.log("=============================");
  
    return testCode;
  }
  
  else if (language === 'python') {
    const functionCode = userCode.trim();
    
    const signature = problem.functionSignature;
    console.log("==== PYTHON DEBUG INFO ====");
    console.log("Function Signature:", signature);
    console.log("Function Name:", problem.functionName);
    console.log("Test Input:", testInput);
    
    // Extract return type and parameters from signature
    let returnType = signature.substring(0, signature.indexOf(problem.functionName)).trim();
    
    // Map C++ types to Python types
    if (returnType.includes('vector<int>')) returnType = 'List[int]';
    if (returnType.includes('vector<string>')) returnType = 'List[str]';
    if (returnType.includes('vector<double>')) returnType = 'List[float]';
    if (returnType.includes('vector<bool>')) returnType = 'List[bool]';
    if (returnType.includes('vector<')) {
      returnType = returnType.replace(/vector<(.+)>/, 'List[$1]');
    }
    if (returnType === 'string') returnType = 'str';
    if (returnType === 'bool') returnType = 'bool';
    
    const paramListStr = signature.substring(signature.indexOf('(') + 1, signature.lastIndexOf(')'));
    const paramPairs = paramListStr.split(',').map(param => {
      const parts = param.trim().split(/\s+/);
      let type = parts.slice(0, -1).join(' ');
      
      // Map C++ types to Python types for parameters
      if (type.includes('vector<int>')) type = 'List[int]';
      if (type.includes('vector<string>')) type = 'List[str]';
      if (type.includes('vector<double>')) type = 'List[float]';
      if (type.includes('vector<bool>')) type = 'List[bool]';
      if (type.includes('vector<')) {
        type = type.replace(/vector<(.+)>/, 'List[$1]');
      }
      if (type === 'string') type = 'str';
      if (type === 'bool') type = 'bool';
      
      return {
        type: type,
        name: parts[parts.length - 1]
      };
    });
    
    // Parse test input
    const splitInputs = (() => {
      const result = [];
      let curr = '', depth = 0, inString = false;
      for (let i = 0; i < testInput.length; i++) {
        const c = testInput[i];
        if (c === '"' && testInput[i - 1] !== '\\') inString = !inString;
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
    
    // Generate input parsing code
    let inputParsingCode = '';
    paramPairs.forEach((param, index) => {
      const arg = splitInputs[index];
      const { type, name } = param;
      
      if (type.includes('List[') || type.includes('list')) {
        inputParsingCode += `${name} = ${arg}\n`;
      } else if (type === 'int') {
        inputParsingCode += `${name} = ${arg}\n`;
      } else if (type === 'float' || type === 'double') {
        inputParsingCode += `${name} = ${arg}\n`;
      } else if (type === 'bool') {
        inputParsingCode += `${name} = ${arg.toLowerCase()}\n`;
      } else if (type === 'str' || type === 'string') {
        let cleaned = arg.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.slice(1, -1);
        }
        inputParsingCode += `${name} = "${cleaned.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`;
      } else {
        inputParsingCode += `${name} = ${arg}\n`;
      }
    });
    
    const mainCallArgs = paramPairs.map(p => p.name).join(', ');
    
    const testCode = `
from typing import List, Optional
import json
import sys

def safe_json_dumps(obj):
    """Safely convert object to JSON string"""
    try:
        if obj is None:
            return "null"
        elif isinstance(obj, bool):
            return "true" if obj else "false"
        elif isinstance(obj, (int, float)):
            return str(obj)
        elif isinstance(obj, str):
            return json.dumps(obj)
        elif isinstance(obj, (list, tuple)):
            return json.dumps(list(obj))
        elif isinstance(obj, dict):
            return json.dumps(obj)
        else:
            # For any other type, convert to string and then to JSON
            return json.dumps(str(obj))
    except Exception as e:
        # If all else fails, return the string representation as JSON
        return json.dumps(str(obj))

# User's solution code
${functionCode}

# Test execution
try:
${inputParsingCode}
    result = ${problem.functionName}(${mainCallArgs})
    print(safe_json_dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))`;
    
    console.log("==== PYTHON FINAL FULL CODE ====");
    console.log(testCode);
    console.log("==============================");
    
    return testCode;
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
    } else if (returnType === 'vector<vector<int>>') {
      printCode = `
cout << "[";
for (size_t i = 0; i < res.size(); ++i) {
    cout << "[";
    for (size_t j = 0; j < res[i].size(); ++j) {
        cout << res[i][j];
        if (j != res[i].size() - 1) cout << ",";
    }
    cout << "]";
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

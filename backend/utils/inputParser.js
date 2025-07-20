function normalizeOutput(output) {
  return (output || '').trim().replace(/\r/g, '');
}

function isPalindrome(str) {
  const clean = str.replace(/^"|"$/g, '');
  return clean === clean.split('').reverse().join('');
}

function safeJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.log('JSON parse error for string:', str);
    console.log('Error:', error.message);
    // Return the original string if JSON parsing fails
    return str;
  }
}

function deepCompare(expected, actual, problemTitle = '') {
  try {
    const e = expected.trim();
    const a = actual.trim();
    
    console.log("-----------------------------------------------");
    console.log("EXPECTED", e);
    console.log("ACTUAL", a);
    console.log("-----------------------------------------------");

    if (problemTitle === "Longest Palindromic Substring") {
      const expectedParsed = safeJSONParse(e);
      const actualParsed = safeJSONParse(a);
      
      // Handle case where parsing failed
      if (typeof expectedParsed === 'string' || typeof actualParsed === 'string') {
        return e === a;
      }
      
      const expectedLength = expectedParsed.length || expectedParsed;
      const actualString = actualParsed;
      return actualString.length === expectedLength && isPalindrome(actualString);
    }

    // Try to parse both as JSON for comparison
    const expectedParsed = safeJSONParse(e);
    const actualParsed = safeJSONParse(a);
    
    // If both parsed successfully, compare the parsed values
    if (typeof expectedParsed !== 'string' && typeof actualParsed !== 'string') {
      return JSON.stringify(expectedParsed) === JSON.stringify(actualParsed);
    }
    
    // Otherwise, compare as strings
    return e === a;
  } catch (err) {
    console.log('deepCompare error:', err.message);
    return normalizeOutput(actual) === normalizeOutput(expected);
  }
}

module.exports = {
  normalizeOutput,
  deepCompare
};

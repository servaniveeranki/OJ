function normalizeOutput(output) {
  return (output || '').trim().replace(/\r/g, '');
}

function isPalindrome(str) {
  const clean = str.replace(/^"|"$/g, '');
  return clean === clean.split('').reverse().join('');
}

function deepCompare(expected, actual, problemTitle = '') {
  try {
    const e = JSON.stringify(eval(`${expected}`));
    const a = JSON.stringify(eval(`${actual}`));

    console.log("-----------------------------------------------");
    console.log("EXPECTED", e);
    console.log("ACTUAL", a);
    console.log("-----------------------------------------------");

    if (problemTitle === "Longest Palindromic Substring") {
      const expectedLength = JSON.parse(e).length;
      const actualString = JSON.parse(a);
      return actualString.length === expectedLength && isPalindrome(actualString);
    }

    return e === a;
  } catch (err) {
    return normalizeOutput(actual) === normalizeOutput(expected);
  }
}

module.exports = {
  normalizeOutput,
  deepCompare
};

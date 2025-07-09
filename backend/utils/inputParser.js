function normalizeOutput(output) {
    return (output || '').trim().replace(/\r/g, '');
  }
  
  function deepCompare(expected, actual) {
    try {
      const e = JSON.stringify(eval(`(${expected})`));
      const a = JSON.stringify(eval(`(${actual})`));
      return e === a;
    } catch {
      return normalizeOutput(actual) === normalizeOutput(expected);
    }
  }
  
  module.exports = {
    normalizeOutput,
    deepCompare
  };
  
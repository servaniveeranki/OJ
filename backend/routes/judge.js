const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const axios = require('axios');

// Normalize output for whitespace and carriage returns
function normalizeOutput(output) {
    return (output || '').trim().replace(/\r/g, '');
}

// Deep compare for strings, arrays, numbers using eval + JSON.stringify
function deepCompare(expected, actual) {
    try {
        const e = JSON.stringify(eval(`(${expected})`));
        const a = JSON.stringify(eval(`(${actual})`));
        return e === a;
    } catch {
        // fallback to simple string compare
        return normalizeOutput(actual) === normalizeOutput(expected);
    }
}

router.post('/', async (req, res) => {
    const { problemId, language, code } = req.body;
    if (!problemId || !language || !code) {
        return res.status(400).json({ error: 'Missing problemId, language, or code' });
    }

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: 'Problem not found' });

        const testCases = problem.testCases || [];
        const results = [];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const judgeResult = {
                idx: i,
                input: testCase.input,
                expected: testCase.output
            };

            try {
                const startTime = Date.now();

                const execRes = await axios.post(
                    'http://localhost:5000/api/execute',
                    {
                        language,
                        code,
                        input: testCase.input
                    },
                    { timeout: 7000 }
                );

                const rawOutput = execRes.data.stdout;
                const errorOutput = execRes.data.error || '';
                const execTime = Date.now() - startTime;

                judgeResult.output = normalizeOutput(rawOutput);
                judgeResult.error = errorOutput;
                judgeResult.time = `${execTime}ms`;
                judgeResult.passed = deepCompare(testCase.output, rawOutput) && !errorOutput;
            } catch (err) {
                judgeResult.output = '';
                judgeResult.error = err.message || 'Execution error';
                judgeResult.passed = false;
                judgeResult.time = 'N/A';
            }

            results.push(judgeResult);
        }

        res.json({ results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

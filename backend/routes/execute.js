const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { analyzeCode, analyzeCodeError } = require('../services/ai');

// Util: Write code to temp file
function writeTempFile(extension, code, customName = null) {
    const filename = customName ? `${customName}.${extension}` : `${uuidv4()}.${extension}`;
    const filepath = path.join(__dirname, '../temp', filename);
    fs.writeFileSync(filepath, code);
    return filepath;
}

// Util: Cleanup temp files
function cleanupFiles(files) {
    for (const file of files) {
        if (fs.existsSync(file)) fs.unlinkSync(file);
    }
}

router.post('/', async (req, res) => {
    const { language, code, input, problemId } = req.body;
    if (!language || !code) {
        return res.status(400).json({ error: 'Missing language or code' });
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    let command;
    const cleanupList = [];

    try {
        if (language === 'python') {
            const sourceFile = writeTempFile('py', code);
            cleanupList.push(sourceFile);

            const execProcess = exec(`python "${sourceFile}"`, { timeout: 5000 }, async (error, stdout, stderr) => {
                cleanupFiles(cleanupList);
                
                // If there's an error, analyze it with AI
                if (error) {
                    try {
                        // Get AI analysis for the error
                        const errorAnalysis = await analyzeCodeError(code, language, error.message || stderr, input);
                        return res.json({ 
                            stdout, 
                            stderr, 
                            error: error.message,
                            aiAnalysis: errorAnalysis
                        });
                    } catch (aiError) {
                        console.error('Error analyzing code error:', aiError);
                        return res.json({ stdout, stderr, error: error.message });
                    }
                }
                
                res.json({ stdout, stderr });
            });

            if (input) {
                execProcess.stdin.write(input);
                execProcess.stdin.end();
            }

        } else if (language === 'cpp') {
            const sourceFile = writeTempFile('cpp', code);
            const execFile = sourceFile.replace('.cpp', process.platform === 'win32' ? '.exe' : '');
            const inputFile = sourceFile.replace('.cpp', '.txt');
            fs.writeFileSync(inputFile, input || '');

            cleanupList.push(sourceFile, execFile, inputFile);

            command = `g++ "${sourceFile}" -o "${execFile}" && "${execFile}"`;

            exec(command, { timeout: 5000 }, async (error, stdout, stderr) => {
                cleanupFiles(cleanupList);
                
                // If there's an error, analyze it with AI
                if (error) {
                    try {
                        // Get AI analysis for the error
                        const errorAnalysis = await analyzeCodeError(code, language, error.message || stderr, input);
                        return res.json({ 
                            stdout, 
                            stderr, 
                            error: error.message,
                            aiAnalysis: errorAnalysis
                        });
                    } catch (aiError) {
                        console.error('Error analyzing code error:', aiError);
                        return res.json({ stdout, stderr, error: error.message });
                    }
                }
                
                res.json({ stdout, stderr });
            });

        } else if (language === 'java') {
            const sourceFile = path.join(tempDir, 'Main.java');
            const inputFile = path.join(tempDir, 'input.txt');
            fs.writeFileSync(sourceFile, code);
            fs.writeFileSync(inputFile, input || '');

            const classFile = path.join(tempDir, 'Main.class');
            cleanupList.push(sourceFile, classFile, inputFile);

            const compileCmd = `javac "${sourceFile}"`;
            const runCmd = `java -cp "${tempDir}" Main < "${inputFile}"`;

            exec(`${compileCmd} && ${runCmd}`, { timeout: 5000 }, async (error, stdout, stderr) => {
                cleanupFiles(cleanupList);
                
                // If there's an error, analyze it with AI
                if (error) {
                    try {
                        // Get AI analysis for the error
                        const errorAnalysis = await analyzeCodeError(code, language, error.message || stderr, input);
                        return res.json({ 
                            stdout, 
                            stderr, 
                            error: error.message,
                            aiAnalysis: errorAnalysis
                        });
                    } catch (aiError) {
                        console.error('Error analyzing code error:', aiError);
                        return res.json({ stdout, stderr, error: error.message });
                    }
                }
                
                res.json({ stdout, stderr });
            });

        } else {
            return res.status(400).json({ error: 'Unsupported language' });
        }

    } catch (err) {
        cleanupFiles(cleanupList);
        res.status(500).json({ error: err.message });
    }
});

// AI code analysis endpoint
router.post('/analyze', async (req, res) => {
  const { code, language, problemId, passed } = req.body;
  
  if (!code || !language || !problemId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const analysis = await analyzeCode(code, language, problemId, passed || false);
    res.json(analysis);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({
      error: 'Failed to analyze code',
      message: error.message
    });
  }
});

// AI error analysis endpoint
router.post('/analyze-error', async (req, res) => {
  const { code, language, error, testCase } = req.body;
  
  if (!code || !language || !error) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const errorAnalysis = await analyzeCodeError(code, language, error, testCase || '');
    res.json(errorAnalysis);
  } catch (error) {
    console.error('Error in AI error analysis:', error);
    res.status(500).json({
      error: 'Failed to analyze code error',
      message: error.message
    });
  }
});

module.exports = router;

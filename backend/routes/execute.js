const express = require('express');
const router = express.Router();
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
    const { language, code, input } = req.body;
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

            command = `python "${sourceFile}"`;

            const execProcess = exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
                cleanupFiles(cleanupList);
                if (error) return res.json({ stdout, stderr, error: error.message });
                res.json({ stdout, stderr });
            });

            if (input) {
                execProcess.stdin.write(input);
                execProcess.stdin.end();
            }

        } else if (language === 'cpp') {
            const sourceFile = writeTempFile('cpp', code);
            const execFile = sourceFile.replace('.cpp', '.exe');
            const inputFile = sourceFile.replace('.cpp', '.txt');
            fs.writeFileSync(inputFile, input || '');

            cleanupList.push(sourceFile, execFile, inputFile);

            command = `g++ "${sourceFile}" -o "${execFile}" && "${execFile}" < "${inputFile}"`;

            exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
                cleanupFiles(cleanupList);
                if (error) return res.json({ stdout, stderr, error: error.message });
                res.json({ stdout, stderr });
            });

        } else if (language === 'java') {
            // Save code to Main.java
            const sourceFile = path.join(tempDir, 'Main.java');
            fs.writeFileSync(sourceFile, code);
            const inputFile = path.join(tempDir, 'input.txt');
            fs.writeFileSync(inputFile, input || '');

            cleanupList.push(sourceFile, path.join(tempDir, 'Main.class'), inputFile);

            command = `javac "${sourceFile}" && java -cp "${tempDir}" Main < "${inputFile}"`;

            exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
                cleanupFiles(cleanupList);
                if (error) return res.json({ stdout, stderr, error: error.message });
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

module.exports = router;


const express = require('express');
const router = express.Router();
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Util: Write code to temp file
function writeTempFile(extension, code, customName = null) {
    console.log("CUSTOM NAME : ", customName);
    console.log("EXTENSION : ", extension);
    const filename = customName ? `${customName}.${extension}` : `${uuidv4()}.${extension}`;
    console.log("FILENAME : ", filename);
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

            // For C++, we inject all input via code, so no need for stdin redirection
            command = `g++ "${sourceFile}" -o "${execFile}" && "${execFile}"`;
            console.log("-------------------------------------");
            console.log("COMMAND : ", command);
            console.log("TEST CASE INPUT:", input);
            console.log("GENERATED CODE SNIPPET:", code.slice(0, 300));
            console.log("-------------------------------------");

            exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
                cleanupFiles(cleanupList);
                if (error) return res.json({ stdout, stderr, error: error.message });
                res.json({ stdout, stderr });
            });
            // const isWindows = process.platform === 'win32';
            // const sourceFile = writeTempFile('cpp', code);
    
            // const execExt = isWindows ? '.exe' : '';
            // const execFile = sourceFile.replace('.cpp', execExt);
            // const inputFile = sourceFile.replace('.cpp', '.txt');
            // fs.writeFileSync(inputFile, input || '');

            // cleanupList.push(sourceFile, execFile, inputFile);

            // // Build compilation and run commands separately
            // const compileCmd = g++ "${sourceFile}" -o "${execFile}";
            // const runCmd = "${execFile}" < "${inputFile}";

            // console.log('>> COMPILE CMD:', compileCmd);
            // console.log('>> RUN CMD:', runCmd);

            // exec(compileCmd, { timeout: 5000 }, (compileErr, compileOut, compileErrOut) => {
            //     if (compileErr) {
            //         cleanupFiles(cleanupList);
            //         return res.json({ stdout: compileOut, stderr: compileErrOut, error: 'Compilation failed: ' + compileErr.message });
            //     }

            //     exec(runCmd, { timeout: 5000 }, (runErr, stdout, stderr) => {
            //         cleanupFiles(cleanupList);
            //         if (runErr) {
            //             return res.json({ stdout, stderr, error: runErr.message });
            //         }
            //         console.log("==========================================");
            //         console.log("STDOUT: ", stdout);
            //         console.log("==========================================");
            //         cleanupFiles(cleanupList);
            //         res.json({ stdout, stderr });
            //     });
            // });

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
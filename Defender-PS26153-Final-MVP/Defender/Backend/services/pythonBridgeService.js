import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PYTHON_ENGINE_DIR } from '../config/env.js';
import { logger } from '../logging/logger.js';

const pythonExe = process.platform === 'win32'
  ? path.join(PYTHON_ENGINE_DIR, 'venv', 'Scripts', 'python.exe')
  : path.join(PYTHON_ENGINE_DIR, 'venv', 'bin', 'python');

/**
 * Runs the Python ML engine as a subprocess via bridge.py -- JSON in on
 * stdin, JSON out on stdout. This is the only place Node talks to the
 * real forecasting model; nothing else in the backend imports Python
 * directly.
 */
export function runPythonBridge(payload) {
  return new Promise((resolve, reject) => {
    const bridgeScript = path.join(PYTHON_ENGINE_DIR, 'bridge.py');
    const pyPath = fs.existsSync(pythonExe) ? pythonExe : 'python3';

    const child = spawn(pyPath, [bridgeScript], {
      cwd: PYTHON_ENGINE_DIR,
      env: { ...process.env, PYTHONPATH: PYTHON_ENGINE_DIR },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      if (code !== 0) {
        logger.error('Python bridge exited non-zero:', stderr || `code ${code}`);
        return reject(new Error(stderr || `Python process exited with code ${code}`));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (err) {
        reject(new Error(`Failed to parse Python bridge output: ${err.message}`));
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

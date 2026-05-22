import { spawn } from 'node:child_process';
import path from 'node:path';

const COMFY_DIR = 'F:\\Aisaak\\Projects\\ComfyUI';
const PYTHON_EXE = path.join(COMFY_DIR, 'venv', 'Scripts', 'python.exe');
const COMFY_URL = 'http://127.0.0.1:18188';

export async function isComfyOnline() {
  try {
    const response = await fetch(COMFY_URL, { method: 'GET' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function waitForServer(timeoutMs = 120000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (await isComfyOnline()) return true;
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Timeout waiting for ComfyUI server to start.');
}

export async function ensureComfyRunning() {
  if (await isComfyOnline()) return;

  console.log('[Comfy Launcher] Applying Final 128-bit Bus Optimization for 4060 Ti 16GB...');

  const comfyProcess = spawn(PYTHON_EXE, [
    'main.py', 
    '--port', '18188', 
    '--weight-dtype', 'fp8_e4m3fn',
    '--use-split-cross-attention',
    '--preview-method', 'none',
    '--fast'
  ], {
    cwd: COMFY_DIR,
    detached: true,
    stdio: 'ignore',
    env: { 
      ...process.env, 
      PYTORCH_CUDA_ALLOC_CONF: 'expandable_segments:True' 
    }
  });

  comfyProcess.unref();
  await waitForServer();
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  ensureComfyRunning().catch(console.error);
}

import { spawn } from 'node:child_process';
import path from 'node:path';

const COMFY_DIR = 'F:\\Aisaak\\Projects\\ComfyUI';
const PYTHON_EXE = path.join(COMFY_DIR, 'venv', 'Scripts', 'python.exe');
const COMFY_URL = 'http://127.0.0.1:18188';

/**
 * Checks if the ComfyUI server is currently online.
 */
export async function isComfyOnline() {
  try {
    const response = await fetch(COMFY_URL, { method: 'GET' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Waits until the ComfyUI server is online.
 */
async function waitForServer(timeoutMs = 120000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (await isComfyOnline()) {
      return true;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Timeout waiting for ComfyUI server to start.');
}

/**
 * Ensures ComfyUI is running. If not, spawns it in the background.
 */
export async function ensureComfyRunning() {
  const online = await isComfyOnline();
  if (online) {
    console.log('[Comfy Launcher] ComfyUI is already running.');
    return;
  }

  console.log('[Comfy Launcher] ComfyUI is offline. Starting server in background...');

  // Spawn detached so it continues running even after this script finishes
  // Optimized for RTX 4060 Ti 16GB (128-bit bus) to lock models in VRAM
  const comfyProcess = spawn(PYTHON_EXE, [
    'main.py', 
    '--port', '18188', 
    '--fp8_e4m3fn-text-enc', 
    '--fp8_e4m3fn-unet', 
    '--gpu-only', 
    '--highvram', 
    '--disable-smart-memory',
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

  // Unref to allow the Node process to exit independently
  comfyProcess.unref();

  console.log('[Comfy Launcher] Server spawned (PID: ' + comfyProcess.pid + '). Waiting for it to become ready...');

  await waitForServer();
  console.log('[Comfy Launcher] ComfyUI is now online and ready to accept prompts!');
}

// Allow manual execution to just start the server
if (process.argv[1] === new URL(import.meta.url).pathname) {
  ensureComfyRunning().catch(console.error);
}

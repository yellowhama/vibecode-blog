import { exec } from 'node:child_process';
import util from 'node:util';

const execAsync = util.promisify(exec);
const COMFY_URL = 'http://127.0.0.1:18188';

/**
 * Gets the current queue status from ComfyUI.
 */
export async function getQueue() {
  try {
    const res = await fetch(`${COMFY_URL}/queue`);
    const data = await res.json();
    console.log('[Comfy Admin] Queue Status:');
    console.log(`- Pending Prompts: ${data.queue_pending.length}`);
    console.log(`- Running Prompts: ${data.queue_running.length}`);
    return data;
  } catch (e) {
    console.error('[Comfy Admin] Failed to fetch queue. Is server online?');
  }
}

/**
 * Interrupts the currently running generation.
 */
export async function interrupt() {
  try {
    const res = await fetch(`${COMFY_URL}/interrupt`, { method: 'POST' });
    if (res.ok) {
      console.log('[Comfy Admin] 🛑 Successfully interrupted current generation.');
    } else {
      console.error('[Comfy Admin] Failed to interrupt:', res.statusText);
    }
  } catch (e) {
    console.error('[Comfy Admin] Failed to interrupt. Is server online?');
  }
}

/**
 * Hard kills the ComfyUI server process listening on port 18188.
 */
export async function killServer() {
  console.log('[Comfy Admin] 💀 Attempting to kill ComfyUI server on port 18188...');
  const psCommand = `powershell -Command "$pidList = Get-NetTCPConnection -LocalPort 18188 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess; if ($pidList) { Stop-Process -Id $pidList -Force; Write-Host 'Killed.' } else { Write-Host 'Not Found.' }"`;
  
  try {
    const { stdout } = await execAsync(psCommand);
    if (stdout.includes('Killed')) {
      console.log('[Comfy Admin] Server successfully killed. VRAM released.');
    } else {
      console.log('[Comfy Admin] No server process found on port 18188.');
    }
  } catch (e) {
    console.error('[Comfy Admin] Failed to execute kill command:', e.message);
  }
}

// Allow CLI usage
const action = process.argv[2];
if (action === 'queue') getQueue();
else if (action === 'interrupt') interrupt();
else if (action === 'kill') killServer();
else if (action) console.log('Unknown action. Use: queue, interrupt, kill');

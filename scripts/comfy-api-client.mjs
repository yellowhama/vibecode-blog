import fs from 'node:fs/promises';
import path from 'node:path';

const COMFY_URL = 'http://127.0.0.1:18188';

/**
 * Queues a prompt workflow JSON to ComfyUI.
 */
export async function queuePrompt(prompt) {
  const p = { prompt, client_id: "vibecode-town-node" };
  const response = await fetch(`${COMFY_URL}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p)
  });

  if (!response.ok) {
    throw new Error(`Failed to queue prompt: ${response.statusText}`);
  }

  const data = await response.json();
  return data.prompt_id;
}

/**
 * Gets the history for a specific prompt ID.
 */
export async function getHistory(promptId) {
  const response = await fetch(`${COMFY_URL}/history/${promptId}`);
  if (!response.ok) {
    throw new Error(`Failed to get history: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Downloads the image binary from ComfyUI.
 */
export async function getImage(filename, subfolder, folder_type) {
  const params = new URLSearchParams({
    filename,
    subfolder,
    type: folder_type
  });
  
  const response = await fetch(`${COMFY_URL}/view?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to get image: ${response.statusText}`);
  }
  return await response.arrayBuffer();
}

/**
 * High-level orchestration: queues a prompt, polls until complete, and downloads the output images.
 * Returns an array of ArrayBuffer (the image data).
 */
export async function generateImageAndWait(prompt, pollingIntervalMs = 2000) {
  console.log("   [ComfyClient] Queuing prompt...");
  const promptId = await queuePrompt(prompt);
  console.log(`   [ComfyClient] Prompt queued with ID: ${promptId}. Waiting for generation...`);

  // Poll history
  let historyData = {};
  while (true) {
    historyData = await getHistory(promptId);
    if (historyData[promptId]) {
      break; // It's done!
    }
    await new Promise(r => setTimeout(r, pollingIntervalMs));
  }

  console.log("   [ComfyClient] Generation complete! Fetching image outputs...");
  const historyNode = historyData[promptId];
  
  const outputs = historyNode.outputs;
  const imageBuffers = [];

  for (const nodeId in outputs) {
    const nodeOutput = outputs[nodeId];
    if (nodeOutput.images) {
      for (const imageInfo of nodeOutput.images) {
        const imgBuffer = await getImage(imageInfo.filename, imageInfo.subfolder, imageInfo.type);
        imageBuffers.push(imgBuffer);
      }
    }
  }

  return imageBuffers;
}

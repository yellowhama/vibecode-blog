import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';
import { generateImageAndWait } from './comfy-api-client.mjs';
import { ensureComfyRunning } from './comfy-launcher.mjs';

// Base Styles
const STYLE = "masterpiece, best quality, ultra-cute anime style, moe, huge sparkling eyes, soft cel shading, clean lineart, vivid colors, white background, simple minimalist environment";

// Character Base Descriptions
const HANA_BASE = "Hana, 20yo mad scientist anime girl, huge round glasses, light blue twin-tails, oversized white lab coat";
const CHIP_BASE = "Chip, tiny cute robot shaped like a NEWT, white metallic body, monitor-head with Disney-style salamander face, long mechanical tail with tool tip";

// Pose & Expression Variations for Dataset Diversity
const VARIATIONS = [
  { pose: "standing, neutral expression, looking at camera", suffix: "neutral" },
  { pose: "jumping for joy, laughing, wild energetic gestures", suffix: "happy" },
  { pose: "sitting on the floor, pouting cutely, looking annoyed", suffix: "pout" },
  { pose: "running fast, determined face, speed lines", suffix: "running" },
  { pose: "working intensely on a futuristic laptop, glowing screen", suffix: "working" },
  { pose: "sleeping curled up, zzz icons, peaceful face", suffix: "sleeping" },
  { pose: "eating a giant chocolate chip cookie, crumbs on face", suffix: "eating" },
  { pose: "thinking, holding chin, lightbulb above head", suffix: "idea" },
  { pose: "scared, shaking, wide eyes, ghost in background", suffix: "scared" },
  { pose: "full body front view, T-pose, simple lighting", suffix: "reference_front" },
  { pose: "full body side view, neutral posture", suffix: "reference_side" },
  { pose: "full body back view, showing hair and coat details", suffix: "reference_back" }
];

async function generateBatch(charName, baseDesc, outDir, workflowTemplate) {
  console.log(`\n[Dataset Gen] Starting batch for ${charName.toUpperCase()}...`);
  await fs.mkdir(outDir, { recursive: true });

  for (let i = 0; i < VARIATIONS.length; i++) {
    const v = VARIATIONS[i];
    const fullPrompt = `${baseDesc}, ${v.pose}, ${STYLE}`;
    console.log(` -> [${i+1}/${VARIATIONS.length}] Generating: ${v.suffix}...`);

    const workflow = JSON.parse(workflowTemplate);
    workflow["5"].inputs.width = 1024;
    workflow["5"].inputs.height = 1024; // Square is better for training crops
    workflow["6"].inputs.text = fullPrompt;
    workflow["17"].inputs.steps = 35;
    workflow["16"].inputs.sampler_name = "dpmpp_2m_sde";
    workflow["25"].inputs.noise_seed = Math.floor(Math.random() * 1000000);
    workflow["9"].inputs.filename_prefix = `train_${charName}_${v.suffix}`;

    try {
      const imageBuffers = await generateImageAndWait(workflow, 10000);
      if (imageBuffers.length > 0) {
        const imgPath = path.join(outDir, `${i.toString().padStart(2, '0')}_${v.suffix}.png`);
        await fs.writeFile(imgPath, Buffer.from(imageBuffers[0]));
      }
    } catch (e) {
      console.error(`    Failed ${v.suffix}:`, e.message);
    }
  }
}

async function main() {
  await ensureComfyRunning();
  const templatePath = path.join(process.cwd(), 'scripts', 'comfy-flux-workflow.json');
  const templateStr = await fs.readFile(templatePath, 'utf8');

  const datasetDir = path.join(process.cwd(), '.vibecode', 'lora_dataset');
  
  // Generate Hana Dataset
  await generateBatch('hana', HANA_BASE, path.join(datasetDir, 'hana'), templateStr);
  
  // Generate Chip Dataset
  await generateBatch('chip', CHIP_BASE, path.join(datasetDir, 'chip'), templateStr);

  console.log('\n[Dataset Gen] COMPLETE! Dataset is ready in .vibecode/lora_dataset/');
}

main().catch(console.error);

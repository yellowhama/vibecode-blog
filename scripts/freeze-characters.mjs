import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';
import { generateImageAndWait } from './comfy-api-client.mjs';
import { ensureComfyRunning } from './comfy-launcher.mjs';

// The "Approved" Visual Style from Chip's successful images
const MASTER_STYLE = "masterpiece, best quality, ultra-detailed anime style, clean bold linework, cel shaded, vibrant flat colors, rounded chibi proportions, white background, simple 2D vector art, sharp focus";

// Fixed Chip Description based on user choice
const CHIP_FIXED = "Chip, cute humanoid robot, cream-white metallic body, orange accents, large rounded monitor-head, black screen face, huge glowing amber eyes, thick orange-colored salamander tail";

// Refined Hana to match Chip's cute style
const HANA_REFINED = "Hana, 20yo adorable mad scientist anime girl, oversized round glasses, light blue twin-tails with messy bun, oversized white lab coat, extremely energetic and cute";

const CHIP_VARIATIONS = [
  "holding a giant chocolate chip cookie with both hands",
  "slumped on the floor in a lazy posture",
  "jumping excitedly with tail wagging",
  "sleeping with a 'Zzz' icon on the monitor screen",
  "pointing at a laptop with a robotic finger"
];

async function main() {
  console.log('[Character Freezer] Locking in Chip and refining Hana...');
  
  await ensureComfyRunning();
  const templatePath = path.join(process.cwd(), 'scripts', 'comfy-flux-workflow.json');
  const templateStr = await fs.readFile(templatePath, 'utf8');
  const outDir = path.join(process.cwd(), '.vibecode', 'lora_dataset', 'refined');
  await fs.mkdir(outDir, { recursive: true });

  // 1. Generate more of the APPROVED Chip
  for (let i = 0; i < CHIP_VARIATIONS.length; i++) {
    console.log(` -> Generating Chip variation ${i+1}: ${CHIP_VARIATIONS[i]}`);
    const workflow = JSON.parse(templateStr);
    workflow["6"].inputs.text = `${CHIP_FIXED}, ${CHIP_VARIATIONS[i]}, ${MASTER_STYLE}`;
    workflow["17"].inputs.steps = 35;
    workflow["16"].inputs.sampler_name = "dpmpp_2m_sde";
    workflow["25"].inputs.noise_seed = Math.floor(Math.random() * 1000000);
    try {
      const buf = await generateImageAndWait(workflow, 8000);
      if (buf.length > 0) await fs.writeFile(path.join(outDir, `chip_fixed_${i}.png`), Buffer.from(buf[0]));
    } catch (e) { console.error(e.message); }
  }

  // 2. Generate Hana in the SAME style as the new Chip
  console.log(' -> Generating Hana to match Chip\'s style...');
  const hanaWorkflow = JSON.parse(templateStr);
  hanaWorkflow["6"].inputs.text = `Character sheet of ${HANA_REFINED}, 3 views: front, side, and ecstatic face, ${MASTER_STYLE}`;
  hanaWorkflow["5"].inputs.width = 1216;
  hanaWorkflow["5"].inputs.height = 832;
  hanaWorkflow["17"].inputs.steps = 35;
  hanaWorkflow["16"].inputs.sampler_name = "dpmpp_2m_sde";
  hanaWorkflow["25"].inputs.noise_seed = Math.floor(Math.random() * 1000000);
  try {
    const buf = await generateImageAndWait(hanaWorkflow, 10000);
    if (buf.length > 0) await fs.writeFile(path.join(outDir, `hana_style_matched.png`), Buffer.from(buf[0]));
  } catch (e) { console.error(e.message); }

  console.log('\n[Character Freezer] Done! Check .vibecode/lora_dataset/refined/');
}

main().catch(console.error);

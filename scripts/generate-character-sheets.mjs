import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';
import { generateImageAndWait } from './comfy-api-client.mjs';
import { ensureComfyRunning } from './comfy-launcher.mjs';

// Ultimate Cute Anime Style (Kawaii & Vibrant)
const STYLE_PROMPT = "masterpiece, best quality, ultra-cute anime style, kawaii aesthetic, moe, large expressive eyes, rounded shapes, soft cel shading, vibrant pastel colors, clean lines, cinematic lighting, 8k resolution, white background";

// Hana: Redesigned to be Adorable & Manic
const HANA_SHEET_PROMPT = `Character sheet of Hana, an adorable 20yo mad scientist anime girl. She has huge round glasses, light blue soft braided twin-tails, and wears an oversized clean white lab coat over a cute outfit. 3 views: full body jumping for joy, side profile showing a small cute build, and a close-up of a sparkling, happy manic face. ${STYLE_PROMPT}`;

// Chip: Disney-style Newt Robot (The "Cute" factor)
const CHIP_SHEET_PROMPT = `Character sheet of Chip, a tiny rounded humanoid robot. It has a smooth white metallic body and a retro monitor-head showing an incredibly cute Disney-style NEWT (salamander) face with huge watery eyes. It has a long wagging metallic tail with a small tool at the end. 3 views: standing cutely, sitting and holding a cookie with two hands, and a close-up of its happy monitor-face. ${STYLE_PROMPT}`;

async function main() {
  console.log('[Character Designer v5] INJECTING MAXIMUM CUTENESS...');
  
  await ensureComfyRunning();

  const templatePath = path.join(process.cwd(), 'scripts', 'comfy-flux-workflow.json');
  const templateStr = await fs.readFile(templatePath, 'utf8');

  const outDir = path.join(process.cwd(), '.vibecode', 'character_sheets');
  await fs.mkdir(outDir, { recursive: true });

  const tasks = [
    { name: 'hana_v5_cute', prompt: HANA_SHEET_PROMPT },
    { name: 'chip_v5_cute_newt', prompt: CHIP_SHEET_PROMPT }
  ];

  for (const task of tasks) {
    console.log(`\n=> Generating Adorable Sheet for: ${task.name}...`);
    const workflow = JSON.parse(templateStr);
    
    workflow["5"].inputs.width = 1216;
    workflow["5"].inputs.height = 832;
    workflow["6"].inputs.text = task.prompt;
    workflow["17"].inputs.steps = 35;
    workflow["16"].inputs.sampler_name = "dpmpp_2m_sde";
    workflow["25"].inputs.noise_seed = Math.floor(Math.random() * 1000000);
    workflow["9"].inputs.filename_prefix = `v5_cute_sheet_${task.name}`;

    try {
      const imageBuffers = await generateImageAndWait(workflow, 10000); 
      if (imageBuffers.length > 0) {
        const imgPath = path.join(outDir, `${task.name}_master_sheet.png`);
        await fs.writeFile(imgPath, Buffer.from(imageBuffers[0]));
        console.log(`   [Success] ${task.name.toUpperCase()} Master Sheet saved!`);
      }
    } catch (e) {
      console.error(`   [Failed] ${task.name} Sheet:`, e.message);
    }
  }

  console.log('\n[Character Designer v5] Process complete. I hope these are cute enough now!');
}

main().catch(console.error);

import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';
import { generateImageAndWait } from './comfy-api-client.mjs';
import { ensureComfyRunning } from './comfy-launcher.mjs';

// Ultra-Cute Deformed Anime Style
const STYLE_PROMPT = "masterpiece, best quality, super cute anime girl style, moe, chibi-inspired proportions, oversized round glasses, huge sparkling eyes, soft cel shading, simple clean flat colors, 2D vector illustration, white background, vivid palette";

// Hana: Focused on "Extreme Cute & Manic"
const HANA_SHEET_PROMPT = `High-quality character sheet of Hana, an incredibly cute anime girl, 20yo mad scientist. She has messy light blue twin-tails, a oversized lab coat, and a very expressive 'chibi' face. 3 views: jumping with joy, pouting cutely, and a close-up of a wide sparkling smile. ${STYLE_PROMPT}`;

async function main() {
  console.log('[Character Designer v6] FOCUSING ON HANA\'S CUTENESS...');
  
  await ensureComfyRunning();

  const templatePath = path.join(process.cwd(), 'scripts', 'comfy-flux-workflow.json');
  const templateStr = await fs.readFile(templatePath, 'utf8');

  const outDir = path.join(process.cwd(), '.vibecode', 'character_sheets');
  await fs.mkdir(outDir, { recursive: true });

  console.log(`\n=> Generating Ultra-Cute Hana...`);
  const workflow = JSON.parse(templateStr);
  
  workflow["5"].inputs.width = 1216;
  workflow["5"].inputs.height = 832;
  workflow["6"].inputs.text = HANA_SHEET_PROMPT;
  workflow["17"].inputs.steps = 35;
  workflow["16"].inputs.sampler_name = "dpmpp_2m_sde";
  workflow["25"].inputs.noise_seed = Math.floor(Math.random() * 1000000);
  workflow["9"].inputs.filename_prefix = `v6_ultra_cute_hana`;

  try {
    const imageBuffers = await generateImageAndWait(workflow, 10000); 
    if (imageBuffers.length > 0) {
      const imgPath = path.join(outDir, `hana_v6_ultra_cute.png`);
      await fs.writeFile(imgPath, Buffer.from(imageBuffers[0]));
      console.log(`   [Success] ULTRA CUTE HANA saved to: ${imgPath}`);
    }
  } catch (e) {
    console.error(`   [Failed] Hana v6:`, e.message);
  }

  console.log('\n[Character Designer v6] Done. Is she cute enough now?');
}

main().catch(console.error);

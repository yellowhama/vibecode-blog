import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { generateImageAndWait } from './comfy-api-client.mjs';
import { ensureComfyRunning } from './comfy-launcher.mjs';

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : { apiKey: 'dummy' });

const STYLE_PROMPT = "flat color, webtoon style, cel shaded, clean vector lines, 2d illustration, comic panel, tech startup aesthetic";

// Mock Script Fallback
function getPersonaScript(articleHash) {
  return {
    metadata: {
      sourceHash: articleHash,
      format: "4-panel-vertical",
      characters: ["NonTechFounder", "AiRobot"]
    },
    panels: [
      {
        panel: 1,
        visual_prompt: "Passionate Non-Tech Founder looking incredibly excited, pointing at a blank screen. Cute R2D2 style robot floating nearby.",
        dialogue: [{ speaker: "NonTechFounder", text: "Hey! Check out this amazing new AI optimization we just implemented!" }]
      },
      {
        panel: 2,
        visual_prompt: "The small robot's screen shows a loading spinner, its robotic eyes squinting. Founder is still smiling brightly.",
        dialogue: [{ speaker: "AiRobot", text: "Processing... With 16GB VRAM and --highvram, I am feeling significantly faster." }]
      },
      {
        panel: 3,
        visual_prompt: "The small robot emits a small puff of steam from its head, but looks happy. Founder looks impressed.",
        dialogue: [{ speaker: "AiRobot", text: "Look at that! No more 10-minute reloading between panels. Just pure speed." }]
      },
      {
        panel: 4,
        visual_prompt: "The small robot happily showing a screen with a gigantic green checkmark. Founder giving a thumbs up.",
        dialogue: [
          { speaker: "NonTechFounder", text: "Perfect! This is the 'Vibecode' way!" },
          { speaker: "AiRobot", text: "Agreed. Optimization complete. Proceed to deployment." }
        ]
      }
    ]
  };
}

// Real LLM Persona Script Generator
async function generatePersonaScript(articleHash, articleText) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY missing');
  }

  console.log('[Webtoon Persona Engine] Generating script with Gemini...');    

  const prompt = `Create a humorous 4-panel comic script for characters "NonTechFounder" and "AiRobot" based on this article: ${articleText}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: { type: Type.OBJECT, properties: { characters: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          panels: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { panel: { type: Type.INTEGER }, visual_prompt: { type: Type.STRING }, dialogue: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { speaker: { type: Type.STRING }, text: { type: Type.STRING } } } } } } }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

async function main() {
  const args = process.argv.slice(2);
  const inputArg = args[0] || 'default-test';

  let articleHash, script;

  if (existsSync(inputArg)) {
    articleHash = path.parse(inputArg).name;
    const rawContent = await fs.readFile(inputArg, 'utf8');
    try {
      script = await generatePersonaScript(articleHash, rawContent);
    } catch (e) {
      console.warn('[Webtoon Orchestrator] Gemini API unavailable or failed. Falling back to Mock Script.');
      script = getPersonaScript(articleHash);
    }
  } else {
    articleHash = inputArg;
    script = getPersonaScript(articleHash);
  }

  console.log(`[Webtoon Orchestrator] Starting Generation for article: ${articleHash}`);  

  await ensureComfyRunning();

  const templatePath = path.join(process.cwd(), 'scripts', 'comfy-flux-workflow.json');
  const templateStr = await fs.readFile(templatePath, 'utf8');

  const outDir = path.join(process.cwd(), '.vibecode', 'webtoons', articleHash);
  await fs.mkdir(outDir, { recursive: true });

  console.log(`[Webtoon Orchestrator] Generating ${script.panels.length} panels...`);

  const generatedPanelPaths = [];

  for (const panel of script.panels) {
    console.log(`\n=> Processing Panel ${panel.panel}...`);
    const workflow = JSON.parse(templateStr);
    workflow["6"].inputs.text = `${panel.visual_prompt}, ${STYLE_PROMPT}`;
    workflow["25"].inputs.noise_seed = Math.floor(Math.random() * 1000000);
    workflow["9"].inputs.filename_prefix = `${articleHash}_panel_${panel.panel}`;

    try {
      const imageBuffers = await generateImageAndWait(workflow, 3000);
      if (imageBuffers.length > 0) {
        const imgPath = path.join(outDir, `panel_${panel.panel}.png`);
        await fs.writeFile(imgPath, Buffer.from(imageBuffers[0]));
        generatedPanelPaths.push(`panel_${panel.panel}.png`);
        console.log(`   ✅ Panel ${panel.panel} saved.`);
      }
    } catch (e) {
      console.error(`   ❌ Failed Panel ${panel.panel}:`, e.message);
      generatedPanelPaths.push(null);
    }
  }

  // Final Markdown
  let mdContent = `# Webtoon Adaptation: ${articleHash}\n\n`;
  for (let i = 0; i < script.panels.length; i++) {
    const p = script.panels[i];
    const imgFile = generatedPanelPaths[i];
    mdContent += `### Panel ${p.panel}\n\n`;
    if (imgFile) mdContent += `![Panel ${p.panel}](./${imgFile})\n\n`;
    for (const d of p.dialogue) {
      mdContent += `**${d.speaker}**: ${d.text}\n\n`;
    }
    mdContent += `---\n\n`;
  }

  const mdOutPath = path.join(outDir, 'index.md');
  await fs.writeFile(mdOutPath, mdContent, 'utf8');
  console.log(`\n🎉 Complete! View at: ${mdOutPath}`);
}

main().catch(console.error);

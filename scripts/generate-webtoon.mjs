import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { generateImageAndWait } from './comfy-api-client.mjs';
import { ensureComfyRunning } from './comfy-launcher.mjs';

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : { apiKey: 'dummy' });

// 1980s Garfield-inspired Style Prompt
const STYLE_PROMPT = "1980s retro comic strip style, Jim Davis art style, bold ink outlines, flat vibrant colors, halftone patterns, hand-drawn cel shading, vintage Sunday funny pages aesthetic, clean 2d illustration";

// Mock Script Fallback with New Personas
function getPersonaScript(articleHash) {
  return {
    metadata: {
      sourceHash: articleHash,
      format: "4-panel-vertical",
      characters: ["SoloPreneur", "LazyAI"]
    },
    panels: [
      {
        panel: 1,
        visual_prompt: "Passionate female SoloPreneur looking incredibly excited, pointing at a laptop with a giant smile. A small, rusty WALL-E style robot (LazyAI) is slumped nearby with heavy-lidded, sleepy eyes.",
        dialogue: [{ speaker: "SoloPreneur", text: "Look! I just integrated a new AI automation without writing a single line of code!" }]
      },
      {
        panel: 2,
        visual_prompt: "Close up on LazyAI. The robot is slowly blinking, looking completely unimpressed and bored. Exaggerated lazy expression.",
        dialogue: [{ speaker: "LazyAI", text: "Wake me up when you find the 'automated coffee' button. This optimization is exhausting me." }]
      },
      {
        panel: 3,
        visual_prompt: "SoloPreneur doing a high-energy 'victory' pose. LazyAI is now face-down on the desk, completely indifferent.",
        dialogue: [{ speaker: "SoloPreneur", text: "This is a revolution for non-coders! Vibecode magic!" }]
      },
      {
        panel: 4,
        visual_prompt: "SoloPreneur giving a huge thumbs up. LazyAI is slowly raising one robotic arm to give a very weak, half-hearted thumbs up while still looking sleepy.",
        dialogue: [
          { speaker: "SoloPreneur", text: "Right, LazyAI?" },
          { speaker: "LazyAI", text: "Sure, whatever. Is it nap time yet?" }
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

  const prompt = `Create a humorous 4-panel comic script based on this article: ${articleText}. 
  Characters:
  1. "SoloPreneur": A passionate young woman, non-technical, extremely energetic, with exaggerated reactions and high enthusiasm.
  2. "LazyAI": A small WALL-E/R2D2 style robot who is extremely lazy, cynical, and indifferent (Garfield personality). He has heavy-lidded eyes and a sluggish attitude.
  
  The script should focus on the contrast between her energy and his laziness. Return JSON.`;

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

  console.log('[Webtoon Orchestrator] Starting Generation for article: ' + articleHash);

  await ensureComfyRunning();

  const templatePath = path.join(process.cwd(), 'scripts', 'comfy-flux-workflow.json');
  const templateStr = await fs.readFile(templatePath, 'utf8');

  const outDir = path.join(process.cwd(), '.vibecode', 'webtoons', articleHash);
  await fs.mkdir(outDir, { recursive: true });

  console.log('[Webtoon Orchestrator] Generating ' + script.panels.length + ' panels...');

  const generatedPanelPaths = [];

  for (const panel of script.panels) {
    console.log('\n=> Processing Panel ' + panel.panel + '...');
    const workflow = JSON.parse(templateStr);
    workflow["6"].inputs.text = panel.visual_prompt + ', ' + STYLE_PROMPT;
    workflow["25"].inputs.noise_seed = Math.floor(Math.random() * 1000000);
    workflow["9"].inputs.filename_prefix = articleHash + '_panel_' + panel.panel;

    try {
      const imageBuffers = await generateImageAndWait(workflow, 3000);
      if (imageBuffers.length > 0) {
        const imgPath = path.join(outDir, 'panel_' + panel.panel + '.png');
        await fs.writeFile(imgPath, Buffer.from(imageBuffers[0]));
        generatedPanelPaths.push('panel_' + panel.panel + '.png');
        console.log('   Panel ' + panel.panel + ' saved.');
      }
    } catch (e) {
      console.error('   Failed Panel ' + panel.panel + ':', e.message);
      generatedPanelPaths.push(null);
    }
  }

  // Final Markdown
  let mdContent = '# Webtoon Adaptation: ' + articleHash + '\n\n';
  for (let i = 0; i < script.panels.length; i++) {
    const p = script.panels[i];
    const imgFile = generatedPanelPaths[i];
    mdContent += '### Panel ' + p.panel + '\n\n';
    if (imgFile) mdContent += '![' + 'Panel ' + p.panel + '](' + './' + imgFile + ')\n\n';
    for (const d of p.dialogue) {
      mdContent += '**' + d.speaker + '**: ' + d.text + '\n\n';
    }
    mdContent += '---\n\n';
  }

  const mdOutPath = path.join(outDir, 'index.md');
  await fs.writeFile(mdOutPath, mdContent, 'utf8');
  console.log('\nComplete! View at: ' + mdOutPath);
}

main().catch(console.error);

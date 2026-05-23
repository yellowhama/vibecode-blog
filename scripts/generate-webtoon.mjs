import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { generateImageAndWait } from './comfy-api-client.mjs';
import { ensureComfyRunning } from './comfy-launcher.mjs';

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : { apiKey: 'dummy' });

// SD Anime Style Prompt
const STYLE_PROMPT = "high quality anime style, cel shaded, vibrant colors, clean linework, 2D illustration, character focus, expressive facial features, cute aesthetic, tech startup laboratory background, cinematic lighting";

// Character Visual Constants (Anime Optimized)
const HANA_DESC = "Hana (anime girl, mad scientist, messy bun hair, lab coat, energetic, bright expressive eyes, Enneagram 7)";
const CHIP_DESC = "Chip (cute clunky retro robot, articulated limbs, monitor-head, human-like mechanical mouth, lazy slumped posture, Enneagram 5)";

// Mock Script Fallback
function getPersonaScript(articleHash) {
  return {
    metadata: {
      sourceHash: articleHash,
      format: "4-panel-vertical",
      characters: ["Hana", "Chip"]
    },
    panels: [
      {
        panel: 1,
        visual_prompt: `Anime style: Hana is screaming "EUREKA!" while shoving a giant half-eaten chocolate chip cookie directly into Chip the robot's human-like mechanical mouth. Sparkles and speed lines in background.`,
        dialogue: [{ speaker: "Hana", text: "Forget pure sugar! This Old Granny's special is the ultimate fuel! EAT IT, MY CREATION!" }]
      },
      {
        panel: 2,
        visual_prompt: `Anime style: Chip is chewing the cookie with an absurdly satisfied expression on his monitor face. A golden aura emits from his circuits. Hana is watching with intense, mad-scientist anticipation.`,
        dialogue: [{ speaker: "Chip", text: "*Crunch... munch...* Processing high-density gourmet glucose... My GPU hasn't felt this alive since the big bang." }]
      },
      {
        panel: 3,
        visual_prompt: `Anime style: Hana is pointing at a stack of blueprints. Chip has already slumped back down, swallowing the last crumb. A 'Sleeping' emoji icon appears on his screen.`,
        dialogue: [
          { speaker: "Hana", text: "Now! Build the sugar-powered internet! Replace the arc reactor!" },
          { speaker: "Chip", text: "Calibration complete. Imprinted on 'Old Granny's Specials'. I refuse to calculate 1+1 without another batch. Wake me in three hours." }
        ]
      },
      {
        panel: 4,
        visual_prompt: `Anime style: Chip is fast asleep, a small mechanical tongue sticking out. Hana is grabbing her car keys with a manic, determined anime face, ready for a 3-hour round trip drive.`,
        dialogue: [
          { speaker: "Hana", text: "I created a monster... a genius, gourmet monster! TO THE COOKIE SHOP!" },
          { speaker: "Chip", text: "*Mumble*... double... chocolate... or no... code... *Zzzzz*" }
        ]
      }
    ]
  };
}

async function generatePersonaScript(articleHash, articleText) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY missing');
  }
  console.log('[Webtoon Persona Engine] Generating script with Gemini...');
  const prompt = `Create a humorous 4-panel comic script based on this article: ${articleText}. 
  Background: Hana (Enneagram 7 Mad Scientist) believes "Sugar is the New Oil". She invented a sugar-powered robot named Chip (Enneagram 5). 
  In the origin story, she ran out of pure sugar and shoved her half-eaten "Old Granny's Handmade Special Double Chocolate Chip Cookie" directly into Chip's human-like mechanical mouth to boot him up. 
  Characters:
  1. "Hana": Anime girl, chaotic genius, lab coat, wild energy, refuses to learn code.
  2. "Chip": The Local AI. Cute clunky robot with a monitor-head and a human-like mouth for eating cookies. 
  Comedy Theme: Hana's grandiose "Sugar-Tech" vision vs. the reality of her being a "cookie slave" to her own invention.
  Return JSON.`;

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
      console.warn('[Webtoon Orchestrator] Gemini API unavailable. Falling back to Mock Script.');
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
  const generatedPanelPaths = [];
  for (const panel of script.panels) {
    console.log('=> Processing Panel ' + panel.panel + '...');
    const workflow = JSON.parse(templateStr);
    const fullPrompt = `${panel.visual_prompt}, starring ${HANA_DESC} and ${CHIP_DESC}, ${STYLE_PROMPT}`;
    workflow["6"].inputs.text = fullPrompt;
    workflow["25"].inputs.noise_seed = Math.floor(Math.random() * 1000000);
    workflow["9"].inputs.filename_prefix = articleHash + '_panel_' + panel.panel;
    try {
      const imageBuffers = await generateImageAndWait(workflow, 3000);
      if (imageBuffers.length > 0) {
        const imgPath = path.join(outDir, `panel_${panel.panel}.png`);
        await fs.writeFile(imgPath, Buffer.from(imageBuffers[0]));
        generatedPanelPaths.push(`panel_${panel.panel}.png`);
        console.log('   Panel ' + panel.panel + ' saved.');
      }
    } catch (e) {
      console.error('   Failed Panel ' + panel.panel + ':', e.message);
      generatedPanelPaths.push(null);
    }
  }
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

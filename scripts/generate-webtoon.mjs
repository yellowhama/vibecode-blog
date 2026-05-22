import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { generateImageAndWait } from './comfy-api-client.mjs';
import { ensureComfyRunning } from './comfy-launcher.mjs';

// ai is already the GoogleGenAI instance in my previous script, 
// but let's make sure we use the correct method.
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : { apiKey: 'dummy' });
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // Using 2.0-flash as it's common

// 1980s Garfield-inspired Style Prompt
const STYLE_PROMPT = "1980s retro comic strip style, Jim Davis art style, bold ink outlines, flat vibrant colors, halftone patterns, hand-drawn cel shading, vintage Sunday funny pages aesthetic, clean 2d illustration";

// Character Visual Constants
const HANA_DESC = "Hana (passionate young woman, glasses, messy bun hair, energetic gestures, Enneagram 7)";
const CHIP_DESC = "Chip (clunky retro robot with articulated legs and a monitor-head, lazy slumped posture, powered by a local LLM server, Enneagram 5)";

/**
 * PLAYER: The Visionary (Hana)
 */
async function playerHana(articleText) {
  const prompt = `You are Hana (Enneagram 7), a passionate and non-technical solopreneur. 
  Read this article: "${articleText}"
  Propose a "mind-blowing" idea for a new AI feature or business automation inspired by this. 
  Be extremely energetic, use lots of exclamation marks, and show your total lack of technical understanding but infinite optimism.`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * PLAYER: The Critic (Chip)
 */
async function playerChip(hanaIdea) {
  const prompt = `You are Chip (Enneagram 5 + Garfield personality), a lazy local AI robot. 
  Hana just told you this idea: "${hanaIdea}"
  Respond to her. Be cynical, analytical, and extremely lazy. Mention how much VRAM or energy this will waste. 
  Crucially, demand "Old Granny's Handmade Special Double Chocolate Chip Cookies" (the 1.5h drive ones) as a condition for even thinking about it. 
  Look down on "Chips Ahoy".`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * PLAYER: The Scenarist
 */
async function playerScenarist(articleText, hanaDialogue, chipDialogue) {
  const prompt = `Create a humorous 4-panel comic script.
  Context:
  - Article: ${articleText}
  - Hana's Energy: ${hanaDialogue}
  - Chip's Reaction: ${chipDialogue}
  
  Format: 4 panels with visual_prompt and dialogue.
  Characters: Hana (Enneagram 7, high energy) and Chip (Enneagram 5, lazy, cookie snob).
  Style: 1980s Jim Davis comic strip.
  
  Return JSON following this schema:
  {
    "panels": [
      { "panel": 1, "visual_prompt": "string", "dialogue": [{ "speaker": "Hana", "text": "string" }] }
    ]
  }`;

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          panels: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                panel: { type: Type.INTEGER }, 
                visual_prompt: { type: Type.STRING }, 
                dialogue: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { speaker: { type: Type.STRING }, text: { type: Type.STRING } } } } 
              } 
            } 
          }
        }
      }
    }
  });

  return JSON.parse(response.response.text());
}

async function main() {
  const args = process.argv.slice(2);
  const inputArg = args[0] || 'default-test';

  let articleHash, articleText;

  if (existsSync(inputArg)) {
    articleHash = path.parse(inputArg).name;
    articleText = await fs.readFile(inputArg, 'utf8');
  } else {
    articleHash = inputArg;
    articleText = "How to automate business tasks with AI and cookies.";
  }

  console.log(`[Systemless Orchestrator] Invoking Players for: ${articleHash}`);

  try {
    console.log(' - Player Hana is brainstorming...');
    const hanaIdea = await playerHana(articleText);
    
    console.log(' - Player Chip is critiquing...');
    const chipReaction = await playerChip(hanaIdea);
    
    console.log(' - Player Scenarist is finalizing the script...');
    const script = await playerScenarist(articleText, hanaIdea, chipReaction);

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
      const fullPrompt = `${panel.visual_prompt}, starring ${HANA_DESC} and ${CHIP_DESC}, ${STYLE_PROMPT}`;
      
      workflow["6"].inputs.text = fullPrompt;
      workflow["25"].inputs.noise_seed = Math.floor(Math.random() * 1000000);
      workflow["9"].inputs.filename_prefix = `${articleHash}_panel_${panel.panel}`;

      try {
        const imageBuffers = await generateImageAndWait(workflow, 3000);
        if (imageBuffers.length > 0) {
          const imgPath = path.join(outDir, `panel_${panel.panel}.png`);
          await fs.writeFile(imgPath, Buffer.from(imageBuffers[0]));
          generatedPanelPaths.push(`panel_${panel.panel}.png`);
          console.log(`   Panel ${panel.panel} saved.`);
        }
      } catch (e) {
        console.error(`   Failed Panel ${panel.panel}:`, e.message);
        generatedPanelPaths.push(null);
      }
    }

    // Final Markdown
    let mdContent = `# Webtoon Adaptation: ${articleHash}\n\n`;
    mdContent += `> **Source Brainstorming**\n> **Hana**: ${hanaIdea.trim()}\n> **Chip**: ${chipReaction.trim()}\n\n---\n\n`;
    
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
    console.log(`\nComplete! View at: ${mdOutPath}`);
  } catch (err) {
    console.error('[Systemless Orchestrator] Execution failed:', err);
    process.exit(1);
  }
}

main().catch(console.error);

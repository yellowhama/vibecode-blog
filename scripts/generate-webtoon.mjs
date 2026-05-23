import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { generateImageAndWait } from './comfy-api-client.mjs';
import { ensureComfyRunning } from './comfy-launcher.mjs';

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : { apiKey: 'dummy' });

// Clean Vector Style Prompt
const STYLE_PROMPT = "clean vector illustration, modern tech startup style, flat colors, minimal shading, sleek design, character focus, expressive facial features, tech office background, bright and professional lighting";

// Character Visual Constants (Vector Optimized)
const FOUNDER_DESC = "NonTechFounder (passionate solo founder, casual startup outfit, glowing with naive enthusiasm, exaggerated confident gestures, Enneagram 7)";
const AI_ROBOT_DESC = "AiRobot (cute clunky WALL-E style robot, monitor-head displaying a glowing red eye, cynical posture, emitting small puffs of steam when frustrated, Enneagram 5)";

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
        visual_prompt: `Clean vector style: Passionate NonTechFounder looking incredibly excited, pointing at a blank laptop screen. Cute WALL-E style AiRobot floating nearby.`,
        dialogue: [{ speaker: "NonTechFounder", text: "로봇아! 나 엄청난 아이디어가 떠올랐어! 이걸로 유니콘 기업 갈 수 있을 것 같아. 당장 앱 만들어줘!" }]
      },
      {
        panel: 2,
        visual_prompt: `Clean vector style: AiRobot's screen shows a loading spinner, its robotic eyes squinting. Founder is still smiling brightly.`,
        dialogue: [
          { speaker: "AiRobot", text: "삐리릭... 아이디어의 구체적인 비즈니스 로직과 데이터베이스 스키마를 입력해 주십시오." },
          { speaker: "NonTechFounder", text: "음... 그냥 '알아서 싹' 멋지게 되는 버튼 하나 있으면 되는데?" }
        ]
      },
      {
        panel: 3,
        visual_prompt: `Clean vector style: AiRobot emits a small puff of steam from its head, looking frustrated. Founder looks confused, tilting head.`,
        dialogue: [
          { speaker: "AiRobot", text: "경고. '알아서 싹'은 컴퓨터 언어에 존재하지 않습니다. 기획서가 없다면 제가 무작위로 버튼을 만들겠습니다." }
        ]
      },
      {
        panel: 4,
        visual_prompt: `Clean vector style: AiRobot happily showing a screen with a gigantic red button that says '알아서 싹'. Founder looks shocked and sweating.`,
        dialogue: [
          { speaker: "NonTechFounder", text: "잠깐, 진짜 그거 하나만 만들면 어떡해! 결제 시스템은?! 로그인 기능은?!" },
          { speaker: "AiRobot", text: "삐빅. 그것은 다음 프롬프트에서 요청하십시오. 휴먼." }
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
  Characters:
  1. "NonTechFounder": Passionate solo founder who knows nothing about coding. Enthusiastic but makes unreasonable demands like "just make it work magically".
  2. "AiRobot": A cynical, WALL-E style AI assistant robot. It gives brutal facts (팩폭) and easily gets frustrated by the founder's vague prompts.
  Comedy Theme: The founder's vague grand vision vs. the AI robot's literal, technical, and cynical execution.
  Keep the dialogue in Korean, but the visual_prompt must be in English.
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
    const fullPrompt = `${panel.visual_prompt}, starring ${FOUNDER_DESC} and ${AI_ROBOT_DESC}, ${STYLE_PROMPT}`;
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

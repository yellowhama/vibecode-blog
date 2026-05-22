import fs from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : {});

// Regex to extract YAML frontmatter and body (supports CRLF)
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

/**
 * Real LLM call to polish text and extract SEO using Gemini 2.5 Flash.
 */
async function callLLM(text) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in the environment variables. Please check your .env file.');
  }

  console.log('[SEO Bot] 🤖 Analyzing text with Gemini 2.5 Flash...');
  
  const prompt = `You are an expert SEO editor and copywriter for a tech blog.
Analyze the following markdown content.
1. Create a highly engaging, click-worthy SEO title.
2. Create a concise meta description (under 150 characters).
3. Extract 3-5 relevant SEO tags.
4. Polish the body text: fix minor typos, improve flow and readability, but STRICTLY maintain the original author's tone, voice, and all Markdown formatting.

Here is the content:
${text}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          body: { type: Type.STRING }
        },
        required: ["title", "description", "tags", "body"]
      }
    }
  });

  return JSON.parse(response.text);
}

async function polishMarkdownFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    const rawContent = await fs.readFile(absolutePath, 'utf8');

    const match = rawContent.match(FRONTMATTER_REGEX);
    if (!match) {
      console.error('[SEO Bot] ❌ Error: No valid YAML frontmatter found in', filePath);
      return;
    }

    const frontmatterStr = match[1];
    const bodyStr = match[2];

    console.log(`[SEO Bot] 📄 Processing: ${path.basename(filePath)}`);
    
    // Call AI to polish text and extract SEO data
    const result = await callLLM(bodyStr);

    // Reconstruct Frontmatter
    let newFrontmatter = frontmatterStr;
    
    // Replace or insert Title
    if (newFrontmatter.includes('title:')) {
      newFrontmatter = newFrontmatter.replace(/title:\s*["']?.*["']?/, `title: "${result.title}"`);
    } else {
      newFrontmatter += `\ntitle: "${result.title}"`;
    }

    // Replace or insert Description
    if (newFrontmatter.includes('description:')) {
      newFrontmatter = newFrontmatter.replace(/description:\s*["']?.*["']?/, `description: "${result.description}"`);
    } else {
      newFrontmatter += `\ndescription: "${result.description}"`;
    }

    // Replace or insert tags
    const tagsYaml = `\ntags:\n` + result.tags.map(t => `  - ${t}`).join('\n');
    if (newFrontmatter.includes('tags:')) {
      newFrontmatter = newFrontmatter.replace(/tags:[\s\S]*?(?=\w+:|$)/, tagsYaml.trim() + '\n');
    } else {
      newFrontmatter += tagsYaml;
    }

    // Reconstruct final file
    const finalContent = `---\n${newFrontmatter.trim()}\n---\n${result.body}`;

    // Write back
    await fs.writeFile(absolutePath, finalContent, 'utf8');
    
    console.log(`[SEO Bot] ✅ Successfully polished and optimized SEO for: ${path.basename(filePath)}`);
    console.log(`          - New Title: ${result.title}`);
    console.log(`          - Extracted Tags: ${result.tags.join(', ')}`);

  } catch (error) {
    console.error('[SEO Bot] ❌ Failed to process file:', error.message);
  }
}

const targetFile = process.argv[2];
if (!targetFile) {
  console.log('Usage: npm run seo:polish <path/to/markdown/file.md>');
  process.exit(1);
}

polishMarkdownFile(targetFile);

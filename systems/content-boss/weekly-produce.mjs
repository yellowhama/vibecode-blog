#!/usr/bin/env node
/**
 * Content Boss — Weekly Produce
 *
 * Generates next week's twitter queue using Claude API.
 * Reads source content, feedback context, and previous queue for continuity.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node weekly-produce.mjs [--week 2026-w20]
 *
 * Env:
 *   ANTHROPIC_API_KEY — required
 *   TARGET_WEEK      — override target week (e.g. "2026-w20")
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import {
  loadQueue,
  saveQueue,
  getActiveQueueFiles,
  getISOWeekString,
} from '../twitter/automation/lib/queue-manager.mjs';
import { validateItem } from './auto-approve.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_DIR = join(__dirname, '..', 'twitter', 'queue');
const BLOG_PHASE1_EN = join(__dirname, '..', '..', 'content', 'blog', 'phase1', 'en');
const BOOK_SOURCE = join(__dirname, '..', '..', 'content', 'blog', 'book-source');
const FEEDBACK_PATH = join(__dirname, '..', 'analytics', 'feedback-context.md');
const SYSTEM_PROMPT_PATH = join(__dirname, 'prompts', 'twitter-system.md');

// ── Helpers ──────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let targetWeek = process.env.TARGET_WEEK || null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--week' && args[i + 1]) {
      targetWeek = args[i + 1];
      i++;
    }
  }

  return { targetWeek };
}

/**
 * Determine the next week to generate.
 * Scans existing queue files → finds highest week → returns next.
 */
function determineTargetWeek() {
  const files = getActiveQueueFiles();
  if (files.length === 0) {
    return getISOWeekString(new Date());
  }

  const weeks = files.map((f) => f.week).sort();
  const highest = weeks[weeks.length - 1];

  // Parse "YYYY-wWW" and increment
  const [yearStr, weekStr] = highest.split('-w');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  // Simple increment (doesn't handle year boundaries perfectly, but close enough)
  if (week >= 52) {
    return `${year + 1}-w01`;
  }
  return `${year}-w${String(week + 1).padStart(2, '0')}`;
}

/**
 * Check if a queue file already exists for the target week.
 */
function queueExists(week) {
  const files = getActiveQueueFiles();
  return files.some((f) => f.week === week);
}

/**
 * Get all source files already used in existing queues.
 */
function getUsedSources() {
  const used = new Set();
  for (const { path } of getActiveQueueFiles()) {
    const queue = loadQueue(path);
    if (!queue) continue;
    for (const item of queue.items) {
      if (item.source) used.add(item.source);
    }
  }
  return used;
}

/**
 * Find the next available source file.
 * Priority: phase1/en/ scene files (actN-M-en.md), then book-source/.
 */
function findNextSource(usedSources) {
  // Phase 1 scene files (skip compiled actN-en.md files)
  if (existsSync(BLOG_PHASE1_EN)) {
    const phase1Files = readdirSync(BLOG_PHASE1_EN)
      .filter((f) => f.endsWith('.md') && /^act\d+-\d+-en\.md$/.test(f))
      .sort();

    for (const file of phase1Files) {
      const relPath = `easy_peasy/phase1/en/${file}`;
      if (!usedSources.has(relPath)) {
        return {
          relPath,
          absPath: join(BLOG_PHASE1_EN, file),
        };
      }
    }
  }

  // Book source chapters
  if (existsSync(BOOK_SOURCE)) {
    const sections = readdirSync(BOOK_SOURCE).filter((d) => {
      const full = join(BOOK_SOURCE, d);
      try { return readdirSync(full).length > 0; } catch { return false; }
    }).sort();

    for (const section of sections) {
      const sectionDir = join(BOOK_SOURCE, section);
      const files = readdirSync(sectionDir)
        .filter((f) => f.endsWith('.md'))
        .sort();

      for (const file of files) {
        const relPath = `book-source/${section}/${file}`;
        if (!usedSources.has(relPath)) {
          return {
            relPath,
            absPath: join(sectionDir, file),
          };
        }
      }
    }
  }

  return null;
}

/**
 * Get the last thread from the most recent queue (for bridge continuity).
 */
function getLastThread() {
  const files = getActiveQueueFiles();
  if (files.length === 0) return null;

  const lastFile = files[files.length - 1];
  const queue = loadQueue(lastFile.path);
  if (!queue || !queue.items || queue.items.length === 0) return null;

  const lastItem = queue.items[queue.items.length - 1];
  return {
    title: lastItem.title,
    content: lastItem.content,
    diaryNumber: extractDiaryNumber(lastItem.title),
  };
}

function extractDiaryNumber(title) {
  const match = title?.match(/#(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Determine series name based on source path.
 */
function determineSeries(sourcePath) {
  if (sourcePath.includes('book-source')) {
    // Extract section name for series
    const match = sourcePath.match(/book-source\/\d+-(\w+)/);
    return match ? `Book: ${match[1]}` : 'Book';
  }
  return 'FDD Diary';
}

/**
 * Generate schedule timestamps for Mon/Wed/Fri 14:00 UTC.
 */
function generateSchedule(week) {
  const [yearStr, weekStr] = week.split('-w');
  const year = parseInt(yearStr, 10);
  const weekNum = parseInt(weekStr, 10);

  // ISO week 1 starts on the Monday of the week containing Jan 4
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // Mon=1..Sun=7
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1);

  const targetMonday = new Date(week1Monday);
  targetMonday.setUTCDate(week1Monday.getUTCDate() + (weekNum - 1) * 7);

  // Mon(0), Wed(2), Fri(4) offsets from Monday
  return [0, 2, 4].map((offset) => {
    const d = new Date(targetMonday);
    d.setUTCDate(targetMonday.getUTCDate() + offset);
    d.setUTCHours(14, 0, 0, 0);
    return d.toISOString();
  });
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const { targetWeek: overrideWeek } = parseArgs();

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }

  // Determine target week
  const targetWeek = overrideWeek || determineTargetWeek();
  console.log(`Target week: ${targetWeek}`);

  // Check if queue already exists
  if (queueExists(targetWeek)) {
    console.log(`Queue for ${targetWeek} already exists. Skipping.`);
    return;
  }

  // Find source material
  const usedSources = getUsedSources();
  const source = findNextSource(usedSources);

  if (!source) {
    console.log('No unused source material available. Graceful exit.');
    return;
  }

  console.log(`Source: ${source.relPath}`);
  const sourceContent = readFileSync(source.absPath, 'utf-8');
  const series = determineSeries(source.relPath);

  // Load feedback context
  let feedbackContext = '';
  if (existsSync(FEEDBACK_PATH)) {
    feedbackContext = readFileSync(FEEDBACK_PATH, 'utf-8');
  }

  // Get last thread for bridge
  const lastThread = getLastThread();
  const nextDiaryNum = lastThread ? lastThread.diaryNumber + 1 : 1;

  // Load system prompt
  const systemPrompt = readFileSync(SYSTEM_PROMPT_PATH, 'utf-8');

  // Generate schedule
  const schedule = generateSchedule(targetWeek);
  const seriesShort = series === 'FDD Diary' ? 'fdd' : 'book';

  // Build user message
  const userMessage = [
    `## Target Week: ${targetWeek}`,
    `## Series: ${series}`,
    `## Diary Numbers: #${nextDiaryNum}, #${nextDiaryNum + 1}, #${nextDiaryNum + 2}`,
    `## Schedule: ${schedule.map((s, i) => ['Mon', 'Wed', 'Fri'][i] + ' ' + s).join(', ')}`,
    `## Item IDs: ${targetWeek}-${seriesShort}-001, ${targetWeek}-${seriesShort}-002, ${targetWeek}-${seriesShort}-003`,
    `## Source path: ${source.relPath}`,
    '',
    '## Source Content',
    '```',
    sourceContent.slice(0, 8000), // Truncate very long sources
    '```',
    '',
  ];

  if (feedbackContext) {
    userMessage.push('## Feedback Context', feedbackContext, '');
  }

  if (lastThread) {
    userMessage.push(
      '## Previous Week Last Thread (for bridge)',
      `Title: ${lastThread.title}`,
      `Content:`,
      ...lastThread.content.map((t, i) => `  [${i + 1}] ${t}`),
      '',
    );
  }

  userMessage.push(
    '## Instructions',
    'Generate a queue JSON object with 3 thread items for this week.',
    `Use the schedule timestamps provided above for scheduledAt.`,
    'Return ONLY the JSON object, no markdown fences, no explanation.',
  );

  // Call Claude API
  console.log('Calling Claude API...');
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage.join('\n') },
    ],
  });

  const rawOutput = response.content[0].text.trim();

  // Parse JSON (strip markdown fences if present)
  let jsonStr = rawOutput;
  const fenceMatch = rawOutput.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  let queue;
  try {
    queue = JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse Claude output as JSON:');
    console.error(rawOutput.slice(0, 500));
    const logPath = join(__dirname, 'logs', `error-${targetWeek}.txt`);
    const { writeFileSync: writeLog } = await import('node:fs');
    writeLog(logPath, `${new Date().toISOString()}\n\n${rawOutput}`, 'utf-8');
    console.error(`Raw output saved to ${logPath}`);
    process.exit(1);
  }

  // Validate and auto-approve
  let allPassed = true;
  for (const item of queue.items) {
    const violations = validateItem(item);
    if (violations.length === 0) {
      item.status = 'approved';
      console.log(`  ✓ ${item.id} → approved`);
    } else {
      item.status = 'draft';
      item.error = violations.join('; ');
      allPassed = false;
      console.log(`  ✗ ${item.id} — ${item.error}`);
    }
  }

  // Save queue file
  const fileName = `${targetWeek}-${seriesShort}.json`;
  const filePath = join(QUEUE_DIR, fileName);
  saveQueue(filePath, queue);
  console.log(`\nSaved: ${filePath}`);

  if (!allPassed) {
    console.log('Warning: some items failed validation and remain as draft.');
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

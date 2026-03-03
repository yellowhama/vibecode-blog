import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_DIR = join(__dirname, '..', '..', '..', 'content', 'twitter_queue');

const MAX_TWEET_LENGTH = 280;
const MIN_GAP_MINUTES = 15;

/**
 * Get ISO week number and year from a date.
 * Returns "YYYY-wWW" format.
 */
export function getISOWeekString(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-w${String(weekNo).padStart(2, '0')}`;
}

/**
 * Load a queue file. Returns null if file doesn't exist.
 */
export function loadQueue(filePath) {
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Save a queue file.
 */
export function saveQueue(filePath, queue) {
  writeFileSync(filePath, JSON.stringify(queue, null, 2) + '\n', 'utf-8');
}

/**
 * Validate tweet content lengths.
 * Returns array of validation errors (empty = valid).
 */
export function validateQueue(queue) {
  const errors = [];
  for (const item of queue.items) {
    for (let i = 0; i < item.content.length; i++) {
      if (item.content[i].length > MAX_TWEET_LENGTH) {
        errors.push(`${item.id} content[${i}]: ${item.content[i].length} chars (max ${MAX_TWEET_LENGTH})`);
      }
    }
    if (item.blogLinkText && item.blogLinkText.length > MAX_TWEET_LENGTH) {
      errors.push(`${item.id} blogLinkText: ${item.blogLinkText.length} chars (max ${MAX_TWEET_LENGTH})`);
    }
  }
  return errors;
}

/**
 * Get items that are due for posting.
 * Filters: status === "approved" AND scheduledAt <= now.
 * Enforces minimum gap between items.
 */
export function getDueItems(queue, now = new Date()) {
  const candidates = queue.items
    .filter((item) => item.status === 'approved' && new Date(item.scheduledAt) <= now)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  // Enforce minimum gap
  const result = [];
  let lastTime = null;
  for (const item of candidates) {
    const itemTime = new Date(item.scheduledAt);
    if (lastTime && (itemTime - lastTime) < MIN_GAP_MINUTES * 60 * 1000) {
      continue; // Skip items too close together
    }
    result.push(item);
    lastTime = itemTime;
  }

  return result;
}

/**
 * Get all queue files in the queue directory.
 * Scans for any JSON file matching YYYY-wWW pattern.
 */
export function getActiveQueueFiles() {
  if (!existsSync(QUEUE_DIR)) return [];

  const files = [];
  for (const entry of readdirSync(QUEUE_DIR)) {
    if (!entry.endsWith('.json')) continue;
    const match = entry.match(/^(\d{4}-w\d{2})/);
    if (!match) continue;
    files.push({ week: match[1], path: join(QUEUE_DIR, entry) });
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

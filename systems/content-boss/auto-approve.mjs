#!/usr/bin/env node
/**
 * Content Boss — Auto-Approve
 *
 * Scans twitter queue files for "draft" items, runs validation checks,
 * and promotes passing items to "approved" status.
 *
 * Checks (derived from branding/voice.md §7 + strategy/STRATEGY.md):
 *   1. Banned expressions (corporate-speak, weak hedging)
 *   2. Links / CTA language (Nike rule: no links in tweets)
 *   3. Time references that will age badly
 *   4. "Four lines" self-references
 */

import { loadQueue, saveQueue, getActiveQueueFiles } from '../twitter/automation/lib/queue-manager.mjs';

// ── Rule definitions ─────────────────────────────────────────────

const BANNED_EXPRESSIONS = [
  'game-changer', 'game changer',
  'deep dive',
  'unpack',
  'furthermore',
  'in conclusion',
  'utilize',
  'facilitate',
  'leverage',
  'i think maybe',
  'i write about',
  'in this article',
];

const LINK_PATTERNS = [
  /https?:\/\//i,
  /\.com\b/i,
  /\.town\b/i,
  /\.pro\b/i,
  /check out/i,
  /read more/i,
  /more at\b/i,
  /link in bio/i,
];

const TIME_PATTERNS = [
  /six months/i,
  /months ago/i,
  /\d+\s*months/i,
  /\d+\s*weeks/i,
];

const FOUR_LINE_PATTERNS = [
  /four lines/i,
  /4줄/,
  /four-line/i,
];

// ── Validation ───────────────────────────────────────────────────

/**
 * Validate a single queue item's content against all rules.
 * Returns an array of violation strings (empty = pass).
 */
export function validateItem(item) {
  const violations = [];
  const allText = item.content.join(' ').toLowerCase();

  // Rule 1: Banned expressions
  for (const expr of BANNED_EXPRESSIONS) {
    if (allText.includes(expr.toLowerCase())) {
      violations.push(`banned-expression: "${expr}"`);
    }
  }

  // Rule 2: Links / CTA
  const fullText = item.content.join(' ');
  for (const pat of LINK_PATTERNS) {
    if (pat.test(fullText)) {
      violations.push(`link-or-cta: ${pat.source}`);
    }
  }

  // Rule 3: Time references
  for (const pat of TIME_PATTERNS) {
    if (pat.test(fullText)) {
      violations.push(`time-reference: ${pat.source}`);
    }
  }

  // Rule 4: "Four lines" self-reference
  for (const pat of FOUR_LINE_PATTERNS) {
    if (pat.test(fullText)) {
      violations.push(`four-line-ref: ${pat.source}`);
    }
  }

  return violations;
}

// ── Main ─────────────────────────────────────────────────────────

function main() {
  const files = getActiveQueueFiles();
  let totalDraft = 0;
  let totalApproved = 0;
  let totalFailed = 0;

  for (const { week, path } of files) {
    const queue = loadQueue(path);
    if (!queue) continue;

    let modified = false;

    for (const item of queue.items) {
      if (item.status !== 'draft') continue;
      totalDraft++;

      const violations = validateItem(item);

      if (violations.length === 0) {
        item.status = 'approved';
        delete item.error;
        totalApproved++;
        modified = true;
        console.log(`  ✓ ${item.id} → approved`);
      } else {
        item.error = violations.join('; ');
        totalFailed++;
        console.log(`  ✗ ${item.id} — ${item.error}`);
      }
    }

    if (modified) {
      saveQueue(path, queue);
      console.log(`  saved ${path}`);
    }
  }

  console.log(`\nDone: ${totalDraft} draft → ${totalApproved} approved, ${totalFailed} failed`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main();

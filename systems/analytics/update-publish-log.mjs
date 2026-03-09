#!/usr/bin/env node

/**
 * Update content/publish_log.json with channel mapping entries.
 *
 * Usage:
 *   node systems/analytics/update-publish-log.mjs \
 *     --entry-id act1-1 \
 *     --source content/blog/phase1/act1-1-ko.md \
 *     --twitter-queue systems/twitter/queue/2026-w10-act1.json \
 *     --twitter-ids w10-act1-001,w10-act1-002 \
 *     --video-script systems/video/planning/multiplexed/act1-1-script.md \
 *     --shorts-script systems/shorts/scripts/act1-1-slides.json
 *
 * Or import and call programmatically:
 *   import { updatePublishLog } from './update-publish-log.mjs';
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const LOG_PATH = path.join(ROOT, 'content/publish_log.json');

function loadPublishLog() {
  try {
    return JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8'));
  } catch {
    return {
      _schema_version: '1.0',
      _description: 'Multi-channel publish status registry. Updated by pipeline scripts after each channel publish.',
      entries: {},
    };
  }
}

function savePublishLog(log) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + '\n', 'utf-8');
}

/**
 * Add or update an entry in publish_log.json.
 */
export function updatePublishLog(entryId, updates) {
  const log = loadPublishLog();

  if (!log.entries[entryId]) {
    log.entries[entryId] = {
      source: updates.source || null,
      created_at: new Date().toISOString(),
      channels: {},
    };
  }

  const entry = log.entries[entryId];

  if (updates.source) {
    entry.source = updates.source;
  }

  if (updates.twitter) {
    entry.channels.twitter = {
      ...entry.channels.twitter,
      ...updates.twitter,
    };
  }

  if (updates.video) {
    entry.channels.video = {
      ...entry.channels.video,
      ...updates.video,
    };
  }

  if (updates.shorts) {
    entry.channels.shorts = {
      ...entry.channels.shorts,
      ...updates.shorts,
    };
  }

  entry.updated_at = new Date().toISOString();

  savePublishLog(log);
  return entry;
}

/**
 * Record posted tweet IDs for an entry.
 */
export function recordPostedIds(entryId, postedIds) {
  const log = loadPublishLog();
  const entry = log.entries[entryId];
  if (!entry?.channels?.twitter) return;

  if (!entry.channels.twitter.posted_ids) {
    entry.channels.twitter.posted_ids = [];
  }
  entry.channels.twitter.posted_ids.push(...postedIds);
  entry.channels.twitter.status = 'posted';
  entry.updated_at = new Date().toISOString();

  savePublishLog(log);
}

// CLI mode
function main() {
  const args = process.argv.slice(2);
  const opts = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--entry-id': opts.entryId = args[++i]; break;
      case '--source': opts.source = args[++i]; break;
      case '--twitter-queue': opts.twitterQueue = args[++i]; break;
      case '--twitter-ids': opts.twitterIds = args[++i]?.split(','); break;
      case '--twitter-posted': opts.twitterPosted = args[++i]?.split(','); break;
      case '--video-script': opts.videoScript = args[++i]; break;
      case '--shorts-script': opts.shortsScript = args[++i]; break;
      case '--youtube-id': opts.youtubeId = args[++i]; break;
    }
  }

  if (!opts.entryId) {
    console.error('Usage: --entry-id <id> [--source ...] [--twitter-queue ...] ...');
    process.exit(1);
  }

  const updates = { source: opts.source };

  if (opts.twitterQueue || opts.twitterIds) {
    updates.twitter = {
      queue_file: opts.twitterQueue || undefined,
      item_ids: opts.twitterIds || undefined,
      posted_ids: opts.twitterPosted || undefined,
      status: opts.twitterPosted ? 'posted' : 'queued',
    };
  }

  if (opts.videoScript) {
    updates.video = {
      script: opts.videoScript,
      youtube_id: opts.youtubeId || null,
      status: opts.youtubeId ? 'published' : 'scripted',
    };
  }

  if (opts.shortsScript) {
    updates.shorts = {
      script: opts.shortsScript,
      status: 'scripted',
    };
  }

  const entry = updatePublishLog(opts.entryId, updates);
  console.log(`[INFO] Updated publish_log entry: ${opts.entryId}`);
  console.log(JSON.stringify(entry, null, 2));
}

// Run if invoked directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  main();
}

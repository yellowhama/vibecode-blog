#!/usr/bin/env node

/**
 * Post scheduled tweets from the queue.
 *
 * Usage:
 *   node scripts/post-queue.mjs              # Normal mode
 *   DRY_RUN=true node scripts/post-queue.mjs # Dry-run mode
 *
 * Env vars:
 *   API_KEY, API_SECRET_KEY, ACCESS_TOKEN, ACCESS_TOKEN_SECRET
 *   DRY_RUN (optional)
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient, postThread, postStandalone } from './lib/twitter-client.mjs';
import {
  getActiveQueueFiles,
  loadQueue,
  saveQueue,
  validateQueue,
  getDueItems,
} from './lib/queue-manager.mjs';

const PUBLISH_LOG_PATH = path.resolve(import.meta.dirname, '../../../content/publish_log.json');

function updatePublishLogPosted(itemId, postedIds) {
  try {
    const log = JSON.parse(fs.readFileSync(PUBLISH_LOG_PATH, 'utf-8'));
    // Find entry that references this item
    for (const entry of Object.values(log.entries || {})) {
      const tw = entry.channels?.twitter;
      if (tw?.item_ids?.includes(itemId)) {
        if (!tw.posted_ids) tw.posted_ids = [];
        tw.posted_ids.push(...postedIds);
        tw.status = 'posted';
        entry.updated_at = new Date().toISOString();
        fs.writeFileSync(PUBLISH_LOG_PATH, JSON.stringify(log, null, 2) + '\n', 'utf-8');
        return;
      }
    }
  } catch {
    // publish_log.json may not exist or have matching entries — that's fine
  }
}

const DRY_RUN = process.env.DRY_RUN === 'true';

function log(level, msg, data) {
  const entry = { ts: new Date().toISOString(), level, msg, ...data };
  const fn = level === 'error' ? console.error : console.log;
  fn(JSON.stringify(entry));
}

async function main() {
  log('info', DRY_RUN ? 'Starting (DRY RUN)' : 'Starting');

  const now = new Date();
  const queueFiles = getActiveQueueFiles();

  if (queueFiles.length === 0) {
    log('info', 'No queue files found. Nothing to do.');
    return;
  }

  let client;
  if (!DRY_RUN) {
    client = createClient();
  }

  let totalPosted = 0;
  let totalFailed = 0;

  for (const { week, path } of queueFiles) {
    const queue = loadQueue(path);
    if (!queue) continue;

    // Validate content lengths
    const errors = validateQueue(queue);
    if (errors.length > 0) {
      log('error', 'Queue validation errors', { week, errors });
      continue;
    }

    const dueItems = getDueItems(queue, now);
    if (dueItems.length === 0) {
      log('info', 'No due items', { week });
      continue;
    }

    log('info', `Found ${dueItems.length} due item(s)`, { week });

    for (const item of dueItems) {
      if (DRY_RUN) {
        log('info', 'DRY RUN: Would post', {
          id: item.id,
          type: item.type,
          category: item.category,
          scheduledAt: item.scheduledAt,
          tweetCount: item.content.length,
          firstTweet: item.content[0]?.slice(0, 80) + '...',
        });
        totalPosted++;
        continue;
      }

      // Mark as posting (prevents double-post)
      item.status = 'posting';
      saveQueue(path, queue);

      try {
        let result;
        if (item.type === 'thread') {
          log('info', 'Posting thread', { id: item.id, tweets: item.content.length });
          result = await postThread(client, item.content);
        } else {
          log('info', 'Posting standalone', { id: item.id });
          result = await postStandalone(client, item.content[0]);
        }

        item.status = 'posted';
        item.postedIds = result.postedIds;
        item.postedAt = new Date().toISOString();
        item.error = null;
        totalPosted++;

        // Update publish_log.json if entry exists
        updatePublishLogPosted(item.id, result.postedIds);

        log('info', 'Posted successfully', {
          id: item.id,
          tweetIds: item.postedIds,
        });
      } catch (err) {
        // Check if partial (some tweets posted)
        const partialIds = item.postedIds?.length > 0;
        item.status = partialIds ? 'partial' : 'failed';
        item.error = err.message || String(err);
        totalFailed++;

        log('error', 'Posting failed', {
          id: item.id,
          status: item.status,
          error: item.error,
          postedIds: item.postedIds,
        });
      }

      saveQueue(path, queue);
    }
  }

  log('info', 'Done', { totalPosted, totalFailed, dryRun: DRY_RUN });

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  log('error', 'Fatal error', { error: err.message, stack: err.stack });
  process.exit(1);
});

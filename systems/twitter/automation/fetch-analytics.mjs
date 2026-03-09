#!/usr/bin/env node

/**
 * Fetch engagement metrics for posted tweets and save analytics.
 *
 * Scans queue files for posted items, fetches metrics via Twitter API v2,
 * and saves to content/twitter_queue/analytics/YYYY-wNN-metrics.json.
 *
 * Usage:
 *   node scripts/twitter/fetch-analytics.mjs
 *
 * Env vars:
 *   API_KEY, API_SECRET_KEY, ACCESS_TOKEN, ACCESS_TOKEN_SECRET
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from './lib/twitter-client.mjs';
import { getActiveQueueFiles, loadQueue } from './lib/queue-manager.mjs';

const ANALYTICS_DIR = path.resolve(
  import.meta.dirname,
  '../../content/twitter_queue/analytics'
);

function log(level, msg, data) {
  const entry = { ts: new Date().toISOString(), level, msg, ...data };
  const fn = level === 'error' ? console.error : console.log;
  fn(JSON.stringify(entry));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-w${String(weekNo).padStart(2, '0')}`;
}

async function fetchTweetMetrics(client, tweetIds) {
  if (!tweetIds.length) return {};

  const metrics = {};

  // Twitter API v2 Free tier: basic tweet lookup with public_metrics
  // Process in batches of 100 (API limit)
  for (let i = 0; i < tweetIds.length; i += 100) {
    const batch = tweetIds.slice(i, i + 100);
    try {
      const result = await client.v2.tweets(batch, {
        'tweet.fields': 'public_metrics,created_at',
      });

      if (result.data) {
        for (const tweet of result.data) {
          metrics[tweet.id] = {
            id: tweet.id,
            created_at: tweet.created_at,
            ...tweet.public_metrics,
            fetched_at: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      log('error', 'Failed to fetch metrics batch', {
        batch_start: i,
        error: err.message,
      });
    }
  }

  return metrics;
}

async function main() {
  const client = createClient();
  const queueFiles = getActiveQueueFiles();

  if (!queueFiles.length) {
    log('info', 'No queue files found');
    return;
  }

  // Collect all posted tweet IDs across all queues
  const allTweetIds = [];
  const tweetToQueue = {}; // tweetId -> { queueFile, itemId }

  for (const qf of queueFiles) {
    const queue = loadQueue(qf);
    for (const item of queue.items || []) {
      if (item.status === 'posted' && item.postedIds) {
        for (const tid of item.postedIds) {
          allTweetIds.push(tid);
          tweetToQueue[tid] = { queueFile: qf, itemId: item.id };
        }
      }
    }
  }

  if (!allTweetIds.length) {
    log('info', 'No posted tweets to fetch analytics for');
    return;
  }

  log('info', `Fetching metrics for ${allTweetIds.length} tweets`);
  const metrics = await fetchTweetMetrics(client, allTweetIds);

  // Group metrics by ISO week
  const weekBuckets = {};
  for (const [tweetId, data] of Object.entries(metrics)) {
    const week = data.created_at
      ? getISOWeek(new Date(data.created_at))
      : getISOWeek(new Date());
    if (!weekBuckets[week]) weekBuckets[week] = {};
    weekBuckets[week][tweetId] = data;
  }

  // Save per-week analytics files
  ensureDir(ANALYTICS_DIR);
  for (const [week, weekMetrics] of Object.entries(weekBuckets)) {
    const outPath = path.join(ANALYTICS_DIR, `${week}-metrics.json`);

    // Merge with existing data if file exists
    let existing = {};
    if (fs.existsSync(outPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
      } catch {
        existing = {};
      }
    }

    const merged = { ...existing, ...weekMetrics };
    fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf-8');
    log('info', `Wrote ${Object.keys(weekMetrics).length} metrics to ${outPath}`);
  }

  // Summary
  const totalImpressions = Object.values(metrics).reduce(
    (sum, m) => sum + (m.impression_count || 0),
    0
  );
  const totalLikes = Object.values(metrics).reduce(
    (sum, m) => sum + (m.like_count || 0),
    0
  );
  log('info', 'Analytics summary', {
    tweets_fetched: Object.keys(metrics).length,
    total_impressions: totalImpressions,
    total_likes: totalLikes,
  });
}

main().catch((err) => {
  log('error', 'Analytics fetch failed', { error: err.message });
  process.exit(1);
});

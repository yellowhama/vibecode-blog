#!/usr/bin/env node

/**
 * Generate weekly engagement report from Twitter analytics data.
 *
 * Reads per-tweet metrics from systems/twitter/queue/analytics/,
 * cross-references queue files for hook text/category/format,
 * and outputs a structured report to systems/analytics/reports/.
 *
 * Usage:
 *   node systems/analytics/generate-report.mjs
 *   node systems/analytics/generate-report.mjs --week 2026-w10
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const ANALYTICS_DIR = path.join(ROOT, 'systems/twitter/queue/analytics');
const QUEUE_DIR = path.join(ROOT, 'systems/twitter/queue');
const REPORTS_DIR = path.join(ROOT, 'systems/analytics/reports');

function log(level, msg, data) {
  const entry = { ts: new Date().toISOString(), level, msg, ...data };
  const fn = level === 'error' ? console.error : console.log;
  fn(JSON.stringify(entry));
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-w${String(weekNo).padStart(2, '0')}`;
}

function currentWeek() {
  return getISOWeek(new Date());
}

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Build a lookup: tweetId -> { hook, category, format, scheduledAt, itemId }
 * by scanning all queue files.
 */
function buildTweetIndex() {
  const index = {};
  if (!fs.existsSync(QUEUE_DIR)) return index;

  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const queue = loadJSON(path.join(QUEUE_DIR, file));
    if (!queue?.items) continue;

    for (const item of queue.items) {
      if (!item.postedIds?.length) continue;
      const hook = item.content?.[0] || '';
      const format = item.type || 'standalone';
      const category = item.category || 'unknown';

      for (const tid of item.postedIds) {
        index[tid] = {
          hook: hook.slice(0, 200),
          category,
          format,
          scheduledAt: item.scheduledAt || null,
          itemId: item.id,
        };
      }
    }
  }

  // Also scan archive/
  const archiveDir = path.join(QUEUE_DIR, 'archive');
  if (fs.existsSync(archiveDir)) {
    const archiveFiles = fs.readdirSync(archiveDir).filter(f => f.endsWith('.json'));
    for (const file of archiveFiles) {
      const queue = loadJSON(path.join(archiveDir, file));
      if (!queue?.items) continue;
      for (const item of queue.items) {
        if (!item.postedIds?.length) continue;
        const hook = item.content?.[0] || '';
        for (const tid of item.postedIds) {
          if (!index[tid]) {
            index[tid] = {
              hook: hook.slice(0, 200),
              category: item.category || 'unknown',
              format: item.type || 'standalone',
              scheduledAt: item.scheduledAt || null,
              itemId: item.id,
            };
          }
        }
      }
    }
  }

  return index;
}

function engagementRate(m) {
  const interactions = (m.like_count || 0) + (m.retweet_count || 0) + (m.reply_count || 0);
  const impressions = m.impression_count || 0;
  return impressions > 0 ? interactions / impressions : 0;
}

function getHourUTC(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).getUTCHours();
  } catch {
    return null;
  }
}

/**
 * Aggregate metrics for one week into a structured report.
 */
function generateWeekReport(week, metricsData, tweetIndex) {
  const tweetIds = Object.keys(metricsData);
  if (tweetIds.length === 0) return null;

  // Group by item (thread = multiple tweets → 1 item)
  const itemMap = {};
  for (const tid of tweetIds) {
    const m = metricsData[tid];
    const info = tweetIndex[tid] || { hook: '', category: 'unknown', format: 'standalone', scheduledAt: null, itemId: tid };
    const key = info.itemId;

    if (!itemMap[key]) {
      itemMap[key] = {
        itemId: key,
        hook: info.hook,
        category: info.category,
        format: info.format,
        scheduledAt: info.scheduledAt,
        impressions: 0,
        likes: 0,
        retweets: 0,
        replies: 0,
        quotes: 0,
        tweetCount: 0,
      };
    }
    itemMap[key].impressions += m.impression_count || 0;
    itemMap[key].likes += m.like_count || 0;
    itemMap[key].retweets += m.retweet_count || 0;
    itemMap[key].replies += m.reply_count || 0;
    itemMap[key].quotes += m.quote_count || 0;
    itemMap[key].tweetCount++;
  }

  const items = Object.values(itemMap);

  // Calculate engagement rate per item
  for (const item of items) {
    const interactions = item.likes + item.retweets + item.replies;
    item.engagement_rate = item.impressions > 0 ? interactions / item.impressions : 0;
  }

  // Sort by engagement rate
  const sorted = [...items].sort((a, b) => b.engagement_rate - a.engagement_rate);
  const topHooks = sorted.slice(0, 3).map(i => ({
    text: i.hook,
    engagement_rate: Math.round(i.engagement_rate * 10000) / 10000,
    impressions: i.impressions,
    category: i.category,
    format: i.format,
  }));
  const bottomHooks = sorted.slice(-3).reverse().map(i => ({
    text: i.hook,
    engagement_rate: Math.round(i.engagement_rate * 10000) / 10000,
    impressions: i.impressions,
    category: i.category,
    format: i.format,
  }));

  // By category
  const byCategory = {};
  for (const item of items) {
    if (!byCategory[item.category]) {
      byCategory[item.category] = { count: 0, impressions: 0, likes: 0, retweets: 0, replies: 0 };
    }
    const cat = byCategory[item.category];
    cat.count++;
    cat.impressions += item.impressions;
    cat.likes += item.likes;
    cat.retweets += item.retweets;
    cat.replies += item.replies;
  }
  for (const cat of Object.values(byCategory)) {
    const interactions = cat.likes + cat.retweets + cat.replies;
    cat.avg_engagement_rate = cat.impressions > 0
      ? Math.round((interactions / cat.impressions) * 10000) / 10000
      : 0;
  }

  // By format
  const byFormat = {};
  for (const item of items) {
    if (!byFormat[item.format]) {
      byFormat[item.format] = { count: 0, impressions: 0, total_engagement_rate: 0 };
    }
    byFormat[item.format].count++;
    byFormat[item.format].impressions += item.impressions;
    byFormat[item.format].total_engagement_rate += item.engagement_rate;
  }
  for (const fmt of Object.values(byFormat)) {
    fmt.avg_engagement_rate = fmt.count > 0
      ? Math.round((fmt.total_engagement_rate / fmt.count) * 10000) / 10000
      : 0;
    delete fmt.total_engagement_rate;
  }

  // By hour UTC (from scheduledAt)
  const byHourUTC = {};
  for (const item of items) {
    const hour = getHourUTC(item.scheduledAt);
    if (hour === null) continue;
    const key = String(hour).padStart(2, '0');
    if (!byHourUTC[key]) {
      byHourUTC[key] = { count: 0, total_engagement_rate: 0 };
    }
    byHourUTC[key].count++;
    byHourUTC[key].total_engagement_rate += item.engagement_rate;
  }
  for (const h of Object.values(byHourUTC)) {
    h.avg_engagement_rate = h.count > 0
      ? Math.round((h.total_engagement_rate / h.count) * 10000) / 10000
      : 0;
    delete h.total_engagement_rate;
  }

  // Summary
  const totalImpressions = items.reduce((s, i) => s + i.impressions, 0);
  const totalInteractions = items.reduce((s, i) => s + i.likes + i.retweets + i.replies, 0);
  const avgEngagement = totalImpressions > 0
    ? Math.round((totalInteractions / totalImpressions) * 10000) / 10000
    : 0;

  // Best format
  let bestFormat = null;
  let bestFormatRate = -1;
  for (const [fmt, data] of Object.entries(byFormat)) {
    if (data.avg_engagement_rate > bestFormatRate) {
      bestFormatRate = data.avg_engagement_rate;
      bestFormat = fmt;
    }
  }

  return {
    week,
    generated_at: new Date().toISOString(),
    summary: {
      total_items: items.length,
      total_tweets: tweetIds.length,
      total_impressions: totalImpressions,
      avg_engagement_rate: avgEngagement,
      best_format: bestFormat,
    },
    top_hooks: topHooks,
    bottom_hooks: bottomHooks,
    by_category: byCategory,
    by_format: byFormat,
    by_hour_utc: byHourUTC,
  };
}

function main() {
  // Parse --week argument
  const args = process.argv.slice(2);
  let targetWeek = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--week' && args[i + 1]) {
      targetWeek = args[i + 1];
    }
  }

  if (!fs.existsSync(ANALYTICS_DIR)) {
    log('info', 'No analytics directory found', { path: ANALYTICS_DIR });
    return;
  }

  const metricsFiles = fs.readdirSync(ANALYTICS_DIR)
    .filter(f => f.endsWith('-metrics.json'))
    .sort();

  if (metricsFiles.length === 0) {
    log('info', 'No metrics files found');
    return;
  }

  const tweetIndex = buildTweetIndex();
  log('info', `Tweet index built`, { entries: Object.keys(tweetIndex).length });

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  let generated = 0;

  for (const file of metricsFiles) {
    // Extract week from filename: YYYY-wNN-metrics.json
    const week = file.replace('-metrics.json', '');
    if (targetWeek && week !== targetWeek) continue;

    const metricsData = loadJSON(path.join(ANALYTICS_DIR, file));
    if (!metricsData) continue;

    const report = generateWeekReport(week, metricsData, tweetIndex);
    if (!report) continue;

    const outPath = path.join(REPORTS_DIR, `${week}-report.json`);
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
    log('info', `Report generated`, { week, path: outPath, items: report.summary.total_items });
    generated++;
  }

  log('info', 'Done', { reports_generated: generated });
}

main();

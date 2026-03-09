#!/usr/bin/env node

/**
 * Build feedback context markdown from recent weekly reports.
 *
 * Reads the last 4 weeks of reports from systems/analytics/reports/
 * and generates systems/analytics/feedback-context.md for use by
 * content creation skills (twitter-plan, twitter-draft, multiply).
 *
 * Usage:
 *   node systems/analytics/build-feedback-context.mjs
 *   node systems/analytics/build-feedback-context.mjs --weeks 8
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const REPORTS_DIR = path.join(ROOT, 'systems/analytics/reports');
const OUTPUT_PATH = path.join(ROOT, 'systems/analytics/feedback-context.md');

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function main() {
  const args = process.argv.slice(2);
  let maxWeeks = 4;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--weeks' && args[i + 1]) {
      maxWeeks = parseInt(args[i + 1], 10) || 4;
    }
  }

  if (!fs.existsSync(REPORTS_DIR)) {
    console.log('[INFO] No reports directory found. Nothing to build.');
    return;
  }

  const reportFiles = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.endsWith('-report.json'))
    .sort()
    .slice(-maxWeeks);

  if (reportFiles.length === 0) {
    console.log('[INFO] No report files found.');
    return;
  }

  const reports = reportFiles
    .map(f => loadJSON(path.join(REPORTS_DIR, f)))
    .filter(Boolean);

  if (reports.length === 0) {
    console.log('[INFO] No valid reports loaded.');
    return;
  }

  // Collect all top/bottom hooks across weeks
  const allTopHooks = [];
  const allBottomHooks = [];

  for (const report of reports) {
    const week = report.week;
    for (const hook of report.top_hooks || []) {
      allTopHooks.push({ ...hook, week });
    }
    for (const hook of report.bottom_hooks || []) {
      allBottomHooks.push({ ...hook, week });
    }
  }

  // Sort by engagement rate
  allTopHooks.sort((a, b) => b.engagement_rate - a.engagement_rate);
  allBottomHooks.sort((a, b) => a.engagement_rate - b.engagement_rate);

  // Aggregate format stats
  const formatStats = {};
  for (const report of reports) {
    for (const [fmt, data] of Object.entries(report.by_format || {})) {
      if (!formatStats[fmt]) formatStats[fmt] = { count: 0, totalRate: 0 };
      formatStats[fmt].count += data.count;
      formatStats[fmt].totalRate += data.avg_engagement_rate * data.count;
    }
  }

  // Aggregate hour stats
  const hourStats = {};
  for (const report of reports) {
    for (const [hour, data] of Object.entries(report.by_hour_utc || {})) {
      if (!hourStats[hour]) hourStats[hour] = { count: 0, totalRate: 0 };
      hourStats[hour].count += data.count;
      hourStats[hour].totalRate += data.avg_engagement_rate * data.count;
    }
  }

  // Aggregate category stats
  const catStats = {};
  for (const report of reports) {
    for (const [cat, data] of Object.entries(report.by_category || {})) {
      if (!catStats[cat]) catStats[cat] = { count: 0, impressions: 0, likes: 0, retweets: 0, replies: 0 };
      catStats[cat].count += data.count;
      catStats[cat].impressions += data.impressions;
      catStats[cat].likes += data.likes;
      catStats[cat].retweets += data.retweets || 0;
      catStats[cat].replies += data.replies || 0;
    }
  }

  // Find best hour
  let bestHour = null;
  let bestHourRate = -1;
  for (const [hour, data] of Object.entries(hourStats)) {
    const avg = data.count > 0 ? data.totalRate / data.count : 0;
    if (avg > bestHourRate) {
      bestHourRate = avg;
      bestHour = hour;
    }
  }

  // Find best format
  let bestFormat = null;
  let bestFormatRate = -1;
  for (const [fmt, data] of Object.entries(formatStats)) {
    const avg = data.count > 0 ? data.totalRate / data.count : 0;
    if (avg > bestFormatRate) {
      bestFormatRate = avg;
      bestFormat = fmt;
    }
  }

  // Format comparison
  const formatComparison = Object.entries(formatStats)
    .map(([fmt, data]) => {
      const avg = data.count > 0 ? data.totalRate / data.count : 0;
      return { format: fmt, avg_rate: avg, count: data.count };
    })
    .sort((a, b) => b.avg_rate - a.avg_rate);

  // Build markdown
  const weekRange = reports.map(r => r.week).join(', ');
  const lines = [];

  lines.push(`# Performance Feedback (최근 ${reports.length}주)`);
  lines.push('');
  lines.push(`> 기간: ${weekRange}`);
  lines.push(`> 생성: ${new Date().toISOString()}`);
  lines.push('');

  // Top hooks
  lines.push('## 잘 된 Hook');
  lines.push('');
  for (let i = 0; i < Math.min(allTopHooks.length, 5); i++) {
    const h = allTopHooks[i];
    const hookPreview = h.text.split('\n')[0].slice(0, 80);
    lines.push(`${i + 1}. "${hookPreview}" — ${(h.engagement_rate * 100).toFixed(1)}% engagement (${h.week})`);
  }
  lines.push('');

  // Bottom hooks
  lines.push('## 안 된 Hook');
  lines.push('');
  for (let i = 0; i < Math.min(allBottomHooks.length, 3); i++) {
    const h = allBottomHooks[i];
    const hookPreview = h.text.split('\n')[0].slice(0, 80);
    lines.push(`${i + 1}. "${hookPreview}" — ${(h.engagement_rate * 100).toFixed(1)}% engagement (${h.week})`);
  }
  lines.push('');

  // Patterns
  lines.push('## 패턴');
  lines.push('');

  if (formatComparison.length > 1) {
    const top = formatComparison[0];
    const bottom = formatComparison[formatComparison.length - 1];
    if (bottom.avg_rate > 0) {
      const ratio = (top.avg_rate / bottom.avg_rate).toFixed(1);
      lines.push(`- ${top.format}가 ${bottom.format} 대비 ${ratio}x 높음`);
    } else {
      lines.push(`- ${top.format} 포맷이 가장 높은 engagement`);
    }
  }

  if (bestHour !== null) {
    lines.push(`- ${bestHour}:00 UTC가 최적 시간대`);
  }

  for (const [cat, data] of Object.entries(catStats)) {
    const interactions = data.likes + data.retweets + data.replies;
    const rate = data.impressions > 0 ? interactions / data.impressions : 0;
    lines.push(`- "${cat}" 카테고리 평균 ${(rate * 100).toFixed(1)}%`);
  }
  lines.push('');

  // Recommendations
  lines.push('## 권장');
  lines.push('');

  // Analyze hook patterns from top performers
  const emotionStarters = allTopHooks.filter(h => {
    const first = h.text.split('\n')[0].toLowerCase();
    return /^(i |my |we |can't|couldn't|never|nothing|every|monday|three|fury)/.test(first);
  });
  if (emotionStarters.length > 0) {
    lines.push('- 감정/행동으로 시작하는 hook 선호 (상위 hook 패턴)');
  }

  if (bestFormat === 'thread') {
    lines.push('- Thread 포맷이 standalone 대비 성과 우수');
  }

  if (bestHour !== null) {
    lines.push(`- ${bestHour}:00 UTC 발행 시간 유지 권장`);
  }

  // Hook length analysis
  const avgTopLen = allTopHooks.length > 0
    ? allTopHooks.reduce((s, h) => s + h.text.split('\n').length, 0) / allTopHooks.length
    : 0;
  if (avgTopLen > 0) {
    lines.push(`- 상위 hook 평균 ${Math.round(avgTopLen)}줄 — 짧은 펀치 유지`);
  }

  lines.push('');

  const markdown = lines.join('\n');
  fs.writeFileSync(OUTPUT_PATH, markdown, 'utf-8');
  console.log(`[INFO] Wrote feedback context to ${OUTPUT_PATH} (${reports.length} weeks, ${lines.length} lines)`);
}

main();

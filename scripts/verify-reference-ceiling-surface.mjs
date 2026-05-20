import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCORE_SURFACE_PATH = "src/data/reference-ceiling-scores.json";
const reportPath = join(tmpdir(), `vibecode-reference-ceiling-${process.pid}.json`);

function fail(failures) {
  process.stderr.write("Reference ceiling surface gate failed.\n");
  for (const failure of failures) process.stderr.write(`- ${failure}\n`);
  process.stdout.write("reference_ceiling_surface_gate=fail\n");
  process.exit(1);
}

const audit = spawnSync(process.execPath, [
  "scripts/audit-reference-ceiling.mjs",
  "--output",
  reportPath,
], {
  encoding: "utf8",
});

if (audit.stdout) process.stdout.write(audit.stdout);
if (audit.stderr) process.stderr.write(audit.stderr);
if (audit.status !== 0) {
  process.stdout.write("reference_ceiling_surface_gate=fail\n");
  process.exit(audit.status ?? 1);
}

const [surfaceText, reportText] = await Promise.all([
  readFile(SCORE_SURFACE_PATH, "utf8"),
  readFile(reportPath, "utf8"),
]);
await rm(reportPath, { force: true });

const surface = JSON.parse(surfaceText);
const report = JSON.parse(reportText);
const scoredPosts = report.posts.filter(post => !post.skipped);
const scoredSlugs = new Set(scoredPosts.map(post => post.slug));
const failures = [];

if (surface.averageScore !== report.averageScore) {
  failures.push(`averageScore is ${surface.averageScore}, expected ${report.averageScore}`);
}

for (const slug of Object.keys(surface.posts)) {
  if (!scoredSlugs.has(slug)) failures.push(`surface score has stale or unscored slug: ${slug}`);
}

for (const post of scoredPosts) {
  const entry = surface.posts[post.slug];
  if (!entry) {
    failures.push(`missing surface score for ${post.slug}`);
    continue;
  }
  if (entry.score !== post.score) {
    failures.push(`${post.slug}: surface score ${entry.score}, expected ${post.score}`);
  }
  if (entry.grade !== post.grade) {
    failures.push(`${post.slug}: surface grade ${entry.grade}, expected ${post.grade}`);
  }
}

process.stdout.write(`reference_ceiling_surface_scores_checked=${scoredPosts.length}\n`);
process.stdout.write(`reference_ceiling_surface_average_score=${surface.averageScore}\n`);

if (failures.length > 0) fail(failures);

process.stdout.write("reference_ceiling_surface_gate=pass\n");

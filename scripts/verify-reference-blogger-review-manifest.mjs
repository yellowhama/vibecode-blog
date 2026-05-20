import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_MANIFEST = "src/data/reference-blogger-review-artifacts.json";
const REVIEW_ARTIFACT_SCRIPT = resolve("scripts/generate-reference-blogger-review-artifact.mjs");
const REVISION_PLAN_SCRIPT = resolve("scripts/generate-reference-blogger-revision-plan.mjs");

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function clean(value) {
  return String(value ?? "").trim();
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

async function readJson(path) {
  if (!existsSync(path)) throw new Error(`missing JSON file: ${path}`);
  return JSON.parse(await readFile(path, "utf8"));
}

function runNodeScript(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function commandOutput(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
}

function requirePass(label, result) {
  if (result.status === 0) return;
  throw new Error(`${label} failed with exit ${result.status}\n${commandOutput(result)}`);
}

function validateManifestShape(manifest) {
  const failures = [];
  if (manifest.schema !== "vibecode-reference-blogger-review-artifacts/v1") {
    failures.push("manifest.schema must be vibecode-reference-blogger-review-artifacts/v1");
  }
  const artifacts = asArray(manifest.artifacts);
  if (artifacts.length === 0) failures.push("manifest.artifacts must include at least one artifact");
  const slugs = new Set();
  for (const [index, artifact] of artifacts.entries()) {
    const label = `artifacts[${index}]`;
    if (clean(artifact.slug).length < 2) failures.push(`${label}.slug is required`);
    if (slugs.has(artifact.slug)) failures.push(`${label}.slug is duplicated: ${artifact.slug}`);
    slugs.add(artifact.slug);
    for (const key of ["blogDir", "reviewArtifact", "summary", "reviewResult", "revisionPlan"]) {
      if (clean(artifact[key]).length < 3) failures.push(`${label}.${key} is required`);
    }
  }
  return failures;
}

function validateAcceptedState(slug, review, plan) {
  const failures = [];
  if (review.schema !== "vibecode-reference-blogger-review-result/v1") {
    failures.push(`${slug}: review result schema is invalid`);
  }
  if (review.slug !== slug) failures.push(`${slug}: review result slug mismatch`);
  if (review.overallDecision !== "accepted") {
    failures.push(`${slug}: manifest-maintained review result must be accepted`);
  }
  const rejectedRows = asArray(review.rowDecisions).filter((item) => item.verdict === "reject");
  if (rejectedRows.length > 0) {
    failures.push(`${slug}: manifest-maintained review result still has rejected rows: ${rejectedRows.map((item) => item.row).join(",")}`);
  }
  if (plan.schema !== "vibecode-reference-blogger-revision-plan/v1") {
    failures.push(`${slug}: revision plan schema is invalid`);
  }
  if (plan.slug !== slug) failures.push(`${slug}: revision plan slug mismatch`);
  if (plan.rejectedRowCount !== 0) failures.push(`${slug}: revision plan rejectedRowCount must be 0`);
  if (asArray(plan.items).length !== 0) failures.push(`${slug}: revision plan items must be empty`);
  if (plan.planStatus !== "no_body_revision_required") {
    failures.push(`${slug}: revision plan must be no_body_revision_required`);
  }
  if (plan.nextGate !== "eligible_for_human_publication_review") {
    failures.push(`${slug}: revision plan nextGate must be eligible_for_human_publication_review`);
  }
  return failures;
}

async function verifyEntry(entry) {
  const slug = clean(entry.slug);
  const reviewCheck = runNodeScript(REVIEW_ARTIFACT_SCRIPT, [
    "--slug",
    slug,
    "--blog-dir",
    entry.blogDir,
    "--output",
    entry.reviewArtifact,
    "--summary",
    entry.summary,
    "--check",
  ]);
  requirePass(`${slug}: reference blogger review artifact check`, reviewCheck);

  const revisionCheck = runNodeScript(REVISION_PLAN_SCRIPT, [
    "--summary",
    entry.summary,
    "--review",
    entry.reviewResult,
    "--output",
    entry.revisionPlan,
    "--check",
  ]);
  requirePass(`${slug}: reference blogger revision plan check`, revisionCheck);

  const [review, plan] = await Promise.all([readJson(entry.reviewResult), readJson(entry.revisionPlan)]);
  return validateAcceptedState(slug, review, plan);
}

async function main() {
  const manifestPath = getArg("--manifest") ?? DEFAULT_MANIFEST;
  const manifest = await readJson(manifestPath);
  const failures = validateManifestShape(manifest);
  if (failures.length === 0) {
    for (const entry of manifest.artifacts) {
      failures.push(...(await verifyEntry(entry)));
    }
  }

  process.stdout.write(`reference_blogger_review_manifest=${resolve(manifestPath)}\n`);
  process.stdout.write(`reference_blogger_review_manifest_items=${asArray(manifest.artifacts).length}\n`);

  if (failures.length > 0) {
    process.stderr.write("Reference blogger review manifest gate failed.\n");
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("reference_blogger_review_manifest_gate=fail\n");
    return 1;
  }

  process.stdout.write("reference_blogger_review_manifest_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

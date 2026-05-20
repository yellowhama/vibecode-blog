import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const DEFAULT_WIKI_ROOT =
  process.env.LLM_WIKI_ROOT ?? String.raw`F:\Aisaak\CompanyArtifacts\llm-wiki-completed`;
const PACKET_SUFFIXES = [
  "reader-pressure",
  "title-angle",
  "evidence-bundle",
  "brief",
  "gate-0",
  "draft-critique",
];

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function requiredArg(name) {
  const value = getArg(name);
  if (!value?.trim()) {
    throw new Error(`missing required argument: ${name}`);
  }
  return value.trim();
}

function slugIsValid(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function splitList(value) {
  return (value ?? "")
    .split(/[;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function bulletList(items, fallback) {
  const values = items.length > 0 ? items : fallback;
  return values.map((item) => `- ${item}`).join("\n");
}

async function fileExists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function packetPath(wikiRoot, slug, suffix) {
  return join(wikiRoot, "companies", "vibecode-town", "plans", `${slug}-${suffix}.md`);
}

function packetText(suffix, context) {
  const {
    slug,
    title,
    sourceUrl,
    readerProblem,
    internalEvidence,
    avoid,
    mustInclude,
    nonClaims,
    hook,
    corePoint,
  } = context;

  const internalEvidenceBullets = bulletList(internalEvidence, [
    `planned blog source: src/data/blog/${slug}.md`,
    "quality gate: npm run verify:source-workflow-quality",
    "publication gate: npm run verify:publication-approvals",
  ]);
  const avoidBullets = bulletList(avoid, [
    "Avoid generic AI productivity claims.",
    "Avoid internal status narration without reader stakes.",
    "Avoid claims that are not supported by the evidence bundle.",
  ]);
  const mustIncludeBullets = bulletList(mustInclude, [
    "a concrete opening failure or visible action",
    "public source provenance",
    "internal proof artifacts",
    "accept/reject transfer for the reader",
  ]);
  const nonClaimBullets = bulletList(nonClaims, [
    "Do not claim the source proves the whole category.",
    "Do not claim a green gate proves final human taste.",
    "Do not publish without rendered proof and human approval.",
  ]);

  const packets = {
    "reader-pressure": `# ${title} - Reader Pressure

## Reader Problem
${readerProblem}

## Pressure
If the post does not name the cost, failure, or trust risk, it will read like a competent summary instead of a useful public article.

## Reader Question
What should the reader accept, reject, or verify before using this idea?

## Required Reader Decision
Before drafting, decide the source-backed claim, the proof artifact, the boundary, and the reject condition.`,
    "title-angle": `# ${title} - Title Angle

## Title
${title}

## Angle
${corePoint}

## Avoid
${avoidBullets}

## Must Include
${mustIncludeBullets}`,
    "evidence-bundle": `# ${title} - Evidence Bundle

## Public References
- Primary source: ${sourceUrl}

## Internal Evidence
${internalEvidenceBullets}

## Non-Claims
${nonClaimBullets}`,
    brief: `# ${title} - Brief

## Hook
${hook}

## Core Point
${corePoint}

## Structure
1. Open on a visible failure, cost, or proof artifact.
2. Map the public source to the internal evidence.
3. Explain the mechanism.
4. Give the reader an accept/reject artifact.
5. Name the boundary.

## Proof
Use the public source, the internal evidence bundle, and the source workflow quality gate receipt.

## Tone
Specific, skeptical, evidence-backed, and useful. No generic AI booster copy.`,
    "gate-0": `# ${title} - Gate 0

## Required Checks
- Does the opening show a concrete failure, scene, or action?
- Does the evidence bundle include public and internal evidence?
- Does the draft give the reader an accept/reject decision?
- Does the boundary prevent overclaiming?

## Reject If
- The draft has no inspectable evidence.
- The draft reads like internal status instead of a public article.
- The reader cannot tell what to do differently.

## Verdict
Proceed only if the packet can guide a strong draft without guessing. Reject and repair the packet if the source, evidence, or reader decision is missing.`,
    "draft-critique": `# ${title} - Draft Critique

## Current Risk
The draft can sound like a summary of the source instead of a sharp blog post with a visible scene and reader transfer.

## Revision Pressure
Every revision must add one of these: visible scene, named artifact, source-backed mechanism, before/after contrast, or accept/reject tool.

## Quality Bar
- Reference-writing score should be 100.
- Reference-ceiling score should be 100 or have a named next repair.
- The draft should be understandable without reading internal chat history.

## Expected Score
Target: reference-ceiling ready before public approval.`,
  };

  return `${packets[suffix]}\n`;
}

async function writeValidationBlog(root, slug, title) {
  const blogDir = join(root, "blog");
  await mkdir(blogDir, { recursive: true });
  await writeFile(
    join(blogDir, `${slug}.md`),
    `---\ntitle: "${title}"\npubDatetime: 2026-05-20T00:00:00Z\ndescription: "Packet validation fixture."\ndraft: false\nseries: "AI Tool Note"\nworkflow: "packet"\n---\n\n# ${title}\n`,
    "utf8",
  );
  return blogDir;
}

function runQualityGate({ blogDir, wikiRoot }) {
  return spawnSync(
    process.execPath,
    [
      resolve("scripts/verify-source-workflow-quality.mjs"),
      "--blog-dir",
      blogDir,
      "--wiki-root",
      wikiRoot,
    ],
    {
      cwd: resolve("."),
      encoding: "utf8",
    },
  );
}

async function main() {
  const slug = requiredArg("--slug");
  if (!slugIsValid(slug)) {
    throw new Error("--slug must be lowercase kebab-case");
  }

  const title = requiredArg("--title");
  const sourceUrl = requiredArg("--source-url");
  if (!/^https?:\/\//i.test(sourceUrl)) {
    throw new Error("--source-url must be an http(s) URL");
  }

  const readerProblem = getArg("--reader-problem")?.trim() || `The reader needs a source-backed reason to care about ${title}.`;
  const hook = getArg("--hook")?.trim() || `The weak version starts with the topic. The strong version starts with the failure the topic repairs.`;
  const corePoint = getArg("--core-point")?.trim() || `Turn the source into a concrete operating decision, not a generic AI trend summary.`;
  const internalEvidence = splitList(getArg("--internal-evidence"));
  const avoid = splitList(getArg("--avoid"));
  const mustInclude = splitList(getArg("--must-include"));
  const nonClaims = splitList(getArg("--non-claims"));
  const wikiRoot = resolve(getArg("--wiki-root") ?? DEFAULT_WIKI_ROOT);
  const overwrite = hasArg("--overwrite");

  const planDir = join(wikiRoot, "companies", "vibecode-town", "plans");
  await mkdir(planDir, { recursive: true });

  const context = {
    slug,
    title,
    sourceUrl,
    readerProblem,
    internalEvidence,
    avoid,
    mustInclude,
    nonClaims,
    hook,
    corePoint,
  };

  const written = [];
  for (const suffix of PACKET_SUFFIXES) {
    const path = packetPath(wikiRoot, slug, suffix);
    if (!overwrite && (await fileExists(path))) {
      throw new Error(`packet already exists, pass --overwrite to replace: ${path}`);
    }
    await writeFile(path, packetText(suffix, context), "utf8");
    written.push(path);
  }

  const tempRoot = await makeTestTempDir("vibecode-source-packet-create-");
  const blogDir = await writeValidationBlog(tempRoot, slug, title);
  const result = runQualityGate({ blogDir, wikiRoot });
  process.stdout.write(result.stdout);
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.stdout.write("source_workflow_packet_create_gate=fail\n");
    return result.status ?? 1;
  }

  for (const path of written) {
    process.stdout.write(`source_workflow_packet_written=${path}\n`);
  }
  process.stdout.write(`source_workflow_packet_slug=${slug}\n`);
  process.stdout.write("source_workflow_packet_create_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

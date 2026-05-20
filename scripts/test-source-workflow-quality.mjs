import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = "scripts/verify-source-workflow-quality.mjs";
const suffixes = [
  "reader-pressure",
  "title-angle",
  "evidence-bundle",
  "brief",
  "gate-0",
  "draft-critique",
];

function run(args) {
  return spawnSync(process.execPath, [resolve(verifier), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function writeArticle(dir, slug, draft = false, series = "AI Tool Note") {
  await writeFile(
    join(dir, `${slug}.md`),
    `---\ntitle: "${slug}"\npubDatetime: 2026-05-20T00:00:00Z\ndescription: "Fixture."\ndraft: ${draft ? "true" : "false"}\nseries: "${series}"\nworkflow: "packet"\n---\n\n# ${slug}\n`,
    "utf8",
  );
}

function strongPacket(suffix) {
  const packets = {
    "reader-pressure": `# Reader Pressure

## Reader Problem
The reader thinks the topic is obvious and needs the hidden failure named.

## Pressure
The post must show why ignoring this costs time, trust, approval, or deployment safety.

## Reader Question
What should I do differently before I let an agent draft?

## Required Reader Decision
Before drafting, choose the source, boundary, proof command, and reject condition.`,
    "title-angle": `# Title Angle

## Title
The Agent Writing System Needs Evidence Before Drafting

## Angle
This is not about prettier prose. It is about forcing source-backed writing before generation.

## Avoid
- Avoid generic AI productivity claims.
- Avoid vibes without proof.

## Must Include
- source packet
- evidence inventory
- reader decision
- rejection rule`,
    "evidence-bundle": `# Evidence Bundle

## Public References
- Reference post: https://example.com/reference

## Internal Evidence
- script: scripts/verify-source-workflow-quality.mjs
- gate: npm run verify:source-workflow-quality
- receipt: source_workflow_quality_packets_checked=6

## Non-Claims
- Do not claim a gate proves taste.
- Do not claim one source is enough for every post.`,
    brief: `# Brief

## Hook
The weak post starts at the draft. The strong post starts at the evidence.

## Core Point
Writing quality depends on source pressure before generation.

## Structure
1. Name the failure.
2. Show the artifact chain.
3. Give the reader a decision.

## Proof
Use the source workflow quality gate and internal receipt evidence.

## Tone
Plain, skeptical, specific.`,
    "gate-0": `# Gate 0

## Required Checks
- Does the opening name a failure?
- Does the evidence bundle include public and internal sources?

## Reject If
- The post has no reader decision.
- The evidence is just vibes.

## Verdict
Proceed only if the source packet can guide a draft without guessing. Reject otherwise.`,
    "draft-critique": `# Draft Critique

## Current Risk
The draft can sound like an operating note instead of a blog post.

## Revision Pressure
Every section must add a visible artifact, sharper example, or reader decision.

## Quality Bar
- opening scene is concrete
- evidence is cited
- reader can accept or reject the idea

## Expected Score
Target: reference-ceiling ready.`,
  };

  return packets[suffix];
}

async function writePacketSet(wikiRoot, slug, override = {}) {
  const planDir = join(wikiRoot, "companies", "vibecode-town", "plans");
  await mkdir(planDir, { recursive: true });
  for (const suffix of suffixes) {
    await writeFile(join(planDir, `${slug}-${suffix}.md`), override[suffix] ?? strongPacket(suffix), "utf8");
  }
}

async function main() {
  const root = await makeTestTempDir("vibecode-source-workflow-quality-");
  try {
    const blogDir = join(root, "blog");
    const wikiRoot = join(root, "wiki");
    await mkdir(blogDir, { recursive: true });

    await writeArticle(blogDir, "strong-post");
    await writePacketSet(wikiRoot, "strong-post");
    let result = run(["--blog-dir", blogDir, "--wiki-root", wikiRoot]);
    if (result.status !== 0 || !result.stdout.includes("source_workflow_quality_gate=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected strong source workflow quality fixture to pass");
    }
    process.stdout.write("source_workflow_quality_positive_self_test=pass\n");

    const weakBlogDir = join(root, "weak-blog");
    const weakWikiRoot = join(root, "weak-wiki");
    await mkdir(weakBlogDir, { recursive: true });
    await writeArticle(weakBlogDir, "weak-post");
    await writePacketSet(weakWikiRoot, "weak-post", {
      "evidence-bundle": "# Evidence Bundle\n\n## Public References\nTBD\n\n## Internal Evidence\nTODO\n\n## Non-Claims\nTODO\n",
    });
    result = run(["--blog-dir", weakBlogDir, "--wiki-root", weakWikiRoot]);
    if (
      result.status === 0 ||
      !result.stdout.includes("source_workflow_quality_gate=fail") ||
      !result.stderr.includes("evidence bundle must include at least one public source URL")
    ) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected weak source workflow quality fixture to fail");
    }
    process.stdout.write("source_workflow_quality_negative_self_test=pass\n");

    const missingWikiBlogDir = join(root, "missing-wiki-blog");
    await mkdir(missingWikiBlogDir, { recursive: true });
    await writeArticle(missingWikiBlogDir, "skip-post");
    result = run(["--blog-dir", missingWikiBlogDir, "--wiki-root", join(root, "missing-wiki")]);
    if (result.status !== 0 || !result.stdout.includes("source_workflow_quality_gate=skip")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected missing wiki root to skip source workflow quality gate");
    }
    process.stdout.write("source_workflow_quality_missing_wiki_self_test=pass\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

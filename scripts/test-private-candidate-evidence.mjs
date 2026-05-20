import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { makeTestTempDir } from "./test-temp-root.mjs";

const imageGenerator = "scripts/generate-private-image-contract.mjs";
const candidateGenerator = "scripts/generate-private-rendered-candidate.mjs";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function run(script, args) {
  return spawnSync(process.execPath, [resolve(script), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function writeFixture(root, extra = "") {
  const blogDir = join(root, "blog");
  await mkdir(blogDir, { recursive: true });
  const markdown = `---
title: "Candidate Fixture"
draft: true
workflow: "packet"
ogImage: "/images/posts/candidate-fixture.png"
---

# Candidate Fixture

> It is 8:17 p.m. The agent says five posts are ready. Then the editor asks which source changed the claim.

## Packet Receipt

\`\`\`txt
approval_candidate=false
candidate_blockers=human_critique,rendered_candidate,hash_approval,image_contract
\`\`\`

## The Paragraph That Gets Past You

The bad paragraph says the agent installed enough tools to publish.

## The Failure Is Not Style

Here is the smaller failure ledger.

That is the failure path: empty prompt, vanished source URL, no before/after trace, reusable image, and a queue item that looks finished before a human can inspect the artifact.

A useful content agent brings you to the decision; it does not quietly become the decision.

## Visual Evidence

![Source map](fixture-source-map.png)

![Queue proof](fixture-queue.png)

## The Pattern Worth Stealing

The pattern is grounding before generation.

## The Table To Use Before You Prompt Again

| If | Accept | Reject |
| --- | --- | --- |
| It writes | Source trace | Vibe |

## Approval Candidate Verdict

Not approved.

${extra}
`;
  await writeFile(join(blogDir, "candidate-fixture.md"), markdown, "utf8");
  return { blogDir, markdown };
}

async function writeReview(root, markdown) {
  const review = {
    schema: "vibecode-human-quality-review/v1",
    slug: "candidate-fixture",
    markdownSha256: sha256(markdown),
    promotionAllowedWithoutHuman: false,
    reviewer: { name: "Test Reviewer", reviewedAt: "2026-05-20T00:00:00Z" },
    decision: "keep_internal_example",
    scorecard: [
      { label: "First 30 seconds", verdict: "accept" },
      { label: "Evidence density", verdict: "accept" },
    ],
  };
  const reviewPath = join(root, "review.json");
  await writeFile(reviewPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");
  return reviewPath;
}

async function main() {
  const root = await makeTestTempDir("vibecode-private-candidate-");
  try {
    const { blogDir, markdown } = await writeFixture(root);
    const reviewPath = await writeReview(root, markdown);
    const image = join(root, "candidate.png");
    const contract = join(root, "contract.json");
    const html = join(root, "candidate.html");
    const summary = join(root, "candidate-summary.json");

    let result = run(imageGenerator, [
      "--slug",
      "candidate-fixture",
      "--blog-dir",
      blogDir,
      "--quality-review",
      reviewPath,
      "--output",
      image,
      "--contract",
      contract,
    ]);
    if (result.status !== 0 || !result.stdout.includes("private_image_contract=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected private image contract generation to pass");
    }
    process.stdout.write("private_image_contract_generation_self_test=pass\n");

    result = run(candidateGenerator, [
      "--slug",
      "candidate-fixture",
      "--blog-dir",
      blogDir,
      "--quality-review",
      reviewPath,
      "--image-contract",
      contract,
      "--output",
      html,
      "--summary",
      summary,
    ]);
    if (result.status !== 0 || !result.stdout.includes("private_rendered_candidate=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected private rendered candidate generation to pass");
    }
    process.stdout.write("private_rendered_candidate_generation_self_test=pass\n");

    result = run(candidateGenerator, [
      "--check",
      "--slug",
      "candidate-fixture",
      "--blog-dir",
      blogDir,
      "--quality-review",
      reviewPath,
      "--image-contract",
      contract,
      "--output",
      html,
      "--summary",
      summary,
    ]);
    if (result.status !== 0 || !result.stdout.includes("private_rendered_candidate=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected private rendered candidate check to pass");
    }
    process.stdout.write("private_rendered_candidate_check_self_test=pass\n");

    await writeFixture(root, "This line changes the draft hash.");
    result = run(candidateGenerator, [
      "--check",
      "--slug",
      "candidate-fixture",
      "--blog-dir",
      blogDir,
      "--quality-review",
      reviewPath,
      "--image-contract",
      contract,
      "--output",
      html,
      "--summary",
      summary,
    ]);
    if (result.status === 0 || !result.stderr.includes("markdownSha256")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected stale private rendered candidate check to fail");
    }
    process.stdout.write("private_rendered_candidate_stale_self_test=pass\n");
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

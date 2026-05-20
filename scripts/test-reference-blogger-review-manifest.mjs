import { spawnSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const reviewGenerator = resolve("scripts/generate-reference-blogger-review-artifact.mjs");
const revisionGenerator = resolve("scripts/generate-reference-blogger-revision-plan.mjs");
const manifestVerifier = resolve("scripts/verify-reference-blogger-review-manifest.mjs");

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function requireRun(label, result, expectedStatus, expectedOutput) {
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status !== expectedStatus) {
    throw new Error(`${label}: expected exit ${expectedStatus}, got ${result.status}\n${output}`);
  }
  for (const expected of expectedOutput) {
    if (!output.includes(expected)) throw new Error(`${label}: missing output ${expected}\n${output}`);
  }
}

const post = `---
title: "Manifest Review Artifact"
description: "A test post with a reusable decision matrix, concrete failure scene, and explicit boundary for manifest verification."
draft: false
series: "Field Log"
workflow: "packet"
ogImage: "/images/posts/manifest-review-artifact.png"
references:
  - name: "Manifest source"
    url: "https://example.com/manifest"
    guru: "Test source"
---

# Manifest Review Artifact

The rule is simple: a review artifact is only useful when the decision can survive the artifact being deleted.

![Manifest diagram](/images/posts/manifest-review-artifact.png)

## Failure Scene

\`\`\`txt
before: reviewer trusts the artifact
after: markdown decision record remains
proof: manifest check fails stale hashes
\`\`\`

## Decision Matrix

| Claim | Accept | Reject |
| --- | --- | --- |
| Reviewable artifact | Source, decision, export | Pretty page only |

## Boundary

This does not prove the article is good. It proves the artifact state is current and accepted.
`;

function acceptedReview(summary) {
  return {
    schema: "vibecode-reference-blogger-review-result/v1",
    slug: summary.slug,
    markdownSha256: summary.markdownSha256,
    reviewer: {
      type: "editorial-trial",
      name: "manifest-reviewer",
      reviewedAt: "2026-05-21T04:55:00+09:00",
    },
    overallDecision: "accepted",
    rowDecisions: summary.reviewRows.map((row) => ({
      row,
      verdict: "accept",
      evidence: `The ${row} row is covered by the fixture with enough concrete artifact evidence.`,
    })),
  };
}

try {
  const root = await makeTestTempDir("vibecode-reference-blogger-review-manifest-");
  const blogDir = join(root, "blog");
  const output = join(root, "artifact", "review.html");
  const summaryPath = join(root, "artifact", "summary.json");
  const reviewPath = join(root, "artifact", "review-result.json");
  const planPath = join(root, "artifact", "revision-plan.json");
  const manifestPath = join(root, "manifest.json");
  await mkdir(blogDir, { recursive: true });
  await writeFile(join(blogDir, "manifest-review-artifact.md"), post, "utf8");

  requireRun(
    "generate review artifact",
    run(reviewGenerator, [
      "--slug",
      "manifest-review-artifact",
      "--blog-dir",
      blogDir,
      "--output",
      output,
      "--summary",
      summaryPath,
    ]),
    0,
    ["reference_blogger_review_rows=6"],
  );
  const summary = JSON.parse(await readFile(summaryPath, "utf8"));
  await writeFile(reviewPath, `${JSON.stringify(acceptedReview(summary), null, 2)}\n`, "utf8");
  requireRun(
    "generate revision plan",
    run(revisionGenerator, ["--summary", summaryPath, "--review", reviewPath, "--output", planPath]),
    0,
    ["reference_blogger_revision_plan_items=0"],
  );
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        schema: "vibecode-reference-blogger-review-artifacts/v1",
        artifacts: [
          {
            slug: "manifest-review-artifact",
            blogDir,
            reviewArtifact: output,
            summary: summaryPath,
            reviewResult: reviewPath,
            revisionPlan: planPath,
          },
        ],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  requireRun("manifest pass", run(manifestVerifier, ["--manifest", manifestPath]), 0, [
    "reference_blogger_review_manifest_items=1",
    "reference_blogger_review_manifest_gate=pass",
  ]);

  await writeFile(join(blogDir, "manifest-review-artifact.md"), `${post}\n\nA stale change.\n`, "utf8");
  requireRun("manifest stale", run(manifestVerifier, ["--manifest", manifestPath]), 1, ["summary markdown SHA is stale"]);
  await writeFile(join(blogDir, "manifest-review-artifact.md"), post, "utf8");

  const rejectedReview = acceptedReview(summary);
  rejectedReview.overallDecision = "revision_required";
  rejectedReview.rowDecisions = rejectedReview.rowDecisions.map((item) =>
    item.row === "forward"
      ? {
          ...item,
          verdict: "reject",
          evidence: "The row is intentionally rejected for the self-test accepted-state failure.",
          requiredChange: "Add a concrete forward audience before this item can be accepted.",
        }
      : item,
  );
  await writeFile(reviewPath, `${JSON.stringify(rejectedReview, null, 2)}\n`, "utf8");
  requireRun(
    "generate rejected revision plan",
    run(revisionGenerator, ["--summary", summaryPath, "--review", reviewPath, "--output", planPath]),
    0,
    ["reference_blogger_revision_plan_status=ready_for_body_revision"],
  );
  requireRun("manifest rejected review", run(manifestVerifier, ["--manifest", manifestPath]), 1, [
    "manifest-maintained review result must be accepted",
  ]);

  const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8"));
  const verifyContent = packageJson.scripts?.["verify:content"] ?? "";
  if (!verifyContent.includes("npm run test:reference-blogger-review-manifest")) {
    throw new Error("verify:content must run test:reference-blogger-review-manifest");
  }
  if (!verifyContent.includes("npm run verify:reference-blogger-review-manifest")) {
    throw new Error("verify:content must run verify:reference-blogger-review-manifest");
  }

  await rm(root, { recursive: true, force: true });
  process.stdout.write("reference_blogger_review_manifest_positive_self_test=pass\n");
  process.stdout.write("reference_blogger_review_manifest_stale_self_test=pass\n");
  process.stdout.write("reference_blogger_review_manifest_rejected_review_self_test=pass\n");
  process.stdout.write("reference_blogger_review_manifest_verify_content_wiring_self_test=pass\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

import { spawnSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const generator = resolve("scripts/generate-reference-blogger-review-artifact.mjs");

function run(args) {
  return spawnSync(process.execPath, [generator, ...args], {
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
    if (!output.includes(expected)) {
      throw new Error(`${label}: missing output ${expected}\n${output}`);
    }
  }
}

const post = `---
title: "Strong Review Artifact"
description: "A failed route review shows what a reader would quote, save, and forward before accepting an agent deployment claim."
draft: false
series: "Field Log"
workflow: "packet"
ogImage: "/images/posts/strong-review-artifact.png"
references:
  - name: "Route receipt"
    url: "https://example.com/route"
    guru: "First-party evidence"
---

# Strong Review Artifact

The route review failed because the dashboard was green while the build artifact did not own \`/sitemap.xml\`. That matters because the next host can lose the route while the article still sounds confident.

![Strong diagram](/images/posts/strong-review-artifact.png)

## Failure Scene

\`\`\`txt
before: host rewrite owns /sitemap.xml
after: dist/sitemap.xml exists after npm run build
proof: rendered summary checked 24 viewports
\`\`\`

The rule is simple: do not accept a deployment claim until source control owns the route.

## Decision Matrix

| Claim | Accept | Reject |
| --- | --- | --- |
| Portable route | File in dist | Dashboard rewrite only |
| Proof | Command and artifact | Screenshot only |

## Boundary

This does not prove every host rewrite is bad. It proves the article needs an artifact the reader can inspect.
`;

try {
  const root = await makeTestTempDir("vibecode-reference-blogger-review-");
  const blogDir = join(root, "blog");
  const output = join(root, "html", "review.html");
  const summary = join(root, "summary", "review.json");
  await mkdir(blogDir, { recursive: true });
  await writeFile(join(blogDir, "strong-review-artifact.md"), post, "utf8");
  const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8"));
  const verifyContent = packageJson.scripts?.["verify:content"] ?? "";
  if (!verifyContent.includes("npm run test:reference-blogger-review-artifact")) {
    throw new Error("verify:content must run test:reference-blogger-review-artifact");
  }
  if (!verifyContent.includes("npm run verify:reference-blogger-review")) {
    throw new Error("verify:content must run verify:reference-blogger-review");
  }

  const generated = run([
    "--slug",
    "strong-review-artifact",
    "--blog-dir",
    blogDir,
    "--output",
    output,
    "--summary",
    summary,
  ]);
  requireRun("generate", generated, 0, [
    "reference_blogger_review_artifact=",
    "reference_blogger_review_rows=6",
  ]);

  const check = run([
    "--slug",
    "strong-review-artifact",
    "--blog-dir",
    blogDir,
    "--output",
    output,
    "--summary",
    summary,
    "--check",
  ]);
  requireRun("check", check, 0, [
    "reference_blogger_review_artifact_gate=pass",
  ]);

  await writeFile(join(blogDir, "strong-review-artifact.md"), `${post}\n\nExtra changed sentence.\n`, "utf8");
  const stale = run([
    "--slug",
    "strong-review-artifact",
    "--blog-dir",
    blogDir,
    "--output",
    output,
    "--summary",
    summary,
    "--check",
  ]);
  requireRun("stale", stale, 1, [
    "summary markdown SHA is stale",
  ]);

  await rm(root, { recursive: true, force: true });
  process.stdout.write("reference_blogger_review_artifact_generation_self_test=pass\n");
  process.stdout.write("reference_blogger_review_artifact_check_self_test=pass\n");
  process.stdout.write("reference_blogger_review_artifact_stale_self_test=pass\n");
  process.stdout.write("reference_blogger_review_artifact_verify_content_wiring_self_test=pass\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

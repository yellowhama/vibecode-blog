import { rm, mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = resolve("scripts/audit-reference-writing.mjs");

function run(args, options = {}) {
  return spawnSync(process.execPath, [verifier, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    ...options,
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

async function writePost(dir, file, frontmatter, body) {
  await writeFile(join(dir, file), `---\n${frontmatter.trim()}\n---\n\n${body.trim()}\n`, "utf8");
}

const strongBody = `
# Strong Post

![Strong diagram](/images/posts/strong-post.png)

The failure cost two review loops before anyone noticed the real problem. The agent kept editing the UI, but the hidden contract was a route boundary that changed after the framework upgrade. That matters because a plausible diff can still ship the wrong behavior. This article gives the checklist I now use before asking an agent to touch production routes.

## Failure Mode

The broken shape was not dramatic. It looked like a normal handler until the route input changed:

\`\`\`ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  return Response.json({ id: params.id });
}
\`\`\`

The mechanism is simple: the operator asked for a fix before naming the input contract. The model optimized around visible symptoms instead of the one boundary that mattered.

## Evidence Table

| Receipt | Why it matters |
| --- | --- |
| 2026-05-20 route audit | Shows the exact failure date |
| commit de689cb | Binds the repair to a real diff |
| npm run verify:site-quality | Proves the current gate passed |

## Contract Checklist

\`\`\`txt
Source:
Boundary:
Forbidden changes:
Acceptance check:
Evidence to keep:
\`\`\`

Use this when the next agent task touches data, routing, billing, deployment, or public writing. If the task is only exploration, keep the loop cheap. If the task has users attached, write the contract first.

## Boundary

This does not prove the agent will be correct. It only makes the output easier to reject when the diff violates the route contract. That is enough to change the review.
`;

const weakBody = `
# Weak Post

![Weak diagram](/images/posts/weak-post.png)

AI agents are powerful and can unlock amazing productivity for teams. This post explains why using them well is important.

## Thoughts

Agents can help with many things. You should use them carefully.
`;

try {
  const root = await makeTestTempDir("vibecode-reference-writing-");
  const strongDir = join(root, "strong");
  const weakDir = join(root, "weak");
  await mkdir(strongDir, { recursive: true });
  await mkdir(weakDir, { recursive: true });

  await writePost(
    strongDir,
    "strong-post.md",
    `
title: "Strong Post"
description: "A route failure shows why agent work needs a contract, evidence receipts, and a reusable checklist before production edits."
draft: false
series: "Field Log"
workflow: "packet"
ogImage: "/images/posts/strong-post.png"
references:
  - name: "Framework route docs"
    url: "https://example.com/routes"
    guru: "Example"
  - name: "Internal route audit"
    url: "https://example.com/audit"
    guru: "First-party evidence"
`,
    strongBody,
  );

  await writePost(
    weakDir,
    "weak-post.md",
    `
title: "Weak Post"
description: "A generic article about agents."
draft: false
series: "AI Explainer"
workflow: "packet"
ogImage: "/images/posts/weak-post.png"
references:
  - name: "Generic source"
    url: "https://example.com/source"
    guru: "Example"
`,
    weakBody,
  );

  const positive = run(["--blog-dir", strongDir, "--strict", "--min-score", "78", "--min-average", "78"]);
  requireRun("positive", positive, 0, [
    "reference_writing_posts_checked=1",
    "reference_writing_average_score=",
    "reference_writing_gate=pass",
  ]);

  const negative = run(["--blog-dir", weakDir, "--strict", "--min-score", "78", "--min-average", "78"]);
  requireRun("negative", negative, 1, [
    "Reference writing gate failed.",
    "weak opening",
    "reference_writing_gate=fail",
  ]);

  const auditOnly = run(["--blog-dir", weakDir, "--min-score", "78", "--min-average", "78"]);
  requireRun("audit-only", auditOnly, 0, [
    "reference_writing_audit_status=needs_rewrite",
    "reference_writing_gate=pass",
  ]);

  await rm(root, { recursive: true, force: true });
  process.stdout.write("reference_writing_audit_positive_self_test=pass\n");
  process.stdout.write("reference_writing_audit_negative_self_test=pass\n");
  process.stdout.write("reference_writing_audit_only_self_test=pass\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

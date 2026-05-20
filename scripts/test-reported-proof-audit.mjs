import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = resolve("scripts/audit-reported-proof.mjs");

function run(args) {
  return spawnSync(process.execPath, [verifier, ...args], {
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

async function writePost(dir, file, frontmatter, body) {
  await writeFile(join(dir, file), `---\n${frontmatter.trim()}\n---\n\n${body.trim()}\n`, "utf8");
}

const strongBody = `
# Strong Reported Proof

On 2026-05-21, I opened the rendered audit summary after the deploy preview looked fine and found the public route only existed in the host story, not in \`dist/sitemap.xml\`. That matters because the next agent would trust a public route the repo could not reproduce.

![Strong proof diagram](/images/posts/strong-reported-proof.png)

## Field Receipt

\`\`\`txt
bad output: dashboard says /sitemap.xml works
gate added: npm run build plus node scripts/verify-dist.mjs
after: dist/sitemap.xml exists and rendered_page_viewports_checked=24
commit: abc1234
summary: F:\\Aisaak\\CompanyArtifacts\\vibecode-rendered-audit\\latest\\summary.json
\`\`\`

The cost is review trust. Without the gate, the team approves a deployment claim that disappears on the next host.

## Before/After

| Before | After |
| --- | --- |
| Dashboard proves the route | Repo artifact owns the route |
| Screenshot looks green | rendered summary names desktop and mobile proof |

## Review Template

\`\`\`txt
Source:
Boundary:
Acceptance check:
Forbidden changes:
Evidence to keep:
\`\`\`

Forward this to the reviewer before accepting the next deployment claim. Good answer: the file, command, screenshot, and summary exist. Bad answer: the dashboard worked.
`;

const weakBody = `
# Weak Reported Proof

Agents can help you write better content. This article explains why teams should use them carefully.

![Weak proof diagram](/images/posts/weak-reported-proof.png)

## Tips

Write better prompts. Review the output. Improve the final article.
`;

try {
  const root = await makeTestTempDir("vibecode-reported-proof-");
  const strongDir = join(root, "strong");
  const weakDir = join(root, "weak");
  const output = join(root, "reported-proof.json");
  await mkdir(strongDir, { recursive: true });
  await mkdir(weakDir, { recursive: true });

  await writePost(
    strongDir,
    "strong-reported-proof.md",
    `
title: "Strong Reported Proof"
description: "A route claim becomes trustworthy only when the build artifact, rendered summary, screenshot, and review template agree."
draft: false
series: "Field Log"
workflow: "packet"
ogImage: "/images/posts/strong-reported-proof.png"
references:
  - name: "Internal rendered audit"
    url: "https://example.com/rendered"
    guru: "First-party evidence"
`,
    strongBody,
  );

  await writePost(
    weakDir,
    "weak-reported-proof.md",
    `
title: "Weak Reported Proof"
description: "A generic post about agents."
draft: false
series: "AI Explainer"
workflow: "packet"
ogImage: "/images/posts/weak-reported-proof.png"
references:
  - name: "Generic source"
    url: "https://example.com/source"
    guru: "Example"
`,
    weakBody,
  );

  const positive = run(["--blog-dir", strongDir, "--output", output, "--strict", "--min-score", "72", "--min-average", "80"]);
  requireRun("positive", positive, 0, [
    "reported_proof_posts_checked=1",
    "reported_proof_status=reported_proof_ready",
    "reported_proof_gate=pass",
  ]);

  const negative = run(["--blog-dir", weakDir, "--strict", "--min-score", "72", "--min-average", "80"]);
  requireRun("negative", negative, 1, [
    "Reported proof gate failed.",
    "reported_proof_gate=fail",
    "missing ordered failure -> gate/check -> after/pass proof chain",
  ]);

  const auditOnly = run(["--blog-dir", weakDir, "--min-score", "72", "--min-average", "80"]);
  requireRun("audit-only", auditOnly, 0, [
    "reported_proof_status=needs_reported_proof",
    "reported_proof_gate=pass",
  ]);

  await rm(root, { recursive: true, force: true });
  process.stdout.write("reported_proof_audit_positive_self_test=pass\n");
  process.stdout.write("reported_proof_audit_negative_self_test=pass\n");
  process.stdout.write("reported_proof_audit_only_self_test=pass\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

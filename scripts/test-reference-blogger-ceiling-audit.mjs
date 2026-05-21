import { spawnSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = resolve("scripts/audit-reference-blogger-ceiling.mjs");

function run(args) {
  return spawnSync(process.execPath, [verifier, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function requireOutput(label, result, expectedStatus, expectedOutput) {
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
# The Dashboard Was Green. The Artifact Was Missing.

On 2026-05-20 I opened the Vercel deploy, ran \`npm run verify:site-quality\`, and found the route looked fine in the browser but failed the repo-owned artifact check. That mattered because the reader trust contract was sitting in production, not in the dashboard. The problem was not deployment. The problem was proof.

The rule is boring and expensive: if the receipt cannot travel with the article, the article is still a draft.

![Rendered proof screenshot for route artifact](/images/posts/green-dashboard-missing-artifact.png)

## The Failure Log

\`\`\`txt
before: /sitemap.xml resolved through host behavior
after: dist/sitemap.xml exists in the build artifact
commit: abc1234
summary.json: rendered viewports checked=24 screenshots=6 routes=10
\`\`\`

## Before/After

| Before | After |
| --- | --- |
| Dashboard was green | Verifier checks the artifact |
| We trusted a host rewrite | The repo owns the route |
| The claim was invisible | The screenshot and hash travel with the post |

## Reference Contrast

The weaker version says "the deploy worked." The stronger pattern compares the claim against the artifact a reader could inspect: \`dist/sitemap.xml\`, \`summary.json\`, the screenshot, and the commit.

## Decision Checklist

\`\`\`txt
Good answer: source path, rendered screenshot, hash, and before/after are all present.
Bad answer: it looked good on the preview URL.
Reject the post if the main claim cannot be checked from the article.
\`\`\`

## Boundary

This does not prove the hosting provider is bad. It only proves that a green dashboard is not a publication receipt. Do not accept the next "done" message until the next time the route, screenshot, and hash are all inside the repo-owned receipt.
`;

const thinBody = `
# Agents Are Useful

Agents help teams move faster. This post explains why they are powerful and easy to use.

![Agent illustration](/images/posts/agents-are-useful.png)

## Tips

Use agents carefully.
`;

try {
  const root = await makeTestTempDir("vibecode-reference-blogger-ceiling-");
  const dir = join(root, "posts");
  const output = join(root, "report.json");
  await mkdir(dir, { recursive: true });

  await writePost(
    dir,
    "green-dashboard-missing-artifact.md",
    `
title: "The Dashboard Was Green. The Artifact Was Missing."
description: "A route looked deployed until a rendered artifact, screenshot, and hash showed the publication proof was missing."
draft: false
series: "Field Log"
workflow: "packet"
ogImage: "/images/posts/green-dashboard-missing-artifact.png"
references:
  - name: "Vercel deployment documentation"
    url: "https://example.com/vercel"
    guru: "Vercel"
  - name: "Sitemap generation notes"
    url: "https://example.com/sitemap"
    guru: "Example"
  - name: "Internal rendered audit"
    url: "https://example.com/rendered"
    guru: "Vibecode"
`,
    strongBody,
  );

  await writePost(
    dir,
    "agents-are-useful.md",
    `
title: "Agents Are Useful"
description: "A generic post about agents."
draft: false
series: "AI Explainer"
workflow: "packet"
ogImage: "/images/posts/agents-are-useful.png"
references:
  - name: "Agent docs"
    url: "https://example.com/agents"
    guru: "Example"
`,
    thinBody,
  );

  const result = run(["--blog-dir", dir, "--output", output]);
  requireOutput("reference blogger ceiling audit", result, 0, [
    "reference_blogger_ceiling_posts_checked=2",
    "reference_blogger_ceiling_candidate_count=1",
    "reference_blogger_ceiling_revision=agents-are-useful",
    "reference_blogger_ceiling_gate=report_only",
  ]);

  const report = JSON.parse(await readFile(output, "utf8"));
  const strong = report.posts.find(post => post.slug === "green-dashboard-missing-artifact");
  const thin = report.posts.find(post => post.slug === "agents-are-useful");
  if (!strong || !thin) throw new Error("missing expected posts in report");
  if (strong.score <= thin.score) {
    throw new Error(`expected strong fixture to outscore thin fixture: ${strong.score} <= ${thin.score}`);
  }
  if (strong.grade !== "reference-blogger-candidate") {
    throw new Error(`expected strong fixture to be candidate, got ${strong.grade} score=${strong.score}`);
  }
  if (thin.grade === "reference-blogger-candidate") {
    throw new Error("thin fixture should not be a reference-blogger candidate");
  }

  await rm(root, { recursive: true, force: true });
  process.stdout.write("reference_blogger_ceiling_audit_self_test=pass\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

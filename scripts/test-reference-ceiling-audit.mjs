import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = resolve("scripts/audit-reference-ceiling.mjs");

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
# Strong Ceiling Post

On 2026-05-20 the route test failed after the preview URL looked fine. I opened the rendered summary, compared the before/after diff, and found the dashboard had hidden the route contract. That mattered because production trust was moving faster than the artifact.

![Strong diagram](/images/posts/strong-ceiling-post.png)

## Failure Log

\`\`\`txt
before: /sitemap.xml exists only through host rewrite
after: dist/sitemap.xml exists in the build artifact
commit: abc1234
summary.json: rendered viewports checked=24
\`\`\`

## Before/After

| Before | After |
| --- | --- |
| Host maps it for us | Repo owns the route |
| Dashboard was green | Verifier checks the artifact |

## Review Questions

\`\`\`txt
Can the behavior be found in source control?
Can a clean machine reproduce it?
Can a verifier reject drift?
\`\`\`

Use this when an agent says a deployment is ready. Good answer: the route, script, and screenshot are in the artifact. Bad answer: the dashboard worked.
`;

const thinBody = `
# Thin Ceiling Post

Agents are useful because they help teams move faster. This article gives a few tips.

![Thin diagram](/images/posts/thin-ceiling-post.png)

## Tips

Use agents carefully.
`;

try {
  const root = await makeTestTempDir("vibecode-reference-ceiling-");
  const dir = join(root, "posts");
  const output = join(root, "report.json");
  await mkdir(dir, { recursive: true });

  await writePost(
    dir,
    "strong-ceiling-post.md",
    `
title: "Strong Ceiling Post"
description: "A green deployment dashboard hid a route contract until a rendered artifact and before/after diff exposed it."
draft: false
series: "Field Log"
workflow: "packet"
ogImage: "/images/posts/strong-ceiling-post.png"
references:
  - name: "Route docs"
    url: "https://example.com/routes"
    guru: "Example"
`,
    strongBody,
  );

  await writePost(
    dir,
    "thin-ceiling-post.md",
    `
title: "Thin Ceiling Post"
description: "A generic post about agents."
draft: false
series: "AI Explainer"
workflow: "packet"
ogImage: "/images/posts/thin-ceiling-post.png"
references:
  - name: "Agent docs"
    url: "https://example.com/agents"
    guru: "Example"
`,
    thinBody,
  );

  const result = run(["--blog-dir", dir, "--output", output]);
  requireOutput("ceiling audit", result, 0, [
    "reference_ceiling_posts_checked=2",
    "reference_ceiling_weakest=thin-ceiling-post",
    "reference_ceiling_gate=report_only",
  ]);

  await rm(root, { recursive: true, force: true });
  process.stdout.write("reference_ceiling_audit_self_test=pass\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

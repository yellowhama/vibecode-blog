import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = resolve("scripts/audit-reader-payoff.mjs");

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
# Strong Reader Payoff

The deploy review failed at 1:57 a.m. because the route only existed in a host dashboard, not in the repo. That matters because an agent can keep saying "deployment works" while the next host loses \`/sitemap.xml\`. The useful move is to reject any deployment claim until the build artifact owns the route.

![Strong diagram](/images/posts/strong-reader-payoff.png)

## What Broke

\`\`\`txt
before: dashboard rewrite serves /sitemap.xml
after: dist/sitemap.xml exists after npm run build
proof: rendered summary checked 24 viewports
\`\`\`

That means the review is not "did the preview open?" The review is "can a clean machine reproduce the route from source control?"

That question matters because the risk is not the button click. The risk is false trust: a public route can disappear, the next reviewer can accept a stale dashboard, and the team can lose the evidence that should have stopped the release.

## Decision Matrix

| Claim | Accept | Reject |
| --- | --- | --- |
| Route exists | File appears in dist | Only dashboard rewrite proves it |
| Build is portable | Command runs on Windows and Linux | Shell-only command |
| Screenshot proves it | Rendered summary names the route | Pretty dashboard only |

## Use This Before Accepting

\`\`\`txt
Run npm run build.
Check dist for the public route.
Reject the claim if the host is the only source of truth.
\`\`\`

The boundary is simple: this does not prove the deployment provider is bad. It proves the repo must own the contract before an agent calls the migration ready.
`;

const weakBody = `
# Weak Reader Payoff

In this article we are going to show you how to set up an AI website. First click the button, then copy the code, then paste it into the project. Open the dashboard and select the option. Download the tool, sign up, scroll down, and upload the files.

![Weak diagram](/images/posts/weak-reader-payoff.png)

## Steps

Click this. Copy that. Paste it here. Then go to the next page.
`;

try {
  const root = await makeTestTempDir("vibecode-reader-payoff-");
  const strongDir = join(root, "strong");
  const weakDir = join(root, "weak");
  await mkdir(strongDir, { recursive: true });
  await mkdir(weakDir, { recursive: true });

  await writePost(
    strongDir,
    "strong-reader-payoff.md",
    `
title: "Strong Reader Payoff"
description: "A failed deployment review shows why the repo must own the route, what to reject, and which commands prove the contract."
draft: false
series: "Field Log"
workflow: "packet"
ogImage: "/images/posts/strong-reader-payoff.png"
references:
  - name: "Internal deployment receipt"
    url: "https://example.com/deploy"
    guru: "First-party evidence"
`,
    strongBody,
  );

  await writePost(
    weakDir,
    "weak-reader-payoff.md",
    `
title: "Weak Reader Payoff"
description: "A tutorial about AI websites."
draft: false
series: "AI Tool Note"
workflow: "packet"
ogImage: "/images/posts/weak-reader-payoff.png"
references:
  - name: "Generic source"
    url: "https://example.com/source"
    guru: "Example"
`,
    weakBody,
  );

  const positive = run(["--blog-dir", strongDir, "--strict", "--min-score", "82", "--min-average", "82"]);
  requireRun("positive", positive, 0, [
    "reader_payoff_posts_checked=1",
    "reader_payoff_status=payoff_ready",
    "reader_payoff_gate=pass",
  ]);

  const negative = run(["--blog-dir", weakDir, "--strict", "--min-score", "82", "--min-average", "82"]);
  requireRun("negative", negative, 1, [
    "Reader payoff gate failed.",
    "opening does not establish pain",
    "reader_payoff_gate=fail",
  ]);

  const auditOnly = run(["--blog-dir", weakDir, "--min-score", "82", "--min-average", "82"]);
  requireRun("audit-only", auditOnly, 0, [
    "reader_payoff_status=needs_rewrite",
    "reader_payoff_gate=pass",
  ]);

  await rm(root, { recursive: true, force: true });
  process.stdout.write("reader_payoff_audit_positive_self_test=pass\n");
  process.stdout.write("reader_payoff_audit_negative_self_test=pass\n");
  process.stdout.write("reader_payoff_audit_only_self_test=pass\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

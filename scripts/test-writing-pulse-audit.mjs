import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = resolve("scripts/audit-writing-pulse.mjs");

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
# Strong Writing Pulse

On 2026-05-21, I opened the rendered report at \`F:\\Aisaak\\CompanyArtifacts\\vibecode-rendered-audit\\latest\\summary.json\` and found the same false positive twice. The post had an image, but the reader still could not tell what changed. That matters because a visible asset can make weak writing look approved before the reviewer has seen the proof.

![Strong writing pulse diagram](/images/posts/strong-writing-pulse.png)

The useful move is not to add a nicer image. The useful move is to reject the draft until the image, failure, gate, and reader decision all point at the same claim.

## The Failure Scene

Bad output:

\`\`\`txt
The article says "evidence-backed" but only shows a generic diagram.
The reviewer sees polish before seeing proof.
The next agent treats the image as decoration, not evidence.
\`\`\`

## Gate Added

\`\`\`txt
npm run verify:rendered-pages
npm run audit:writing-pulse
rendered_page_surface_expected_images_first_screen=2/2
contentSha256=abc123def4567890
\`\`\`

## After

After the gate, the review changed from "does an image exist?" to "does the first-screen image compress the same failure the article is about?" That is the point: a proof image is not a mood board. It is a shortcut into the article's argument.

## Decision Matrix

| Reader question | Accept | Reject |
| --- | --- | --- |
| What failed? | The first screen names the failure | The image is only decorative |
| Why care? | The text names review trust risk | The text only says it is useful |
| What changed? | A gate and after-state are visible | The post jumps into steps |
| Who uses it? | Reviewer can forward the rule | No receiver is named |

## Use This Before Accepting

Accept only when the article opens with a scene, states the wrong standard, shows a bad/gate/after proof story, and ends with a reusable reader decision.

Reject when it is a competent internal operating note with no reason to keep reading.

## Boundary

This does not prove the post is brilliant. It only proves the draft has a pulse: a situation, a point of view, evidence pressure, and a transfer object a human reviewer can use before approving it.
`;

const weakBody = `
# Weak Writing Pulse

In this article we are going to explain a useful workflow. It is a powerful and high-quality process. First click the button, then copy the code, then paste it into the project. Open the dashboard and select the option. Download the tool, sign up, scroll down, and upload the files.

![Weak writing pulse diagram](/images/posts/weak-writing-pulse.png)

## Steps

Click this. Copy that. Paste it here. Then go to the next page.
`;

try {
  const root = await makeTestTempDir("vibecode-writing-pulse-");
  const strongDir = join(root, "strong");
  const weakDir = join(root, "weak");
  await mkdir(strongDir, { recursive: true });
  await mkdir(weakDir, { recursive: true });

  await writePost(
    strongDir,
    "strong-writing-pulse.md",
    `
title: "Strong Writing Pulse"
description: "A rendered-image false positive shows why reference-grade agent writing needs a scene, proof story, and reader decision."
draft: false
series: "Field Log"
workflow: "packet"
ogImage: "/images/posts/strong-writing-pulse.png"
references:
  - name: "Internal rendered audit"
    url: "https://example.com/rendered"
    guru: "First-party evidence"
`,
    strongBody,
  );

  await writePost(
    weakDir,
    "weak-writing-pulse.md",
    `
title: "Weak Writing Pulse"
description: "A tutorial about a useful workflow."
draft: false
series: "AI Tool Note"
workflow: "packet"
ogImage: "/images/posts/weak-writing-pulse.png"
references:
  - name: "Generic source"
    url: "https://example.com/source"
    guru: "Example"
`,
    weakBody,
  );

  const positive = run(["--blog-dir", strongDir, "--strict", "--min-score", "80", "--min-average", "80"]);
  requireRun("positive", positive, 0, [
    "writing_pulse_posts_checked=1",
    "writing_pulse_status=writing_pulse_ready",
    "writing_pulse_gate=pass",
  ]);

  const negative = run(["--blog-dir", weakDir, "--strict", "--min-score", "80", "--min-average", "80"]);
  requireRun("negative", negative, 1, [
    "Writing pulse gate failed.",
    "opening does not make the reader feel the failure or stakes",
    "writing_pulse_gate=fail",
  ]);

  const auditOnly = run(["--blog-dir", weakDir, "--min-score", "80", "--min-average", "80"]);
  requireRun("audit-only", auditOnly, 0, [
    "writing_pulse_status=needs_writing_pulse",
    "writing_pulse_gate=pass",
  ]);

  await rm(root, { recursive: true, force: true });
  process.stdout.write("writing_pulse_audit_positive_self_test=pass\n");
  process.stdout.write("writing_pulse_audit_negative_self_test=pass\n");
  process.stdout.write("writing_pulse_audit_only_self_test=pass\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

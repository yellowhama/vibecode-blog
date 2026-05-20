import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = "scripts/verify-private-run-log-story-beat.mjs";

function run(args) {
  return spawnSync(process.execPath, [resolve(verifier), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function strongDraft() {
  return `---
title: "Run Log Story Fixture"
draft: true
workflow: "packet"
---

# Run Log Story Fixture

## Visual Evidence

![Run log evidence artifact](../fixture-run-log.png)

At 1:09 a.m., the draft looked finished enough to fool a tired editor. So I ran the verifier twice.

First, I pointed it at the current review:

\`\`\`txt
private_workflow_evidence_artifact=pass
\`\`\`

Then I pointed the same verifier at the old rejected human-quality review:

\`\`\`txt
- quality review must have zero rejected rows
private_workflow_evidence_artifact=fail
\`\`\`

That failure is not a bug. It is the system refusing to let yesterday's weak review masquerade as today's approval.
`;
}

async function main() {
  const root = await makeTestTempDir("vibecode-private-run-log-story-");
  try {
    await mkdir(root, { recursive: true });
    const draft = join(root, "draft.md");
    const weakDraft = join(root, "weak.md");
    const summary = join(root, "summary.json");
    await writeFile(draft, strongDraft(), "utf8");
    await writeFile(
      weakDraft,
      strongDraft().replace("- quality review must have zero rejected rows\nprivate_workflow_evidence_artifact=fail", ""),
      "utf8",
    );
    await writeJson(summary, {
      schema: "vibecode-private-run-log-evidence/v1",
      output: join(root, "fixture-run-log.png"),
      runs: [
        {
          id: "pass-current",
          expectedExitCode: 0,
          exitCode: 0,
          stdoutMatched: true,
          stderrMatched: true,
        },
        {
          id: "fail-old-review",
          expectedExitCode: 1,
          exitCode: 1,
          stdoutMatched: true,
          stderrMatched: true,
        },
      ],
    });

    let result = run(["--draft", draft, "--summary", summary]);
    if (result.status !== 0 || !result.stdout.includes("private_run_log_story_beat=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected strong run-log story beat to pass");
    }
    process.stdout.write("private_run_log_story_beat_positive_self_test=pass\n");

    result = run(["--draft", weakDraft, "--summary", summary]);
    if (result.status === 0 || !result.stderr.includes("failing console output")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected missing failing console output to fail");
    }
    process.stdout.write("private_run_log_story_beat_negative_self_test=pass\n");
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

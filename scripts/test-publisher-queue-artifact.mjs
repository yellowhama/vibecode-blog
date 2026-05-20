import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const generator = "scripts/generate-publisher-queue-artifact.mjs";

function run(args) {
  return spawnSync(process.execPath, [resolve(generator), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function writeFixture(root, bodySuffix = "") {
  const blogDir = join(root, "blog");
  await mkdir(blogDir, { recursive: true });
  await writeFile(
    join(blogDir, "queue-draft.md"),
    `---\ntitle: "Queue Draft"\ndraft: true\nworkflow: "packet"\n---\n\n# Queue Draft\n\n## Visual Evidence\n\n\`\`\`txt\npublisher_queue_item:\n  title: "Queue Draft"\n  source_url: "https://example.com/source"\n  reader_decision: "Should this draft be queued or rejected?"\n  required_proof:\n    - source notes\n    - image contract\n  image_state: "candidate_only"\n  publish_state: "blocked"\n  approval_required: true\n\`\`\`\n${bodySuffix}\n`,
    "utf8",
  );
  return blogDir;
}

async function main() {
  const root = await makeTestTempDir("vibecode-publisher-queue-artifact-");
  try {
    const blogDir = await writeFixture(root);
    const output = join(root, "queue-artifact.html");
    const summary = join(root, "queue-artifact-summary.json");
    const generated = run(["--slug", "queue-draft", "--blog-dir", blogDir, "--output", output, "--summary", summary]);
    if (generated.status !== 0 || !generated.stdout.includes("publisher_queue_artifact=pass")) {
      process.stderr.write(generated.stdout + generated.stderr);
      throw new Error("expected publisher queue artifact generation to pass");
    }
    const html = await readFile(output, "utf8");
    for (const required of ["Private Publisher Queue Artifact", "publish blocked", "Required Proof", "Queue Item", "Reject Condition"]) {
      if (!html.includes(required)) throw new Error(`publisher queue artifact missing text: ${required}`);
    }
    process.stdout.write("publisher_queue_artifact_generation_self_test=pass\n");

    const checked = run(["--slug", "queue-draft", "--blog-dir", blogDir, "--output", output, "--summary", summary, "--check"]);
    if (checked.status !== 0 || !checked.stdout.includes("publisher_queue_artifact=pass")) {
      process.stderr.write(checked.stdout + checked.stderr);
      throw new Error("expected publisher queue artifact check to pass");
    }
    process.stdout.write("publisher_queue_artifact_check_self_test=pass\n");

    await writeFixture(root, "\nExtra line that changes the markdown hash.\n");
    const stale = run(["--slug", "queue-draft", "--blog-dir", blogDir, "--output", output, "--summary", summary, "--check"]);
    if (stale.status === 0 || !stale.stderr.includes("summary markdown hash is stale")) {
      process.stderr.write(stale.stdout + stale.stderr);
      throw new Error("expected publisher queue artifact stale check to fail");
    }
    process.stdout.write("publisher_queue_artifact_stale_self_test=pass\n");

    await writeFile(
      join(blogDir, "bad-draft.md"),
      `---\ntitle: "Bad Draft"\ndraft: true\nworkflow: "packet"\n---\n\n# Bad Draft\n\n\`\`\`txt\npublisher_queue_item:\n  title: "Bad Draft"\n  source_url: "https://example.com/source"\n  publish_state: "ready"\n  approval_required: false\n\`\`\`\n`,
      "utf8",
    );
    const rejected = run(["--slug", "bad-draft", "--blog-dir", blogDir, "--output", join(root, "bad.html"), "--summary", join(root, "bad.json")]);
    if (rejected.status === 0 || !rejected.stderr.includes("missing_or_invalid_publishBlocked")) {
      process.stderr.write(rejected.stdout + rejected.stderr);
      throw new Error("expected invalid queue artifact to fail");
    }
    process.stdout.write("publisher_queue_artifact_invalid_queue_self_test=pass\n");
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

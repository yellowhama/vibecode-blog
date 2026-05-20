import { mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const creator = "scripts/create-source-workflow-packet.mjs";

function run(args) {
  return spawnSync(process.execPath, [resolve(creator), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function main() {
  const root = await makeTestTempDir("vibecode-source-workflow-packet-create-");
  try {
    const wikiRoot = join(root, "wiki");
    await mkdir(wikiRoot, { recursive: true });

    let result = run([
      "--wiki-root",
      wikiRoot,
      "--slug",
      "agent-writing-system",
      "--title",
      "The Agent Writing System Needs Evidence Before Drafting",
      "--source-url",
      "https://example.com/reference",
      "--reader-problem",
      "The reader has a topic but not enough proof to trust an agent draft.",
      "--internal-evidence",
      "script: scripts/create-source-workflow-packet.mjs; gate: npm run verify:source-workflow-quality",
    ]);
    if (result.status !== 0 || !result.stdout.includes("source_workflow_packet_create_gate=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected source workflow packet creator to pass with complete inputs");
    }
    process.stdout.write("source_workflow_packet_create_positive_self_test=pass\n");

    result = run([
      "--wiki-root",
      wikiRoot,
      "--slug",
      "agent-writing-system",
      "--title",
      "The Agent Writing System Needs Evidence Before Drafting",
      "--source-url",
      "https://example.com/reference",
    ]);
    if (result.status === 0 || !result.stderr.includes("packet already exists")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected source workflow packet creator to reject accidental overwrite");
    }
    process.stdout.write("source_workflow_packet_create_overwrite_self_test=pass\n");

    result = run([
      "--wiki-root",
      wikiRoot,
      "--slug",
      "bad-source",
      "--title",
      "Bad Source",
      "--source-url",
      "not-a-url",
    ]);
    if (result.status === 0 || !result.stderr.includes("--source-url must be an http(s) URL")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected source workflow packet creator to reject non-url source");
    }
    process.stdout.write("source_workflow_packet_create_bad_url_self_test=pass\n");
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

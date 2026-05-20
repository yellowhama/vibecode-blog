import { mkdir, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const packetCreator = "scripts/create-source-workflow-packet.mjs";
const draftCreator = "scripts/create-source-workflow-draft.mjs";

function run(script, args) {
  return spawnSync(process.execPath, [resolve(script), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function main() {
  const root = await makeTestTempDir("vibecode-source-workflow-draft-create-");
  try {
    const wikiRoot = join(root, "wiki");
    const outputDir = join(root, "drafts");
    await mkdir(wikiRoot, { recursive: true });
    await mkdir(outputDir, { recursive: true });

    let result = run(packetCreator, [
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
      "script: scripts/create-source-workflow-draft.mjs; gate: npm run verify:source-workflow-quality",
    ]);
    if (result.status !== 0) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected packet creator to pass before draft self-test");
    }

    result = run(draftCreator, [
      "--wiki-root",
      wikiRoot,
      "--output-dir",
      outputDir,
      "--slug",
      "agent-writing-system",
      "--title",
      "The Agent Writing System Needs Evidence Before Drafting",
      "--description",
      "A packet-backed draft for the agent writing system.",
      "--tags",
      "ai-agents,writing,verification",
    ]);
    if (result.status !== 0 || !result.stdout.includes("source_workflow_draft_state=draft_true")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected source workflow draft creator to produce a draft after packet gate pass");
    }

    const draftPath = join(outputDir, "agent-writing-system.md");
    const draft = await readFile(draftPath, "utf8");
    if (!/^draft:\s*true$/m.test(draft) || !/^workflow:\s*"packet"$/m.test(draft)) {
      throw new Error("expected generated draft to be draft:true and workflow:packet");
    }
    if (!draft.includes("source_workflow_quality_gate=pass") || !draft.includes("approval_required=true")) {
      throw new Error("expected generated draft to include gate receipt and approval boundary");
    }
    if (
      !draft.includes("opening_contract=show the object first") ||
      !draft.includes("scene=what the reader can picture") ||
      !draft.includes("The post should read like a reported field essay") ||
      !draft.includes("| Opens with the topic | Opens with the artifact or failure |")
    ) {
      throw new Error("expected generated draft to include reference-blogger scaffold contracts");
    }
    if (draft.includes("TODO: Write this section")) {
      throw new Error("expected generated draft to avoid blank TODO body scaffolding");
    }
    process.stdout.write("source_workflow_draft_create_positive_self_test=pass\n");

    result = run(draftCreator, [
      "--wiki-root",
      wikiRoot,
      "--output-dir",
      outputDir,
      "--slug",
      "agent-writing-system",
      "--title",
      "The Agent Writing System Needs Evidence Before Drafting",
    ]);
    if (result.status === 0 || !result.stderr.includes("draft already exists")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected source workflow draft creator to reject accidental overwrite");
    }
    process.stdout.write("source_workflow_draft_create_overwrite_self_test=pass\n");

    result = run(draftCreator, [
      "--wiki-root",
      wikiRoot,
      "--output-dir",
      outputDir,
      "--slug",
      "agent-writing-system",
      "--title",
      "The Agent Writing System Needs Evidence Before Drafting",
      "--publish",
    ]);
    if (result.status === 0 || !result.stderr.includes("only writes draft: true")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected source workflow draft creator to reject publication flags");
    }
    process.stdout.write("source_workflow_draft_create_publish_flag_self_test=pass\n");

    const emptyWikiRoot = join(root, "empty-wiki");
    await mkdir(emptyWikiRoot, { recursive: true });
    result = run(draftCreator, [
      "--wiki-root",
      emptyWikiRoot,
      "--output-dir",
      join(root, "blocked-drafts"),
      "--slug",
      "missing-packet",
      "--title",
      "Missing Packet Should Not Draft",
    ]);
    if (result.status === 0 || !result.stderr.includes("draft generation blocked")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected source workflow draft creator to block missing packet sets");
    }
    process.stdout.write("source_workflow_draft_create_missing_packet_self_test=pass\n");
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

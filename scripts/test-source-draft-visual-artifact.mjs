import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { makeTestTempDir } from "./test-temp-root.mjs";

const generator = "scripts/generate-source-draft-visual-artifact.mjs";

function run(args) {
  return spawnSync(process.execPath, [resolve(generator), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function writeFixture(root, extra = "") {
  const blogDir = join(root, "blog");
  await mkdir(blogDir, { recursive: true });
  await writeFile(
    join(blogDir, "visual-fixture.md"),
    `---\ntitle: "Visual Fixture"\ndraft: true\nworkflow: "packet"\n---\n\n# Visual Fixture\n\n## The Paragraph That Gets Past You\n\nThis weak opening has to be inspected before the topic is trusted.\n\n\`\`\`txt\nNow we have an AI marketing team.\n\`\`\`\n\n## The Failure Is Not Style\n\nReader question: What should the reader accept, reject, or verify before using this skill?\n\n## The Harness Is the Point\n\nA content skill is only useful when it carries a source, a boundary, and an artifact.\n\n## Source Thread\n\n\`\`\`txt\nskill: Research Scout\ngrounding_object: source URLs\nartifact: source-linked notes\n\`\`\`\n\n## The Pattern Worth Stealing\n\n\`\`\`txt\nbefore:\nask for five ideas\n\nafter:\nask for five ideas with source URLs and reject reasons\n\`\`\`\n\n## The Table To Use Before You Prompt Again\n\nThe table gives the reader a decision.\n\n${extra}\n`,
    "utf8",
  );
  return blogDir;
}

async function main() {
  const root = await makeTestTempDir("vibecode-source-draft-visual-");
  try {
    const blogDir = await writeFixture(root);
    const output = join(root, "visual-fixture.png");
    const summary = join(root, "visual-fixture-summary.json");
    let result = run(["--slug", "visual-fixture", "--blog-dir", blogDir, "--output", output, "--summary", summary]);
    if (result.status !== 0 || !result.stdout.includes("source_draft_visual_artifact=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected source draft visual artifact generation to pass");
    }
    const metadata = await sharp(output).metadata();
    if (metadata.width !== 1200 || metadata.height !== 630) {
      throw new Error("expected generated visual artifact to be 1200x630");
    }
    const generatedSummary = JSON.parse(await readFile(summary, "utf8"));
    if (!generatedSummary.imageSha256 || generatedSummary.requiredFields.beforeAfter !== true) {
      throw new Error("expected generated visual summary to include image hash and required fields");
    }
    process.stdout.write("source_draft_visual_artifact_generation_self_test=pass\n");

    result = run([
      "--check",
      "--slug",
      "visual-fixture",
      "--blog-dir",
      blogDir,
      "--output",
      output,
      "--summary",
      summary,
    ]);
    if (result.status !== 0 || !result.stdout.includes("source_draft_visual_artifact=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected fresh source draft visual artifact check to pass");
    }
    process.stdout.write("source_draft_visual_artifact_check_self_test=pass\n");

    await writeFixture(root, "This sentence changes the source draft hash.");
    result = run([
      "--check",
      "--slug",
      "visual-fixture",
      "--blog-dir",
      blogDir,
      "--output",
      output,
      "--summary",
      summary,
    ]);
    if (result.status === 0 || !result.stderr.includes("stale")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected stale source draft visual artifact check to fail");
    }
    process.stdout.write("source_draft_visual_artifact_stale_self_test=pass\n");
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

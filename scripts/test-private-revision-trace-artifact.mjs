import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { makeTestTempDir } from "./test-temp-root.mjs";

const generator = "scripts/generate-private-revision-trace-artifact.mjs";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function run(args) {
  return spawnSync(process.execPath, [resolve(generator), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function writeFixture(root, afterExtra = "") {
  await mkdir(root, { recursive: true });
  const before = "Before text that sounds approved but lacks the source question.\n";
  const after = `After text that opens with the source question before the approval receipt.\n${afterExtra}`;
  const revisionResult = {
    schema: "vibecode-human-quality-revision-result/v1",
    slug: "trace-fixture",
    beforeMarkdownSha256: sha256(before),
    afterMarkdownSha256: sha256(after),
    promotionAllowed: false,
    items: [
      {
        planItemId: "revision-plan-01-first-30-seconds",
        targetSection: "Opening",
        broadRewriteDenied: true,
        beforeQuote: "Before text that sounds approved but lacks the source question.",
        afterQuote: "After text that opens with the source question before the approval receipt.",
        acceptanceEvidence: "The opening now gives the reader the missing source decision before internal governance language.",
      },
    ],
  };
  const beforePath = join(root, "before.md");
  const afterPath = join(root, "after.md");
  const revisionPath = join(root, "revision-result.json");
  await writeFile(beforePath, before, "utf8");
  await writeFile(afterPath, after, "utf8");
  await writeFile(revisionPath, `${JSON.stringify(revisionResult, null, 2)}\n`, "utf8");
  return { beforePath, afterPath, revisionPath };
}

async function main() {
  const root = await makeTestTempDir("vibecode-private-revision-trace-");
  try {
    const { beforePath, afterPath, revisionPath } = await writeFixture(root);
    const output = join(root, "trace.png");
    const summary = join(root, "trace-summary.json");
    let result = run([
      "--slug",
      "trace-fixture",
      "--revision-result",
      revisionPath,
      "--before",
      beforePath,
      "--after",
      afterPath,
      "--output",
      output,
      "--summary",
      summary,
    ]);
    if (result.status !== 0 || !result.stdout.includes("private_revision_trace_artifact=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected private revision trace generation to pass");
    }
    const metadata = await sharp(output).metadata();
    if (metadata.width !== 1200 || metadata.height !== 760) {
      throw new Error("expected private revision trace image to be 1200x760");
    }
    const generatedSummary = JSON.parse(await readFile(summary, "utf8"));
    if (generatedSummary.broadRewriteDenied !== true || generatedSummary.itemCount !== 1) {
      throw new Error("expected private revision trace summary to preserve revision constraints");
    }
    process.stdout.write("private_revision_trace_generation_self_test=pass\n");

    result = run([
      "--check",
      "--slug",
      "trace-fixture",
      "--revision-result",
      revisionPath,
      "--before",
      beforePath,
      "--after",
      afterPath,
      "--output",
      output,
      "--summary",
      summary,
    ]);
    if (result.status !== 0 || !result.stdout.includes("private_revision_trace_artifact=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected private revision trace check to pass");
    }
    process.stdout.write("private_revision_trace_check_self_test=pass\n");

    const stale = await writeFixture(root, "stale hash change\n");
    result = run([
      "--check",
      "--slug",
      "trace-fixture",
      "--revision-result",
      stale.revisionPath,
      "--before",
      stale.beforePath,
      "--after",
      stale.afterPath,
      "--output",
      output,
      "--summary",
      summary,
    ]);
    if (result.status === 0 || !result.stderr.includes("stale")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected stale private revision trace check to fail");
    }
    process.stdout.write("private_revision_trace_stale_self_test=pass\n");
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

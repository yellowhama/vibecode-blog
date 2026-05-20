import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { makeTestTempDir } from "./test-temp-root.mjs";

const generator = "scripts/generate-private-workflow-evidence-artifact.mjs";

function run(args) {
  return spawnSync(process.execPath, [resolve(generator), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeFixture(root, options = {}) {
  await mkdir(root, { recursive: true });
  const sourceSummary = {
    schema: "vibecode-source-draft-visual/v1",
    slug: "workflow-fixture",
    title: "Workflow Fixture",
    imageSha256: "SOURCEHASH",
    requiredFields: {
      weakClaim: true,
      sourceMap: true,
      beforeAfter: true,
      transfer: true,
    },
  };
  const queueGenerationSummary = {
    schema: "vibecode-publisher-queue-artifact/v1",
    slug: "workflow-fixture",
    artifactSha256: "QUEUEHASH",
    requiredFields: {
      sourceUrl: true,
      readerDecision: true,
      requiredProof: true,
      imageState: true,
      publishBlocked: true,
      approvalRequired: true,
    },
  };
  const queueCaptureSummary = {
    requiredTextMatches: 6,
    requiredTextTotal: 6,
  };
  const revisionSummary = {
    schema: "vibecode-private-revision-trace/v1",
    slug: "workflow-fixture",
    imageSha256: "REVISIONHASH",
    broadRewriteDenied: options.broadRewriteDenied ?? true,
    rejectedRows: ["Opening", "Evidence density"],
  };
  const renderedSummary = {
    schema: "vibecode-private-rendered-candidate/v1",
    slug: "workflow-fixture",
    title: "Workflow Fixture",
    htmlSha256: "RENDERHASH",
    publicCandidate: false,
    approvalRequired: true,
  };
  const qualityReview = {
    schema: "vibecode-human-quality-review/v1",
    slug: "workflow-fixture",
    scorecard: [
      { label: "First 30 seconds", verdict: "accept" },
      { label: "Evidence density", verdict: options.rejectReview ? "reject" : "accept" },
    ],
  };
  const paths = {
    sourceSummary: join(root, "source-summary.json"),
    queueGenerationSummary: join(root, "queue-generation-summary.json"),
    queueCaptureSummary: join(root, "queue-capture-summary.json"),
    revisionSummary: join(root, "revision-summary.json"),
    renderedSummary: join(root, "rendered-summary.json"),
    qualityReview: join(root, "quality-review.json"),
    currentDraft: join(root, "draft.md"),
  };
  await writeJson(paths.sourceSummary, sourceSummary);
  await writeJson(paths.queueGenerationSummary, queueGenerationSummary);
  await writeJson(paths.queueCaptureSummary, queueCaptureSummary);
  await writeJson(paths.revisionSummary, revisionSummary);
  await writeJson(paths.renderedSummary, renderedSummary);
  await writeJson(paths.qualityReview, qualityReview);
  await writeFile(paths.currentDraft, "![Workflow evidence](workflow.png)\n", "utf8");
  return paths;
}

function fixtureArgs(paths, output, summary) {
  return [
    "--slug",
    "workflow-fixture",
    "--source-summary",
    paths.sourceSummary,
    "--queue-generation-summary",
    paths.queueGenerationSummary,
    "--queue-capture-summary",
    paths.queueCaptureSummary,
    "--revision-summary",
    paths.revisionSummary,
    "--rendered-summary",
    paths.renderedSummary,
    "--quality-review",
    paths.qualityReview,
    "--current-draft",
    paths.currentDraft,
    "--output",
    output,
    "--summary",
    summary,
  ];
}

async function main() {
  const root = await makeTestTempDir("vibecode-private-workflow-evidence-");
  try {
    const paths = await writeFixture(root);
    const output = join(root, "workflow.png");
    const summary = join(root, "workflow-summary.json");
    let result = run(fixtureArgs(paths, output, summary));
    if (result.status !== 0 || !result.stdout.includes("private_workflow_evidence_artifact=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected private workflow evidence generation to pass");
    }
    const metadata = await sharp(output).metadata();
    if (metadata.width !== 1400 || metadata.height !== 900) {
      throw new Error("expected private workflow evidence image to be 1400x900");
    }
    const generatedSummary = JSON.parse(await readFile(summary, "utf8"));
    if (
      generatedSummary.gates.sourceRequiredFields !== "4/4" ||
      generatedSummary.gates.queueRequiredFields !== "6/6" ||
      generatedSummary.gates.qualityReviewRejectedRows !== 0
    ) {
      throw new Error("expected private workflow evidence summary to preserve gate receipts");
    }
    process.stdout.write("private_workflow_evidence_generation_self_test=pass\n");

    result = run(["--check", ...fixtureArgs(paths, output, summary)]);
    if (result.status !== 0 || !result.stdout.includes("private_workflow_evidence_artifact=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected private workflow evidence check to pass");
    }
    process.stdout.write("private_workflow_evidence_check_self_test=pass\n");

    await writeFixture(root, { rejectReview: true });
    result = run(["--check", ...fixtureArgs(paths, output, summary)]);
    if (result.status === 0 || !result.stderr.includes("zero rejected rows")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected rejected quality row to fail private workflow evidence check");
    }
    process.stdout.write("private_workflow_evidence_rejected_review_self_test=pass\n");
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

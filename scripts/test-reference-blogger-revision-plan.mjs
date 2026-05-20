import { spawnSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const generator = resolve("scripts/generate-reference-blogger-revision-plan.mjs");

function run(args) {
  return spawnSync(process.execPath, [generator, ...args], {
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
    if (!output.includes(expected)) throw new Error(`${label}: missing output ${expected}\n${output}`);
  }
}

function summaryFixture() {
  return {
    slug: "software-3-0",
    title: "Software 3.0 Is a Verification Problem",
    markdownSha256: "ABC123",
    summary: "summary.json",
    reviewRows: ["quote", "save", "forward", "scene", "stakes", "boundary"],
    extracted: {
      quoteCandidates: ["The practical rule: generation can be probabilistic, but acceptance cannot be."],
      saveCandidates: ["| Step | What it prevents |"],
      evidenceObjects: ["software-3-0.png", "prompt expands intent"],
    },
  };
}

function reviewFixture(overrides = {}) {
  return {
    schema: "vibecode-reference-blogger-review-result/v1",
    slug: "software-3-0",
    markdownSha256: "ABC123",
    reviewer: {
      type: "editorial-trial",
      name: "reference-blogger-reviewer",
      reviewedAt: "2026-05-21T03:05:00+09:00",
    },
    overallDecision: "revision_required",
    rowDecisions: [
      {
        row: "quote",
        verdict: "accept",
        evidence: "The acceptance/probabilistic line is short enough to quote and carries the thesis.",
      },
      {
        row: "save",
        verdict: "accept",
        evidence: "The source/contract/diff/verifier/receipt table is reusable as an operator checklist.",
      },
      {
        row: "forward",
        verdict: "reject",
        evidence: "The post explains the rule but does not name the exact teammate who should receive it.",
        targetSection: "Prompt Pattern",
        requiredChange: "Add a forwardable reader decision that names the audience and the decision it helps them make.",
        narrowRewriteBrief:
          'Revise only "Prompt Pattern" by adding one forwardable reviewer/audience sentence. Do not perform a broad style pass.',
        acceptanceCheck: "The revised prompt section names a concrete teammate and the exact review decision this article helps them make.",
      },
      {
        row: "scene",
        verdict: "accept",
        evidence: "The article opens with a dated audit command and the article's own weak score.",
      },
      {
        row: "stakes",
        verdict: "reject",
        evidence: "The public-site failures are listed, but the cost of ignoring them is not concrete enough.",
        requiredChange: "Show the cost of ignoring the rule in time, trust, review cost, or public embarrassment.",
      },
      {
        row: "boundary",
        verdict: "accept",
        evidence: "The boundary section limits the Software 3.0 claim and excludes throwaway prototypes.",
      },
    ],
    ...overrides,
  };
}

try {
  const root = await makeTestTempDir("vibecode-reference-blogger-revision-plan-");
  await mkdir(root, { recursive: true });
  const summaryPath = join(root, "summary.json");
  const reviewPath = join(root, "review.json");
  const outputPath = join(root, "nested", "plan.json");
  await writeFile(summaryPath, `${JSON.stringify(summaryFixture(), null, 2)}\n`, "utf8");
  await writeFile(reviewPath, `${JSON.stringify(reviewFixture(), null, 2)}\n`, "utf8");

  const generated = run(["--summary", summaryPath, "--review", reviewPath, "--output", outputPath]);
  requireRun("generate", generated, 0, [
    "reference_blogger_revision_plan_items=2",
    "reference_blogger_revision_plan_status=ready_for_body_revision",
  ]);
  const plan = JSON.parse(await readFile(outputPath, "utf8"));
  if (plan.items.map((item) => item.row).sort().join(",") !== "forward,stakes") {
    throw new Error("expected plan items to match rejected forward and stakes rows");
  }
  const forwardItem = plan.items.find((item) => item.row === "forward");
  if (forwardItem?.targetSection !== "Prompt Pattern") {
    throw new Error("expected rejected review targetSection override to drive the revision plan");
  }
  if (!forwardItem?.narrowRewriteBrief.includes("one forwardable reviewer/audience sentence")) {
    throw new Error("expected rejected review narrowRewriteBrief override to drive the revision plan");
  }
  if (!plan.items.every((item) => /Do not perform a broad style pass/i.test(item.narrowRewriteBrief))) {
    throw new Error("expected every plan item to reject broad style passes");
  }

  const check = run(["--summary", summaryPath, "--review", reviewPath, "--output", outputPath, "--check"]);
  requireRun("check", check, 0, ["reference_blogger_revision_plan=pass"]);

  await writeFile(summaryPath, `${JSON.stringify({ ...summaryFixture(), markdownSha256: "STALE" }, null, 2)}\n`, "utf8");
  const stale = run(["--summary", summaryPath, "--review", reviewPath, "--output", outputPath, "--check"]);
  requireRun("stale", stale, 1, ["review markdown SHA is stale"]);

  await writeFile(summaryPath, `${JSON.stringify(summaryFixture(), null, 2)}\n`, "utf8");
  await writeFile(
    reviewPath,
    `${JSON.stringify(
      reviewFixture({
        rowDecisions: reviewFixture().rowDecisions.map((item) =>
          item.row === "forward" ? { ...item, requiredChange: "too thin" } : item,
        ),
      }),
      null,
      2,
    )}\n`,
    "utf8",
  );
  const weak = run(["--summary", summaryPath, "--review", reviewPath, "--output", outputPath]);
  requireRun("weak", weak, 1, ["forward rejected row must include a concrete requiredChange"]);

  await rm(root, { recursive: true, force: true });
  process.stdout.write("reference_blogger_revision_plan_generation_self_test=pass\n");
  process.stdout.write("reference_blogger_revision_plan_check_self_test=pass\n");
  process.stdout.write("reference_blogger_revision_plan_stale_self_test=pass\n");
  process.stdout.write("reference_blogger_revision_plan_reject_detail_self_test=pass\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

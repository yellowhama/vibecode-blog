import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const templateGenerator = "scripts/generate-human-quality-review-template.mjs";
const reviewEditorGenerator = "scripts/generate-human-quality-review-editor.mjs";
const resultVerifier = "scripts/verify-human-quality-review-result.mjs";
const revisionQueueGenerator = "scripts/generate-human-quality-revision-queue.mjs";

function run(script, args) {
  return spawnSync(process.execPath, [resolve(script), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

function summaryFixture() {
  const rows = [
    "First 30 seconds",
    "Evidence density",
    "Point of view",
    "Reader transfer",
    "Voice and readability",
    "Embarrassment risk",
  ].map((label) => ({
    label,
    rejectIf: `${label} reject condition with enough detail for the template.`,
    requiredEvidence: `${label} required evidence for the human reviewer.`,
  }));
  return {
    slug: "review-fixture",
    markdownSha256: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    promotionAllowedWithoutHuman: false,
    currentDecision: "keep_internal_example",
    candidateBlockers: ["human_critique", "rendered_candidate", "hash_approval", "image_contract"],
    reviewArtifact: { requiredTextMatches: 12, requiredTextTotal: 12 },
    realFailedDraftEvidence: { status: "present" },
    humanQualityScorecard: rows,
  };
}

function draftFixture() {
  const paragraph =
    "The first honest test of this review desk is whether a cold reader can see the failed paragraph, the evidence receipt, and the next editorial decision without knowing any loop history. The draft needs enough pressure, artifact density, and reader transfer to make the human reviewer argue with a sentence instead of approving a concept.";
  return `---
title: "Review Fixture"
draft: true
---

# Review Fixture

## Packet Receipt

\`\`\`txt
publication_state=draft_only
approval_required=true
approval_candidate=false
editorial_decision=keep_internal_example
candidate_blockers=human_critique,rendered_candidate,hash_approval,image_contract
source_workflow_slug=review-fixture
rendered_screenshot=F:\\Aisaak\\CompanyArtifacts\\vibecode-draft-review-artifacts\\review-fixture.png
\`\`\`

The first honest test of the writing system did not look like a breakthrough. It looked like a paragraph that sounded competent until a reviewer asked what source changed the claim, what decision the reader could make, and what proof object would survive a skeptical reader.

This fixture gives the human review editor a real opening excerpt to display. It should not let a reviewer approve from vibes, because the screen must show the article text, receipt lines, image references, and passages to inspect before the scorecard begins.

![Review fixture visual](/images/posts/review-fixture.png)

## Review Desk Protocol

${Array.from({ length: 10 }, (_, index) => `${paragraph} This repeated fixture paragraph ${index + 1} mentions review, evidence, artifact, reader transfer, failed draft pressure, AutoAgent comparison, and the paragraph-level harness so the editor has enough inspectable prose to parse.`).join("\n\n")}

## Reader Transfer

The reader leaves with a concrete review form, not a vague instruction to write better.
`;
}

function reviewFixture(summary, overrides = {}) {
  return {
    schema: "vibecode-human-quality-review/v1",
    slug: summary.slug,
    markdownSha256: summary.markdownSha256,
    reviewStatus: "completed_human_review",
    promotionAllowedWithoutHuman: false,
    reviewer: {
      name: "Human Reviewer",
      handle: "human",
      reviewedAt: "2026-05-20T00:00:00.000Z",
    },
    decision: "keep_internal_example",
    scorecard: summary.humanQualityScorecard.map((row) => ({
      label: row.label,
      verdict: "accept",
      evidenceNote: `Accepted ${row.label} because the draft provides inspectable evidence and reader-facing pressure in this fixture.`,
      requiredChange: "",
    })),
    overallRationale:
      "This review fixture is intentionally long enough to prove that a human rationale is captured instead of allowing a one-word approval. It names evidence, reader pressure, transfer, and promotion risk.",
    nextActions: ["Keep the draft private until rendered candidate proof and hash approval exist."],
    ...overrides,
  };
}

async function main() {
  const root = await makeTestTempDir("vibecode-human-quality-review-");
  try {
    const summary = summaryFixture();
    const summaryPath = join(root, "summary.json");
    const templatePath = join(root, "template.json");
    const draftPath = join(root, "draft.md");
    const reviewPath = join(root, "review.json");
    await mkdir(root, { recursive: true });
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    await writeFile(draftPath, draftFixture(), "utf8");

    let result = run(templateGenerator, ["--summary", summaryPath, "--output", templatePath]);
    if (result.status !== 0 || !result.stdout.includes("human_quality_review_template=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected human quality review template generation to pass");
    }
    const template = JSON.parse(await readFile(templatePath, "utf8"));
    if (
      template.promotionAllowedWithoutHuman !== false ||
      template.scorecard.length !== 6 ||
      !template.scorecard.some((row) => row.label === "Embarrassment risk")
    ) {
      throw new Error("generated human quality review template is missing required scorecard contract");
    }
    process.stdout.write("human_quality_review_template_generation_self_test=pass\n");

    result = run(templateGenerator, ["--check", "--summary", summaryPath, "--output", templatePath]);
    if (result.status !== 0 || !result.stdout.includes("human_quality_review_template=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected human quality review template check to pass");
    }
    process.stdout.write("human_quality_review_template_check_self_test=pass\n");

    const editorPath = join(root, "editor.html");
    result = run(reviewEditorGenerator, ["--template", templatePath, "--draft", draftPath, "--output", editorPath]);
    if (result.status !== 0 || !result.stdout.includes("human_quality_review_editor=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected human quality review editor generation to pass");
    }
    const editorHtml = await readFile(editorPath, "utf8");
    for (const requiredText of [
      "Human Quality Review Editor",
      "Copy JSON",
      "Any rejected row keeps the draft private",
      "Draft Review Desk",
      "Opening excerpt",
      "Evidence receipts",
      "Reviewer must cite an exact passage",
      "Evidence density",
      "Embarrassment risk",
    ]) {
      if (!editorHtml.includes(requiredText)) {
        throw new Error(`generated human quality review editor missing ${requiredText}`);
      }
    }
    process.stdout.write("human_quality_review_editor_generation_self_test=pass\n");

    result = run(reviewEditorGenerator, ["--check", "--template", templatePath, "--draft", draftPath, "--output", editorPath]);
    if (result.status !== 0 || !result.stdout.includes("human_quality_review_editor=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected fresh human quality review editor check to pass");
    }
    process.stdout.write("human_quality_review_editor_check_self_test=pass\n");

    await writeFile(reviewPath, `${JSON.stringify(reviewFixture(summary), null, 2)}\n`, "utf8");
    result = run(resultVerifier, ["--summary", summaryPath, "--review", reviewPath]);
    if (result.status !== 0 || !result.stdout.includes("human_quality_review_result=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected accepted human quality review result to pass");
    }
    process.stdout.write("human_quality_review_result_accept_self_test=pass\n");

    const rejectReview = reviewFixture(summary, {
      decision: "promote_to_approval_candidate",
      scorecard: summary.humanQualityScorecard.map((row, index) => ({
        label: row.label,
        verdict: index === 1 ? "reject" : "accept",
        evidenceNote: `Reviewed ${row.label} with enough evidence note text for the verifier to inspect the row.`,
        requiredChange: index === 1 ? "Add concrete screenshot proof before promotion." : "",
      })),
    });
    await writeFile(reviewPath, `${JSON.stringify(rejectReview, null, 2)}\n`, "utf8");
    result = run(resultVerifier, ["--summary", summaryPath, "--review", reviewPath]);
    if (result.status === 0 || !result.stderr.includes("any rejected scorecard row requires")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected reject-plus-promote human quality review result to fail");
    }
    process.stdout.write("human_quality_review_result_reject_blocks_promotion_self_test=pass\n");

    const validRejectReview = reviewFixture(summary, {
      decision: "keep_internal_example",
      scorecard: summary.humanQualityScorecard.map((row, index) => ({
        label: row.label,
        verdict: index === 1 ? "reject" : "accept",
        evidenceNote: `Reviewed ${row.label} with enough evidence note text for the verifier to inspect the row.`,
        requiredChange: index === 1 ? "Add concrete screenshot proof before promotion." : "",
      })),
      nextActions: ["Revise the rejected evidence density row before another promotion review."],
    });
    const queuePath = join(root, "revision-queue.json");
    await writeFile(reviewPath, `${JSON.stringify(validRejectReview, null, 2)}\n`, "utf8");
    result = run(resultVerifier, ["--summary", summaryPath, "--review", reviewPath]);
    if (result.status !== 0 || !result.stdout.includes("human_quality_review_result=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected keep-private rejected human quality review result to pass");
    }
    result = run(revisionQueueGenerator, ["--summary", summaryPath, "--review", reviewPath, "--output", queuePath]);
    if (
      result.status !== 0 ||
      !result.stdout.includes("human_quality_revision_queue=pass") ||
      !result.stdout.includes("human_quality_revision_queue_reject_count=1")
    ) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected rejected human quality review to produce revision queue");
    }
    const queue = JSON.parse(await readFile(queuePath, "utf8"));
    if (
      queue.queueStatus !== "revision_required" ||
      queue.items.length !== 1 ||
      queue.items[0].scorecardLabel !== "Evidence density"
    ) {
      throw new Error("expected revision queue to contain the rejected Evidence density row");
    }
    process.stdout.write("human_quality_revision_queue_reject_self_test=pass\n");

    result = run(revisionQueueGenerator, ["--check", "--summary", summaryPath, "--review", reviewPath, "--output", queuePath]);
    if (result.status !== 0 || !result.stdout.includes("human_quality_revision_queue=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected fresh human quality revision queue check to pass");
    }
    process.stdout.write("human_quality_revision_queue_check_self_test=pass\n");
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

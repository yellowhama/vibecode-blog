import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DEFAULT_SUMMARY =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-promotion-review-summary.json";
const DEFAULT_REVIEW =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-review-result.json";
const DEFAULT_OUTPUT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-revision-queue.json";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clean(value) {
  return String(value ?? "").trim();
}

function queueItem(row, index) {
  return {
    id: `human-reject-${String(index + 1).padStart(2, "0")}-${row.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`,
    scorecardLabel: row.label,
    problem: clean(row.evidenceNote),
    requiredChange: clean(row.requiredChange),
    revisionTarget: "article body",
    acceptanceCheck: `A future human quality review row for "${row.label}" must be accept with a concrete evidence note.`,
  };
}

function buildQueue(summary, review) {
  const rejectedRows = asArray(review.scorecard).filter((row) => row?.verdict === "reject");
  return {
    schema: "vibecode-human-quality-revision-queue/v1",
    slug: summary.slug,
    markdownSha256: summary.markdownSha256,
    sourceReviewDecision: review.decision,
    sourceReviewer: review.reviewer ?? {},
    promotionAllowed: false,
    queueStatus: rejectedRows.length > 0 ? "revision_required" : "no_revisions_required",
    rejectCount: rejectedRows.length,
    items: rejectedRows.map(queueItem),
    nextGate: rejectedRows.length > 0 ? "revise_from_rejected_rows_then_regenerate_review_packet" : "prepare_rendered_candidate_and_image_contract",
  };
}

function validateQueue(summary, review, queue) {
  const failures = [];
  const rejectedRows = asArray(review.scorecard).filter((row) => row?.verdict === "reject");

  if (queue.schema !== "vibecode-human-quality-revision-queue/v1") {
    failures.push("revision queue schema must be vibecode-human-quality-revision-queue/v1");
  }
  if (queue.slug !== summary.slug) failures.push("revision queue slug must match summary");
  if (queue.markdownSha256 !== summary.markdownSha256) failures.push("revision queue markdownSha256 must match summary");
  if (queue.sourceReviewDecision !== review.decision) failures.push("revision queue sourceReviewDecision must match review");
  if (queue.promotionAllowed !== false) failures.push("revision queue must keep promotionAllowed=false");
  if (queue.rejectCount !== rejectedRows.length) failures.push("revision queue rejectCount must match rejected rows");
  if (asArray(queue.items).length !== rejectedRows.length) {
    failures.push("revision queue items must match rejected rows");
  }
  if (rejectedRows.length > 0 && queue.queueStatus !== "revision_required") {
    failures.push("revision queue with rejected rows must have queueStatus=revision_required");
  }
  if (rejectedRows.length === 0 && queue.queueStatus !== "no_revisions_required") {
    failures.push("revision queue without rejected rows must have queueStatus=no_revisions_required");
  }

  for (const row of rejectedRows) {
    const item = asArray(queue.items).find((candidate) => candidate?.scorecardLabel === row.label);
    if (!item) {
      failures.push(`revision queue missing item for rejected row: ${row.label}`);
      continue;
    }
    if (clean(item.problem).length < 40) failures.push(`revision queue item ${item.id} problem is too thin`);
    if (clean(item.requiredChange).length < 20) {
      failures.push(`revision queue item ${item.id} requiredChange is too thin`);
    }
    if (!clean(item.acceptanceCheck).includes(row.label)) {
      failures.push(`revision queue item ${item.id} acceptanceCheck must name the scorecard label`);
    }
  }

  return failures;
}

async function main() {
  const summaryPath = resolve(getArg("--summary") ?? DEFAULT_SUMMARY);
  const reviewPath = resolve(getArg("--review") ?? DEFAULT_REVIEW);
  const output = resolve(getArg("--output") ?? DEFAULT_OUTPUT);
  const check = hasArg("--check");
  const summary = JSON.parse(await readFile(summaryPath, "utf8"));
  const review = JSON.parse(await readFile(reviewPath, "utf8"));
  const queue = buildQueue(summary, review);
  const text = `${JSON.stringify(queue, null, 2)}\n`;
  const failures = validateQueue(summary, review, queue);

  if (check) {
    if (!existsSync(output)) {
      failures.push(`human quality revision queue missing: ${output}`);
    } else if ((await readFile(output, "utf8")) !== text) {
      failures.push("human quality revision queue is stale");
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, text, "utf8");
  }

  process.stdout.write(`human_quality_revision_queue=${output}\n`);
  process.stdout.write(`human_quality_revision_queue_status=${queue.queueStatus}\n`);
  process.stdout.write(`human_quality_revision_queue_reject_count=${queue.rejectCount}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("human_quality_revision_queue=fail\n");
    return 1;
  }
  process.stdout.write("human_quality_revision_queue=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

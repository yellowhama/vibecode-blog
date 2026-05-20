import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_SUMMARY =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-promotion-review-summary.json";
const DEFAULT_REVIEW =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-review-result.json";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function textLength(value) {
  return String(value ?? "").trim().length;
}

async function main() {
  const summaryPath = resolve(getArg("--summary") ?? DEFAULT_SUMMARY);
  const reviewPath = resolve(getArg("--review") ?? DEFAULT_REVIEW);
  const summary = JSON.parse(await readFile(summaryPath, "utf8"));
  const review = JSON.parse(await readFile(reviewPath, "utf8"));
  const failures = [];

  if (review.schema !== "vibecode-human-quality-review/v1") {
    failures.push("review.schema must be vibecode-human-quality-review/v1");
  }
  if (review.slug !== summary.slug) failures.push("review.slug must match the promotion summary");
  if (review.markdownSha256 !== summary.markdownSha256) {
    failures.push("review.markdownSha256 must match the promotion summary");
  }
  if (review.promotionAllowedWithoutHuman !== false) {
    failures.push("review must keep promotionAllowedWithoutHuman=false");
  }
  if (textLength(review.reviewer?.name) < 2) failures.push("reviewer.name is required");
  if (!review.reviewer?.reviewedAt || Number.isNaN(Date.parse(review.reviewer.reviewedAt))) {
    failures.push("reviewer.reviewedAt must be an ISO timestamp");
  }
  if (!["keep_internal_example", "promote_to_approval_candidate"].includes(review.decision)) {
    failures.push("review.decision must be keep_internal_example or promote_to_approval_candidate");
  }
  if (textLength(review.overallRationale) < 120) {
    failures.push("review.overallRationale must be at least 120 characters");
  }
  if (asArray(review.nextActions).length < 1) {
    failures.push("review.nextActions must include at least one action");
  }

  const expectedRows = asArray(summary.humanQualityScorecard);
  const rows = asArray(review.scorecard);
  if (rows.length !== expectedRows.length) {
    failures.push(`review.scorecard must include ${expectedRows.length} rows`);
  }

  let rejectCount = 0;
  for (const expected of expectedRows) {
    const row = rows.find((item) => item?.label === expected.label);
    if (!row) {
      failures.push(`review.scorecard missing row: ${expected.label}`);
      continue;
    }
    if (!["accept", "reject"].includes(row.verdict)) {
      failures.push(`review.scorecard.${expected.label}.verdict must be accept or reject`);
    }
    if (row.verdict === "reject") rejectCount += 1;
    if (textLength(row.evidenceNote) < 40) {
      failures.push(`review.scorecard.${expected.label}.evidenceNote is too thin`);
    }
    if (row.verdict === "reject" && textLength(row.requiredChange) < 20) {
      failures.push(`review.scorecard.${expected.label}.requiredChange is required when rejected`);
    }
  }

  if (rejectCount > 0 && review.decision !== "keep_internal_example") {
    failures.push("any rejected scorecard row requires decision=keep_internal_example");
  }
  if (review.decision === "promote_to_approval_candidate" && rejectCount > 0) {
    failures.push("promotion is impossible while scorecard rows are rejected");
  }
  if (review.decision === "promote_to_approval_candidate" && summary.promotionAllowedWithoutHuman !== false) {
    failures.push("promotion summary must prove promotionAllowedWithoutHuman=false before human review");
  }

  process.stdout.write(`human_quality_review_result=${reviewPath}\n`);
  process.stdout.write(`human_quality_review_scorecard_rows=${rows.length}\n`);
  process.stdout.write(`human_quality_review_reject_count=${rejectCount}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("human_quality_review_result=fail\n");
    return 1;
  }
  process.stdout.write("human_quality_review_result=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

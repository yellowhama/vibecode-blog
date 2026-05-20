import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DEFAULT_SUMMARY =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/software-3-0-reference-blogger-review-summary.json";
const DEFAULT_REVIEW =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/software-3-0-reference-blogger-review-result.json";
const DEFAULT_OUTPUT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/software-3-0-reference-blogger-revision-plan.json";

const ROWS = {
  quote: {
    label: "Quote",
    targetSection: "The Mechanism",
    acceptanceCheck: "The revised section has one sentence a reader could quote without the rest of the article.",
  },
  save: {
    label: "Save",
    targetSection: "The Receipt",
    acceptanceCheck: "The revised section contains a reusable artifact, checklist, matrix, command, or decision table.",
  },
  forward: {
    label: "Forward",
    targetSection: "Reader Decision",
    acceptanceCheck: "The revised section names the exact reader who should receive the post and the decision it helps them make.",
  },
  scene: {
    label: "Scene",
    targetSection: "The Case File",
    acceptanceCheck: "The revised section has a specific time, file, command, log, screenshot, or before/after object.",
  },
  stakes: {
    label: "Stakes",
    targetSection: "A Concrete Example",
    acceptanceCheck: "The revised section makes the cost of ignoring the rule concrete in time, trust, money, security, review cost, or public embarrassment.",
  },
  boundary: {
    label: "Boundary",
    targetSection: "Boundary",
    acceptanceCheck: "The revised section names what the article refuses to prove and how that limits the reader's action.",
  },
};

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

async function readJson(path) {
  if (!existsSync(path)) throw new Error(`missing JSON file: ${path}`);
  return JSON.parse(await readFile(path, "utf8"));
}

function validateReview(summary, review) {
  const failures = [];
  if (review.schema !== "vibecode-reference-blogger-review-result/v1") {
    failures.push("review.schema must be vibecode-reference-blogger-review-result/v1");
  }
  if (review.slug !== summary.slug) failures.push("review.slug must match summary.slug");
  if (review.markdownSha256 !== summary.markdownSha256) failures.push("review markdown SHA is stale");
  if (!["accepted", "revision_required"].includes(review.overallDecision)) {
    failures.push("review.overallDecision must be accepted or revision_required");
  }
  if (!review.reviewer?.name || clean(review.reviewer.name).length < 2) {
    failures.push("reviewer.name is required");
  }
  if (!review.reviewer?.reviewedAt || Number.isNaN(Date.parse(review.reviewer.reviewedAt))) {
    failures.push("reviewer.reviewedAt must be an ISO timestamp");
  }

  const expectedRows = asArray(summary.reviewRows);
  const decisions = asArray(review.rowDecisions);
  const byRow = new Map(decisions.map((item) => [item.row, item]));
  for (const row of expectedRows) {
    const decision = byRow.get(row);
    if (!decision) {
      failures.push(`review missing row decision: ${row}`);
      continue;
    }
    if (!["accept", "reject"].includes(decision.verdict)) {
      failures.push(`${row} verdict must be accept or reject`);
    }
    if (clean(decision.evidence).length < 24) {
      failures.push(`${row} evidence is too thin`);
    }
    if (decision.verdict === "reject" && clean(decision.requiredChange).length < 24) {
      failures.push(`${row} rejected row must include a concrete requiredChange`);
    }
  }
  for (const decision of decisions) {
    if (!expectedRows.includes(decision.row)) failures.push(`review has unknown row decision: ${decision.row}`);
  }

  const rejected = decisions.filter((item) => item.verdict === "reject");
  if (rejected.length > 0 && review.overallDecision !== "revision_required") {
    failures.push("review with rejected rows must set overallDecision=revision_required");
  }
  if (rejected.length === 0 && review.overallDecision !== "accepted") {
    failures.push("review with zero rejected rows must set overallDecision=accepted");
  }

  return { failures, rejected };
}

function anchorFor(summary, row) {
  if (row === "quote") return summary.extracted?.quoteCandidates?.[0] ?? "";
  if (row === "save") return summary.extracted?.saveCandidates?.[0] ?? "";
  if (row === "scene") return summary.extracted?.evidenceObjects?.[0] ?? "";
  if (row === "stakes") return summary.extracted?.evidenceObjects?.at?.(-1) ?? "";
  if (row === "forward") return "Reader Decision";
  if (row === "boundary") return "Boundary";
  return "";
}

function buildPlan(summary, review, rejected) {
  const items = rejected.map((decision, index) => {
    const row = ROWS[decision.row];
    return {
      id: `reference-blogger-revision-${String(index + 1).padStart(2, "0")}-${decision.row}`,
      row: decision.row,
      label: row.label,
      targetSection: row.targetSection,
      targetAnchor: clean(decision.anchor ?? anchorFor(summary, decision.row)),
      reviewerProblem: clean(decision.evidence),
      requiredChange: clean(decision.requiredChange),
      narrowRewriteBrief: `Revise only "${row.targetSection}" so the ${row.label.toLowerCase()} row would move from reject to accept. Do not perform a broad style pass.`,
      acceptanceCheck: row.acceptanceCheck,
    };
  });

  return {
    schema: "vibecode-reference-blogger-revision-plan/v1",
    generatedAt: new Date().toISOString(),
    slug: summary.slug,
    title: summary.title,
    markdownSha256: summary.markdownSha256,
    sourceSummary: resolve(summary.summary ?? DEFAULT_SUMMARY),
    sourceReviewDecision: review.overallDecision,
    reviewer: review.reviewer,
    rejectedRows: rejected.map((item) => item.row),
    rejectedRowCount: rejected.length,
    planStatus: items.length > 0 ? "ready_for_body_revision" : "no_body_revision_required",
    promotionAllowed: false,
    items,
    nextGate:
      items.length > 0
        ? "revise_body_against_reference_blogger_plan_then_regenerate_artifacts"
        : "eligible_for_human_publication_review",
  };
}

function validatePlan(summary, review, plan, rejected) {
  const failures = [];
  if (plan.schema !== "vibecode-reference-blogger-revision-plan/v1") {
    failures.push("plan.schema must be vibecode-reference-blogger-revision-plan/v1");
  }
  if (plan.slug !== summary.slug) failures.push("plan.slug must match summary.slug");
  if (plan.markdownSha256 !== summary.markdownSha256) failures.push("plan markdown SHA is stale");
  if (plan.sourceReviewDecision !== review.overallDecision) {
    failures.push("plan sourceReviewDecision must match review");
  }
  if (plan.rejectedRowCount !== rejected.length) failures.push("plan rejectedRowCount must match review");
  const planRows = asArray(plan.items).map((item) => item.row).sort();
  const rejectedRows = rejected.map((item) => item.row).sort();
  if (planRows.join(",") !== rejectedRows.join(",")) failures.push("plan items must match rejected rows");
  if (rejected.length > 0 && plan.planStatus !== "ready_for_body_revision") {
    failures.push("plan with rejected rows must be ready_for_body_revision");
  }
  if (plan.promotionAllowed !== false) failures.push("plan must keep promotionAllowed=false");
  for (const item of asArray(plan.items)) {
    if (!ROWS[item.row]) failures.push(`plan item has unknown row: ${item.row}`);
    if (clean(item.targetSection).length < 3) failures.push(`${item.id} targetSection is missing`);
    if (clean(item.requiredChange).length < 24) failures.push(`${item.id} requiredChange is too thin`);
    if (!/Do not perform a broad style pass/i.test(item.narrowRewriteBrief ?? "")) {
      failures.push(`${item.id} must reject broad style passes`);
    }
    if (clean(item.acceptanceCheck).length < 30) failures.push(`${item.id} acceptanceCheck is too thin`);
  }
  return failures;
}

async function main() {
  const summaryPath = getArg("--summary") ?? DEFAULT_SUMMARY;
  const reviewPath = getArg("--review") ?? DEFAULT_REVIEW;
  const output = getArg("--output") ?? DEFAULT_OUTPUT;
  const summary = await readJson(summaryPath);
  const review = await readJson(reviewPath);
  const { failures: reviewFailures, rejected } = validateReview(summary, review);
  if (reviewFailures.length) {
    throw new Error(`Reference blogger review result is invalid.\n- ${reviewFailures.join("\n- ")}`);
  }

  if (hasArg("--check")) {
    const plan = await readJson(output);
    const failures = validatePlan(summary, review, plan, rejected);
    if (failures.length) {
      throw new Error(`Reference blogger revision plan is stale or incomplete.\n- ${failures.join("\n- ")}`);
    }
    process.stdout.write(`reference_blogger_revision_plan=${resolve(output)}\n`);
    process.stdout.write(`reference_blogger_revision_plan_items=${asArray(plan.items).length}\n`);
    process.stdout.write("reference_blogger_revision_plan=pass\n");
    return 0;
  }

  const plan = buildPlan(summary, review, rejected);
  await mkdir(dirname(resolve(output)), { recursive: true });
  await writeFile(output, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  process.stdout.write(`reference_blogger_revision_plan=${resolve(output)}\n`);
  process.stdout.write(`reference_blogger_revision_plan_items=${plan.items.length}\n`);
  process.stdout.write(`reference_blogger_revision_plan_status=${plan.planStatus}\n`);
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

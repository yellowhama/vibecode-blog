import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DEFAULT_SUMMARY =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-promotion-review-summary.json";
const DEFAULT_OUTPUT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-review-template.json";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function buildTemplate(summary) {
  const scorecard = Array.isArray(summary.humanQualityScorecard) ? summary.humanQualityScorecard : [];
  return {
    schema: "vibecode-human-quality-review/v1",
    slug: summary.slug,
    markdownSha256: summary.markdownSha256,
    reviewStatus: "pending_human_review",
    promotionAllowedWithoutHuman: false,
    allowedDecisions: ["keep_internal_example", "promote_to_approval_candidate"],
    decisionRule: "If any scorecard verdict is reject, decision must be keep_internal_example.",
    reviewer: {
      name: "",
      handle: "",
      reviewedAt: "",
    },
    decision: "",
    scorecard: scorecard.map((item) => ({
      label: item.label,
      rejectIf: item.rejectIf,
      requiredEvidence: item.requiredEvidence,
      verdict: "",
      evidenceNote: "",
      requiredChange: "",
    })),
    overallRationale: "",
    nextActions: [],
    sourcePacket: {
      promotionSummarySha256: summary.markdownSha256,
      reviewArtifact: summary.reviewArtifact ?? {},
      currentDecision: summary.currentDecision,
      currentBlockers: summary.candidateBlockers ?? [],
      realFailedDraftEvidence: summary.realFailedDraftEvidence ?? {},
    },
  };
}

async function main() {
  const summaryPath = resolve(getArg("--summary") ?? DEFAULT_SUMMARY);
  const output = resolve(getArg("--output") ?? DEFAULT_OUTPUT);
  const check = hasArg("--check");
  const summary = JSON.parse(await readFile(summaryPath, "utf8"));
  const template = buildTemplate(summary);
  const text = `${JSON.stringify(template, null, 2)}\n`;

  const failures = [];
  if (template.promotionAllowedWithoutHuman !== false) {
    failures.push("human quality review template must keep promotionAllowedWithoutHuman=false");
  }
  if (!template.slug || !template.markdownSha256) {
    failures.push("human quality review template requires slug and markdownSha256");
  }
  if (!Array.isArray(template.scorecard) || template.scorecard.length < 6) {
    failures.push("human quality review template requires at least six scorecard rows");
  }
  if (!template.scorecard.some((row) => row.label === "Embarrassment risk")) {
    failures.push("human quality review template must include embarrassment risk");
  }

  if (check) {
    if (!existsSync(output)) {
      failures.push(`human quality review template missing: ${output}`);
    } else if ((await readFile(output, "utf8")) !== text) {
      failures.push("human quality review template is stale");
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, text, "utf8");
  }

  process.stdout.write(`human_quality_review_template=${output}\n`);
  process.stdout.write(`human_quality_review_template_rows=${template.scorecard.length}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("human_quality_review_template=fail\n");
    return 1;
  }
  process.stdout.write("human_quality_review_template=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

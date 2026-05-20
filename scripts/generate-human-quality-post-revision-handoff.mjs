import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";

const DEFAULT_PLAN =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-revision-plan.json";
const DEFAULT_AFTER =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-revised-candidate.md";
const DEFAULT_RESULT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-revision-result.json";
const DEFAULT_OUTPUT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-post-revision-handoff.json";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function clean(value) {
  return String(value ?? "").trim();
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function frontmatter(markdown) {
  if (!markdown.startsWith("---")) return "";
  const end = markdown.indexOf("\n---", 3);
  return end === -1 ? "" : markdown.slice(3, end).trim();
}

function hasDraftTrue(markdown) {
  return /^draft:\s*true\s*$/m.test(frontmatter(markdown));
}

function hasApprovalCandidateFalse(markdown) {
  return /approval_candidate=false/.test(markdown) || /^approval_candidate:\s*false\s*$/m.test(frontmatter(markdown));
}

function requiredRegeneration(afterPath) {
  return [
    {
      order: 1,
      command: "copy_revised_markdown_to_review_draft_or_pass_--draft",
      reason: `Review artifacts must point at the revised markdown hash from ${afterPath}.`,
    },
    {
      order: 2,
      command: "npm run draft:review-artifact",
      reason: "Regenerate the article review summary from the revised draft text.",
    },
    {
      order: 3,
      command: "npm run draft:review-artifact:proof",
      reason: "Capture rendered proof against the revised review artifact.",
    },
    {
      order: 4,
      command: "npm run draft:human-promotion-review-packet",
      reason: "Build a fresh promotion packet tied to the revised draft hash.",
    },
    {
      order: 5,
      command: "npm run draft:human-quality-review-template",
      reason: "Build a fresh human quality scorecard from the revised artifact.",
    },
    {
      order: 6,
      command: "npm run draft:human-quality-review-editor",
      reason: "Render the reviewer desk with the revised draft body, receipts, and anchors.",
    },
    {
      order: 7,
      command: "npm run verify:human-quality-review-template",
      reason: "Reject stale scorecard JSON before a second human review.",
    },
    {
      order: 8,
      command: "npm run verify:human-quality-review-editor",
      reason: "Reject stale reviewer HTML before a second human review.",
    },
  ];
}

function blockedArtifacts() {
  return [
    "draft-review-artifact-summary",
    "human-promotion-review-packet",
    "human-quality-review-template",
    "human-quality-review-editor",
    "human-quality-review-result",
    "human-quality-revision-queue",
    "human-quality-revision-plan",
    "human-quality-revision-editor",
  ];
}

function buildHandoff(plan, result, afterMarkdown, afterPath, resultPath) {
  const afterMarkdownSha256 = sha256(afterMarkdown);
  return {
    schema: "vibecode-human-quality-post-revision-handoff/v1",
    slug: result.slug,
    sourceRevisionResult: resultPath,
    sourceRevisionPlanMarkdownSha256: plan.markdownSha256,
    beforeMarkdownSha256: result.beforeMarkdownSha256,
    afterMarkdownSha256,
    revisedDraftPath: afterPath,
    revisedAt: result.reviser?.revisedAt ?? "",
    promotionAllowed: false,
    draftStillPrivate: true,
    staleReviewPacketsBlocked: true,
    requiredRegeneration: requiredRegeneration(afterPath),
    blockedArtifactsUntilRegenerated: blockedArtifacts(),
    nextGate: "regenerate_review_artifacts_before_second_human_review",
    operatorNote:
      "Do not reuse human review, promotion, or rendered review artifacts created before this afterMarkdownSha256. Regenerate the review packet and run a second human review from the revised draft.",
  };
}

function validate(plan, result, afterMarkdown, handoff) {
  const failures = [];
  const afterMarkdownSha256 = sha256(afterMarkdown);
  const regenerationCommands = asArray(handoff.requiredRegeneration).map((item) => item.command);

  if (plan.schema !== "vibecode-human-quality-revision-plan/v1") {
    failures.push("source revision plan schema must be vibecode-human-quality-revision-plan/v1");
  }
  if (result.schema !== "vibecode-human-quality-revision-result/v1") {
    failures.push("source revision result schema must be vibecode-human-quality-revision-result/v1");
  }
  if (result.slug !== plan.slug) failures.push("source revision result slug must match plan");
  if (result.sourcePlanMarkdownSha256 !== plan.markdownSha256) {
    failures.push("source revision result must reference the plan markdownSha256");
  }
  if (result.afterMarkdownSha256 !== afterMarkdownSha256) {
    failures.push("source revision result afterMarkdownSha256 must match revised markdown");
  }
  if (result.promotionAllowed !== false) failures.push("source revision result must keep promotionAllowed=false");
  if (result.nextGate !== "regenerate_human_review_packet") {
    failures.push("source revision result nextGate must be regenerate_human_review_packet");
  }
  if (!hasDraftTrue(afterMarkdown)) failures.push("revised markdown must preserve draft:true");
  if (!hasApprovalCandidateFalse(afterMarkdown)) {
    failures.push("revised markdown must preserve approval_candidate=false");
  }
  if (handoff.schema !== "vibecode-human-quality-post-revision-handoff/v1") {
    failures.push("post revision handoff schema must be vibecode-human-quality-post-revision-handoff/v1");
  }
  if (handoff.slug !== result.slug) failures.push("post revision handoff slug must match revision result");
  if (handoff.afterMarkdownSha256 !== afterMarkdownSha256) {
    failures.push("post revision handoff afterMarkdownSha256 must match revised markdown");
  }
  if (handoff.promotionAllowed !== false) failures.push("post revision handoff must keep promotionAllowed=false");
  if (handoff.draftStillPrivate !== true) failures.push("post revision handoff must keep draftStillPrivate=true");
  if (handoff.staleReviewPacketsBlocked !== true) {
    failures.push("post revision handoff must block stale review packets");
  }
  if (handoff.nextGate !== "regenerate_review_artifacts_before_second_human_review") {
    failures.push("post revision handoff nextGate must require regenerated review artifacts");
  }
  for (const command of [
    "npm run draft:review-artifact",
    "npm run draft:review-artifact:proof",
    "npm run draft:human-promotion-review-packet",
    "npm run draft:human-quality-review-template",
    "npm run draft:human-quality-review-editor",
    "npm run verify:human-quality-review-template",
    "npm run verify:human-quality-review-editor",
  ]) {
    if (!regenerationCommands.includes(command)) {
      failures.push(`post revision handoff missing required regeneration command: ${command}`);
    }
  }
  if (JSON.stringify(handoff).includes("promote_to_approval_candidate")) {
    failures.push("post revision handoff must not promote to approval candidate");
  }
  if (!asArray(handoff.blockedArtifactsUntilRegenerated).includes("human-quality-review-result")) {
    failures.push("post revision handoff must block stale human-quality-review-result artifacts");
  }
  if (clean(handoff.operatorNote).length < 80) {
    failures.push("post revision handoff operatorNote is too thin");
  }

  return failures;
}

async function main() {
  const planPath = resolve(getArg("--plan") ?? DEFAULT_PLAN);
  const afterPath = resolve(getArg("--after") ?? DEFAULT_AFTER);
  const resultPath = resolve(getArg("--result") ?? DEFAULT_RESULT);
  const output = resolve(getArg("--output") ?? DEFAULT_OUTPUT);
  const check = hasArg("--check");

  const plan = JSON.parse(await readFile(planPath, "utf8"));
  const result = JSON.parse(await readFile(resultPath, "utf8"));
  const afterMarkdown = await readFile(afterPath, "utf8");
  const handoff = buildHandoff(plan, result, afterMarkdown, afterPath, resultPath);
  const text = `${JSON.stringify(handoff, null, 2)}\n`;
  const failures = validate(plan, result, afterMarkdown, handoff);

  if (check) {
    if (!existsSync(output)) {
      failures.push(`post revision handoff missing: ${output}`);
    } else if ((await readFile(output, "utf8")) !== text) {
      failures.push("post revision handoff is stale");
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, text, "utf8");
  }

  process.stdout.write(`human_quality_post_revision_handoff=${output}\n`);
  process.stdout.write(`human_quality_post_revision_handoff_required_regeneration=${handoff.requiredRegeneration.length}\n`);
  process.stdout.write(`human_quality_post_revision_handoff_after_sha256=${handoff.afterMarkdownSha256}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("human_quality_post_revision_handoff=fail\n");
    return 1;
  }
  process.stdout.write("human_quality_post_revision_handoff=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DEFAULT_QUEUE =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-revision-queue.json";
const DEFAULT_DRAFT = "src/data/blog/writing-harness-not-more-prompts.md";
const DEFAULT_OUTPUT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-revision-plan.json";

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

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return markdown;
  const end = markdown.indexOf("\n---", 3);
  return end === -1 ? markdown : markdown.slice(end + 4);
}

function wordCount(value) {
  const words = String(value ?? "").match(/[A-Za-z0-9][A-Za-z0-9'-]*/g);
  return words ? words.length : 0;
}

function snippet(value, max = 320) {
  const text = clean(value).replace(/\s+/g, " ");
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function anchorSearchText(anchor) {
  const text = clean(anchor?.text);
  return text.endsWith("...") ? text.slice(0, -3).trim() : text;
}

function draftIncludesAnchor(markdown, anchor) {
  const searchText = anchorSearchText(anchor);
  return searchText.length > 0 && markdown.includes(searchText);
}

function findSectionForAnchor(markdown, anchor) {
  const body = stripFrontmatter(markdown);
  const anchorText = anchorSearchText(anchor);
  if (!anchorText) return "";
  const index = body.indexOf(anchorText);
  if (index === -1) return "";
  const before = body.slice(0, index);
  const headings = Array.from(before.matchAll(/^##\s+(.+)$/gm));
  return headings.length ? headings.at(-1)[1].trim() : "Opening";
}

function locateAnchor(markdown, anchor) {
  if (!anchor?.id) return { found: false, section: "", quote: "" };
  if (anchor.kind === "receipt" || anchor.kind === "image") {
    return {
      found: draftIncludesAnchor(markdown, anchor),
      section: anchor.kind === "receipt" ? "Packet Receipt" : "Images",
      quote: anchor.text,
    };
  }
  const section = findSectionForAnchor(markdown, anchor);
  return {
    found: section.length > 0,
    section,
    quote: anchor.text,
  };
}

function planItem(markdown, item, index) {
  const anchorLocation = locateAnchor(markdown, item.evidenceAnchor);
  return {
    id: `revision-plan-${String(index + 1).padStart(2, "0")}-${item.scorecardLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`,
    sourceQueueItem: item.id,
    scorecardLabel: item.scorecardLabel,
    evidenceAnchor: item.evidenceAnchor,
    anchorFoundInDraft: anchorLocation.found,
    targetSection: anchorLocation.section,
    targetQuote: snippet(anchorLocation.quote),
    reviewerProblem: clean(item.problem),
    requiredChange: clean(item.requiredChange),
    rewriteBrief: [
      `Repair the "${item.scorecardLabel}" rejection at the anchored draft evidence.`,
      "Do not make a broad style pass.",
      "Change the smallest body area that resolves the anchored rejection.",
      "Preserve draft:true and approval_candidate=false until a future human review accepts the row.",
    ],
    acceptanceCheck: clean(item.acceptanceCheck),
  };
}

function buildPlan(queue, markdown, draftPath) {
  const items = asArray(queue.items).map((item, index) => planItem(markdown, item, index));
  return {
    schema: "vibecode-human-quality-revision-plan/v1",
    slug: queue.slug,
    markdownSha256: queue.markdownSha256,
    sourceQueueStatus: queue.queueStatus,
    sourceRejectCount: queue.rejectCount,
    draftPath,
    draftWordCount: wordCount(stripFrontmatter(markdown)),
    promotionAllowed: false,
    planStatus: items.length > 0 ? "ready_for_body_revision" : "no_body_revision_required",
    items,
    nextGate:
      items.length > 0
        ? "revise_body_from_anchor_plan_then_regenerate_human_review_packet"
        : "prepare_rendered_candidate_and_image_contract",
  };
}

function validatePlan(queue, markdown, plan) {
  const failures = [];
  const queueItems = asArray(queue.items);
  const planItems = asArray(plan.items);

  if (plan.schema !== "vibecode-human-quality-revision-plan/v1") {
    failures.push("revision plan schema must be vibecode-human-quality-revision-plan/v1");
  }
  if (plan.slug !== queue.slug) failures.push("revision plan slug must match queue");
  if (plan.markdownSha256 !== queue.markdownSha256) failures.push("revision plan markdownSha256 must match queue");
  if (plan.sourceRejectCount !== queue.rejectCount) failures.push("revision plan reject count must match queue");
  if (planItems.length !== queueItems.length) failures.push("revision plan items must match queue items");
  if (plan.promotionAllowed !== false) failures.push("revision plan must keep promotionAllowed=false");
  if (queueItems.length > 0 && plan.planStatus !== "ready_for_body_revision") {
    failures.push("revision plan with queue items must be ready_for_body_revision");
  }

  for (const queueItem of queueItems) {
    const item = planItems.find((candidate) => candidate?.sourceQueueItem === queueItem.id);
    if (!item) {
      failures.push(`revision plan missing item for queue item: ${queueItem.id}`);
      continue;
    }
    if (!item.evidenceAnchor?.id) failures.push(`revision plan ${item.id} missing evidenceAnchor`);
    if (item.anchorFoundInDraft !== true) failures.push(`revision plan ${item.id} anchor not found in draft`);
    if (clean(item.targetQuote).length < 20) failures.push(`revision plan ${item.id} targetQuote is too thin`);
    if (clean(item.reviewerProblem).length < 40) failures.push(`revision plan ${item.id} reviewerProblem is too thin`);
    if (clean(item.requiredChange).length < 20) failures.push(`revision plan ${item.id} requiredChange is too thin`);
    if (!asArray(item.rewriteBrief).some((line) => clean(line).includes("smallest body area"))) {
      failures.push(`revision plan ${item.id} must constrain the rewrite scope`);
    }
    if (!draftIncludesAnchor(markdown, item.evidenceAnchor)) {
      failures.push(`revision plan ${item.id} evidence anchor text is not in draft`);
    }
  }

  return failures;
}

async function main() {
  const queuePath = resolve(getArg("--queue") ?? DEFAULT_QUEUE);
  const draftPath = resolve(getArg("--draft") ?? DEFAULT_DRAFT);
  const output = resolve(getArg("--output") ?? DEFAULT_OUTPUT);
  const check = hasArg("--check");
  const queue = JSON.parse(await readFile(queuePath, "utf8"));
  const markdown = await readFile(draftPath, "utf8");
  const plan = buildPlan(queue, markdown, draftPath);
  const text = `${JSON.stringify(plan, null, 2)}\n`;
  const failures = validatePlan(queue, markdown, plan);

  if (check) {
    if (!existsSync(output)) {
      failures.push(`human quality revision plan missing: ${output}`);
    } else if ((await readFile(output, "utf8")) !== text) {
      failures.push("human quality revision plan is stale");
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, text, "utf8");
  }

  process.stdout.write(`human_quality_revision_plan=${output}\n`);
  process.stdout.write(`human_quality_revision_plan_status=${plan.planStatus}\n`);
  process.stdout.write(`human_quality_revision_plan_items=${plan.items.length}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("human_quality_revision_plan=fail\n");
    return 1;
  }
  process.stdout.write("human_quality_revision_plan=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

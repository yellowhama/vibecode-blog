import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const DEFAULT_PLAN =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-revision-plan.json";
const DEFAULT_BEFORE = "src/data/blog/writing-harness-not-more-prompts.md";
const DEFAULT_AFTER =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-revised-candidate.md";
const DEFAULT_RESULT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-revision-result.json";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clean(value) {
  return String(value ?? "").trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return markdown;
  const end = markdown.indexOf("\n---", 3);
  return end === -1 ? markdown : markdown.slice(end + 4);
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

function headingName(line) {
  const match = /^##\s+(.+?)\s*$/.exec(line);
  return match ? match[1].trim() : null;
}

function collectSections(markdown) {
  const body = stripFrontmatter(markdown);
  const sections = new Map();
  let current = "Opening";
  let buffer = [];

  function flush() {
    sections.set(current, buffer.join("\n").trim());
  }

  for (const line of body.split(/\r?\n/)) {
    const heading = headingName(line);
    if (heading) {
      flush();
      current = heading;
      buffer = [line];
    } else {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function changedSections(beforeMarkdown, afterMarkdown) {
  const before = collectSections(beforeMarkdown);
  const after = collectSections(afterMarkdown);
  const names = new Set([...before.keys(), ...after.keys()]);
  return [...names].filter((name) => clean(before.get(name)) !== clean(after.get(name)));
}

function includesQuote(markdown, quote) {
  const text = clean(quote).replace(/\s+/g, " ");
  if (!text) return false;
  const haystack = markdown.replace(/\s+/g, " ");
  const search = text.endsWith("...") ? text.slice(0, -3).trim() : text;
  return search.length > 0 && haystack.includes(search);
}

function validate(plan, beforeMarkdown, afterMarkdown, result) {
  const failures = [];
  const planItems = asArray(plan.items);
  const resultItems = asArray(result.items);
  const changed = changedSections(beforeMarkdown, afterMarkdown);
  const allowedSections = new Set(planItems.map((item) => item.targetSection));

  if (result.schema !== "vibecode-human-quality-revision-result/v1") {
    failures.push("revision result schema must be vibecode-human-quality-revision-result/v1");
  }
  if (result.slug !== plan.slug) failures.push("revision result slug must match plan");
  if (result.sourcePlanMarkdownSha256 !== plan.markdownSha256) {
    failures.push("revision result sourcePlanMarkdownSha256 must match plan markdownSha256");
  }
  if (result.beforeMarkdownSha256 !== sha256(beforeMarkdown)) {
    failures.push("revision result beforeMarkdownSha256 must match before markdown");
  }
  if (result.afterMarkdownSha256 !== sha256(afterMarkdown)) {
    failures.push("revision result afterMarkdownSha256 must match after markdown");
  }
  if (result.promotionAllowed !== false) failures.push("revision result must keep promotionAllowed=false");
  if (result.nextGate !== "regenerate_human_review_packet") {
    failures.push("revision result nextGate must be regenerate_human_review_packet");
  }
  if (clean(result.reviser?.name).length < 2) failures.push("revision result reviser.name is required");
  if (!result.reviser?.revisedAt || Number.isNaN(Date.parse(result.reviser.revisedAt))) {
    failures.push("revision result reviser.revisedAt must be an ISO timestamp");
  }
  if (!hasDraftTrue(afterMarkdown)) failures.push("revised markdown must preserve draft:true");
  if (!hasApprovalCandidateFalse(afterMarkdown)) {
    failures.push("revised markdown must preserve approval_candidate=false");
  }
  if (beforeMarkdown === afterMarkdown) failures.push("revision result after markdown must differ from before markdown");
  if (resultItems.length !== planItems.length) failures.push("revision result items must match plan items");

  for (const section of changed) {
    if (!allowedSections.has(section)) {
      failures.push(`revision changed non-plan section: ${section}`);
    }
  }

  for (const planItem of planItems) {
    const item = resultItems.find((candidate) => candidate?.planItemId === planItem.id);
    if (!item) {
      failures.push(`revision result missing item for plan item: ${planItem.id}`);
      continue;
    }
    if (item.targetSection !== planItem.targetSection) {
      failures.push(`revision result ${item.planItemId} targetSection must match plan`);
    }
    if (item.broadRewriteDenied !== true) {
      failures.push(`revision result ${item.planItemId} must set broadRewriteDenied=true`);
    }
    if (!includesQuote(beforeMarkdown, item.beforeQuote || planItem.targetQuote)) {
      failures.push(`revision result ${item.planItemId} beforeQuote not found in before markdown`);
    }
    if (!includesQuote(afterMarkdown, item.afterQuote)) {
      failures.push(`revision result ${item.planItemId} afterQuote not found in after markdown`);
    }
    if (clean(item.changeSummary).length < 40) {
      failures.push(`revision result ${item.planItemId} changeSummary is too thin`);
    }
    if (clean(item.acceptanceEvidence).length < 40) {
      failures.push(`revision result ${item.planItemId} acceptanceEvidence is too thin`);
    }
    if (!changed.includes(planItem.targetSection)) {
      failures.push(`revision result ${item.planItemId} target section was not changed`);
    }
  }

  return { failures, changed };
}

async function main() {
  const planPath = resolve(getArg("--plan") ?? DEFAULT_PLAN);
  const beforePath = resolve(getArg("--before") ?? DEFAULT_BEFORE);
  const afterPath = resolve(getArg("--after") ?? DEFAULT_AFTER);
  const resultPath = resolve(getArg("--result") ?? DEFAULT_RESULT);
  const plan = JSON.parse(await readFile(planPath, "utf8"));
  const beforeMarkdown = await readFile(beforePath, "utf8");
  const afterMarkdown = await readFile(afterPath, "utf8");
  const result = JSON.parse(await readFile(resultPath, "utf8"));
  const { failures, changed } = validate(plan, beforeMarkdown, afterMarkdown, result);

  process.stdout.write(`human_quality_revision_result=${resultPath}\n`);
  process.stdout.write(`human_quality_revision_result_items=${asArray(result.items).length}\n`);
  process.stdout.write(`human_quality_revision_changed_sections=${changed.join(",")}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("human_quality_revision_result=fail\n");
    return 1;
  }
  process.stdout.write("human_quality_revision_result=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

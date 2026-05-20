import { existsSync } from "node:fs";
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

function defaultDraftPath(summary) {
  return `src/data/blog/${summary.slug}.md`;
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

function cleanParagraph(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/^#+\s*/, "")
    .trim();
}

function collectMarkdownParagraphs(body) {
  const paragraphs = [];
  let inFence = false;
  let buffer = [];
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      inFence = !inFence;
      if (buffer.length) {
        paragraphs.push(cleanParagraph(buffer.join(" ")));
        buffer = [];
      }
      continue;
    }
    if (inFence || !line || line.startsWith("|") || line.startsWith("!") || line.startsWith("- ")) {
      if (buffer.length) {
        paragraphs.push(cleanParagraph(buffer.join(" ")));
        buffer = [];
      }
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      if (buffer.length) {
        paragraphs.push(cleanParagraph(buffer.join(" ")));
        buffer = [];
      }
      continue;
    }
    buffer.push(line);
  }
  if (buffer.length) paragraphs.push(cleanParagraph(buffer.join(" ")));
  return paragraphs.filter((paragraph) => paragraph.length >= 90);
}

function shortText(value, max = 150) {
  const text = cleanParagraph(value);
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function anchor(id, kind, label, text) {
  return { id, kind, label, text: shortText(text, 260) };
}

function buildEvidenceAnchors(markdown) {
  const body = stripFrontmatter(markdown);
  const paragraphs = collectMarkdownParagraphs(body);
  const opening = paragraphs.slice(0, 3);
  const receiptLines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) =>
      /^(publication_state|approval_required|approval_candidate|editorial_decision|candidate_blockers|real_failed_draft_evidence|critique|rendered_screenshot|rendered_summary|source_workflow_slug)=/.test(line),
    );
  const images = Array.from(body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)).map((match) => ({
    alt: match[1].trim(),
    src: match[2].trim(),
  }));
  const selected = [];
  for (const paragraph of paragraphs) {
    if (
      selected.length < 8 &&
      /failed|review|reader|evidence|artifact|AutoAgent|red-pen|paragraph|harness/i.test(paragraph)
    ) {
      selected.push(paragraph);
    }
  }
  for (const paragraph of opening) {
    if (!selected.includes(paragraph) && selected.length < 8) selected.unshift(paragraph);
  }

  const anchors = [];
  opening.forEach((text, index) => anchors.push(anchor(`opening-${index + 1}`, "opening", `Opening excerpt ${index + 1}`, text)));
  receiptLines.forEach((text, index) => anchors.push(anchor(`receipt-${index + 1}`, "receipt", `Receipt line ${index + 1}`, text)));
  images.forEach((image, index) => anchors.push(anchor(`image-${index + 1}`, "image", `Image ${index + 1}`, `${image.src} ${image.alt}`)));
  selected.slice(0, 8).forEach((text, index) => anchors.push(anchor(`passage-${index + 1}`, "passage", `Passage to inspect ${index + 1}`, text)));
  return {
    anchors,
    wordCount: wordCount(body),
  };
}

async function main() {
  const summaryPath = resolve(getArg("--summary") ?? DEFAULT_SUMMARY);
  const reviewPath = resolve(getArg("--review") ?? DEFAULT_REVIEW);
  const summary = JSON.parse(await readFile(summaryPath, "utf8"));
  const review = JSON.parse(await readFile(reviewPath, "utf8"));
  const resolvedDraftPath = resolve(getArg("--draft") ?? review.sourceDraft?.path ?? defaultDraftPath(summary));
  const draftExists = existsSync(resolvedDraftPath);
  const draftContext = draftExists
    ? buildEvidenceAnchors(await readFile(resolvedDraftPath, "utf8"))
    : { anchors: [], wordCount: 0 };
  const anchorIds = new Set(draftContext.anchors.map((anchorItem) => anchorItem.id));
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
  if (!draftExists) {
    failures.push(`review source draft is missing: ${resolvedDraftPath}`);
  }
  if (review.sourceDraft?.loaded !== true) failures.push("review.sourceDraft.loaded must be true");
  if (resolve(review.sourceDraft?.path ?? "") !== resolvedDraftPath) {
    failures.push("review.sourceDraft.path must match the verified draft path");
  }
  if (review.sourceDraft?.wordCount !== draftContext.wordCount) {
    failures.push("review.sourceDraft.wordCount must match the verified draft word count");
  }
  if (draftContext.anchors.length < 6) {
    failures.push("verified draft must expose at least six evidence anchors");
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
    if (!row.evidenceAnchor?.id || !anchorIds.has(row.evidenceAnchor.id)) {
      failures.push(`review.scorecard.${expected.label}.evidenceAnchor must reference a current draft anchor`);
    }
    if (row.evidenceAnchor?.id && anchorIds.has(row.evidenceAnchor.id)) {
      const currentAnchor = draftContext.anchors.find((item) => item.id === row.evidenceAnchor.id);
      if (
        row.evidenceAnchor.kind !== currentAnchor.kind ||
        row.evidenceAnchor.label !== currentAnchor.label ||
        row.evidenceAnchor.text !== currentAnchor.text
      ) {
        failures.push(`review.scorecard.${expected.label}.evidenceAnchor is stale`);
      }
    }
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
  process.stdout.write(`human_quality_review_evidence_anchors=${draftContext.anchors.length}\n`);
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

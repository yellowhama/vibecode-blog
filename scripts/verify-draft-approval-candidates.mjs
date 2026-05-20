import { access, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { basename, join } from "node:path";
import sharp from "sharp";

const DEFAULT_BLOG_DIR = "src/data/blog";
const DEFAULT_DECISIONS_PATH = "src/data/draft-editorial-decisions.json";
const MIN_DRAFT_WORDS = 800;
const REQUIRED_FALSE_BLOCKERS = [
  "human_critique",
  "rendered_candidate",
  "hash_approval",
];

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function parseMarkdown(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: text };
  return { frontmatter: match[1], body: match[2] };
}

function getFrontmatterValue(frontmatter, name) {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
  if (!match) return "";
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function isDraft(frontmatter) {
  return /^draft:\s*true\s*$/m.test(frontmatter);
}

function wordCount(text) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/[#*_>`|~-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function bodyImages(body) {
  return [...body.matchAll(/!\[[^\]]+]\(([^)]+)\)/g)].map((match) => match[1].trim());
}

function publicImagePathToFile(path) {
  const cleanPath = path.split(/[?#]/)[0];
  if (!cleanPath.startsWith("/images/")) return "";
  return join("public", cleanPath.slice(1));
}

function receiptValue(body, name) {
  const match = body.match(new RegExp(`^${name}=([^\\r\\n]+)$`, "m"));
  return match?.[1]?.trim() ?? "";
}

async function fileExists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function validateImage(slug, imagePath, failures) {
  if (imagePath !== `/images/posts/${slug}.png`) {
    failures.push(`${slug}.md: draft visual must use slug-specific image path /images/posts/${slug}.png`);
    return;
  }

  const imageFile = publicImagePathToFile(imagePath);
  if (!imageFile || !(await fileExists(imageFile))) {
    failures.push(`${slug}.md: draft visual file is missing: ${imagePath}`);
    return;
  }

  const metadata = await sharp(imageFile).metadata();
  if (metadata.width !== 1200 || metadata.height !== 630) {
    failures.push(`${slug}.md: draft visual must be 1200x630, got ${metadata.width}x${metadata.height}`);
  }
}

async function validateDraft(file, text) {
  const failures = [];
  const { frontmatter, body } = parseMarkdown(text);
  const slug = basename(file, ".md");
  const workflow = getFrontmatterValue(frontmatter, "workflow");
  const images = bodyImages(body);
  const approvalCandidate = receiptValue(body, "approval_candidate");
  const publicationState = receiptValue(body, "publication_state");
  const approvalRequired = receiptValue(body, "approval_required");
  const blockers = receiptValue(body, "candidate_blockers")
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!isDraft(frontmatter) || workflow !== "packet") {
    return { slug, skipped: true, failures };
  }

  if (publicationState !== "draft_only") {
    failures.push(`${file}: packet draft must declare publication_state=draft_only`);
  }
  if (approvalRequired !== "true") {
    failures.push(`${file}: packet draft must declare approval_required=true`);
  }
  if (!["true", "false"].includes(approvalCandidate)) {
    failures.push(`${file}: packet draft must declare approval_candidate=true or approval_candidate=false`);
  }
  if (/\bTODO\b|fill this in|lorem ipsum/i.test(body)) {
    failures.push(`${file}: draft candidate path cannot contain TODO or placeholder text`);
  }

  if (images.length !== 1) {
    failures.push(`${file}: draft approval path expects exactly one body visual, got ${images.length}`);
  } else {
    await validateImage(slug, images[0], failures);
  }

  if (!/^##\s+Approval Candidate Verdict\s*$/im.test(body)) {
    failures.push(`${file}: missing \"Approval Candidate Verdict\" section`);
  }
  if (!/^##\s+Draft Risk\s*$/im.test(body)) {
    failures.push(`${file}: missing \"Draft Risk\" section`);
  }

  if (wordCount(body) < MIN_DRAFT_WORDS) {
    failures.push(`${file}: draft is too thin for approval-candidate review (${wordCount(body)} words)`);
  }

  if (approvalCandidate === "false") {
    for (const required of REQUIRED_FALSE_BLOCKERS) {
      if (!blockers.includes(required)) {
        failures.push(`${file}: approval_candidate=false must name blocker ${required}`);
      }
    }
  }

  if (approvalCandidate === "true") {
    if (!/^##\s+Publication Evidence\s*$/im.test(body)) {
      failures.push(`${file}: approval_candidate=true requires a Publication Evidence section`);
    }
    if (!/rendered_page_gate=pass|publication_approval_gate=pass|contentSha256|rendered screenshot/i.test(body)) {
      failures.push(`${file}: approval_candidate=true must cite rendered/hash/approval evidence`);
    }
    if (blockers.length > 0) {
      failures.push(`${file}: approval_candidate=true cannot keep candidate_blockers`);
    }
  }

  return { slug, skipped: false, failures };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function validateDecision({ file, slug, body, approvalCandidate, blockers }, decision, failures) {
  if (!decision) {
    failures.push(`${file}: missing draft editorial decision record`);
    return;
  }

  if (!["keep_internal_example", "promote_to_approval_candidate"].includes(decision.decision)) {
    failures.push(`${file}: editorial decision must be keep_internal_example or promote_to_approval_candidate`);
  }
  if (!decision.decidedAt || Number.isNaN(Date.parse(decision.decidedAt))) {
    failures.push(`${file}: editorial decision decidedAt must be an ISO timestamp`);
  }
  if (!["editorial-system", "human"].includes(decision.reviewerType)) {
    failures.push(`${file}: editorial decision reviewerType must be editorial-system or human`);
  }
  if (!decision.rationale || String(decision.rationale).trim().length < 80) {
    failures.push(`${file}: editorial decision rationale is too thin`);
  }
  if (asArray(decision.requiredNextActions).length < 2) {
    failures.push(`${file}: editorial decision must include requiredNextActions`);
  }
  if (typeof decision.approvalCandidate !== "boolean") {
    failures.push(`${file}: editorial decision approvalCandidate must be boolean`);
  } else if (decision.approvalCandidate !== (approvalCandidate === "true")) {
    failures.push(`${file}: editorial decision approvalCandidate must match body receipt`);
  }
  if (asArray(decision.evidence).length < 2) {
    failures.push(`${file}: editorial decision must cite at least two evidence artifacts`);
  }

  if (decision.decision === "keep_internal_example" && approvalCandidate !== "false") {
    failures.push(`${file}: keep_internal_example requires approval_candidate=false`);
  }
  if (decision.decision === "promote_to_approval_candidate") {
    if (approvalCandidate !== "true") {
      failures.push(`${file}: promote_to_approval_candidate requires approval_candidate=true`);
    }
    if (decision.reviewerType !== "human") {
      failures.push(`${file}: promotion to approval candidate requires a human editorial reviewer`);
    }
  }

  const decisionReceipt = receiptValue(body, "editorial_decision");
  if (decisionReceipt !== decision.decision) {
    failures.push(`${file}: body editorial_decision receipt must match decision manifest`);
  }
  const decisionRef = receiptValue(body, "editorial_decision_ref");
  if (!decisionRef.endsWith(`#${slug}`)) {
    failures.push(`${file}: body editorial_decision_ref must point at the decision slug`);
  }

  const decisionBlockers = asArray(decision.candidateBlockers);
  for (const blocker of blockers) {
    if (!decisionBlockers.includes(blocker)) {
      failures.push(`${file}: editorial decision missing candidate blocker ${blocker}`);
    }
  }
}

async function main() {
  const blogDir = getArg("--blog-dir") ?? DEFAULT_BLOG_DIR;
  const decisionsPath = getArg("--decisions") ?? DEFAULT_DECISIONS_PATH;
  if (!(await fileExists(blogDir))) {
    throw new Error(`blog directory not found: ${blogDir}`);
  }
  if (!(await fileExists(decisionsPath))) {
    throw new Error(`draft editorial decisions file not found: ${decisionsPath}`);
  }

  const decisionsDocument = JSON.parse(await readFile(decisionsPath, "utf8"));
  const decisions = asArray(decisionsDocument.decisions);
  const decisionsBySlug = new Map(decisions.map((decision) => [decision.slug, decision]));
  const decisionSlugs = decisions.map((decision) => decision.slug).filter(Boolean);

  const files = (await readdir(blogDir))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const results = [];
  const failures = [];

  if (decisionsDocument.policy?.requiredForPacketDrafts !== true) {
    failures.push("draft editorial decisions policy must declare requiredForPacketDrafts=true");
  }
  if (decisionsBySlug.size !== decisionSlugs.length) {
    failures.push("draft editorial decisions file contains duplicate or missing slugs");
  }

  for (const file of files) {
    const text = await readFile(join(blogDir, file), "utf8");
    const result = await validateDraft(file, text);
    if (!result.skipped) {
      const { frontmatter, body } = parseMarkdown(text);
      validateDecision(
        {
          file,
          slug: result.slug,
          body,
          approvalCandidate: receiptValue(body, "approval_candidate"),
          blockers: receiptValue(body, "candidate_blockers")
            .split(/[,;]/)
            .map((item) => item.trim())
            .filter(Boolean),
          frontmatter,
        },
        decisionsBySlug.get(result.slug),
        failures,
      );
    }
    results.push(result);
    failures.push(...result.failures);
  }

  for (const decision of decisionsBySlug.values()) {
    if (!results.some((result) => result.slug === decision.slug && !result.skipped)) {
      failures.push(`draft editorial decision has stale or non-packet-draft slug: ${decision.slug}`);
    }
  }

  const checked = results.filter((result) => !result.skipped).length;
  const skipped = results.filter((result) => result.skipped).length;
  process.stdout.write(`draft_approval_candidates_checked=${checked}\n`);
  process.stdout.write(`draft_approval_candidates_skipped=${skipped}\n`);
  process.stdout.write(`draft_editorial_decisions_checked=${decisions.length}\n`);

  if (failures.length > 0) {
    process.stderr.write("Draft approval candidate gate failed.\n");
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("draft_approval_candidate_gate=fail\n");
    return 1;
  }

  process.stdout.write("draft_approval_candidate_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

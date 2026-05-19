import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const BLOG_DIR = "src/data/blog";
const APPROVALS_PATH = "src/data/publication-approvals.json";
const IMAGE_CONTRACT_PATH = "src/data/post-image-contracts.json";
const SCREENSHOT_ROOT =
  process.env.VIBECODE_RENDERED_AUDIT_DIR ||
  process.env.VIBECODE_TEST_TEMP_DIR ||
  process.env.PROJECT_TEST_TEMP_DIR ||
  process.env.TEST_TEMP_DIR ||
  (process.platform === "win32"
    ? "F:\\Aisaak\\CompanyArtifacts\\vibecode-rendered-audit"
    : join(tmpdir(), "vibecode-rendered-audit"));
const RENDERED_SUMMARY_PATH = resolve(SCREENSHOT_ROOT, "latest", "summary.json");

const REQUIRED_GATES = [
  "public_page_review_gate",
  "post_image_contract_gate",
  "rendered_page_gate",
  "site_quality_gate",
];
const AGENT_REVIEWER_PATTERN = /\b(codex|agent|assistant|claude|gpt|llm|bot)\b/i;

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

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

async function getPublishedPosts() {
  const files = (await readdir(BLOG_DIR))
    .filter(file => file.endsWith(".md"))
    .sort();

  const posts = [];
  for (const file of files) {
    const path = join(BLOG_DIR, file);
    const text = await readFile(path, "utf8");
    const { frontmatter } = parseMarkdown(text);
    if (isDraft(frontmatter)) continue;
    posts.push({
      file,
      path,
      slug: file.replace(/\.md$/, ""),
      series: getFrontmatterValue(frontmatter, "series"),
      workflow: getFrontmatterValue(frontmatter, "workflow"),
      ogImage: getFrontmatterValue(frontmatter, "ogImage"),
      contentSha256: sha256(text),
    });
  }
  return posts;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

async function main() {
  const [approvalsDocument, imageContracts, renderedSummary, posts] = await Promise.all([
    readFile(APPROVALS_PATH, "utf8").then(JSON.parse),
    readFile(IMAGE_CONTRACT_PATH, "utf8").then(JSON.parse),
    readFile(RENDERED_SUMMARY_PATH, "utf8").then(JSON.parse),
    getPublishedPosts(),
  ]);

  const approvals = asArray(approvalsDocument.approvals);
  const approvalsBySlug = new Map(approvals.map(approval => [approval.slug, approval]));
  const imageBySlug = new Map(imageContracts.map(contract => [contract.slug, contract]));
  const renderedResults = asArray(renderedSummary.results);
  const renderedBySlug = new Map();
  for (const result of renderedResults) {
    const list = renderedBySlug.get(result.slug) || [];
    list.push(result);
    renderedBySlug.set(result.slug, list);
  }

  const failures = [];
  const seenSlugs = new Set();

  for (const post of posts) {
    seenSlugs.add(post.slug);
    const approval = approvalsBySlug.get(post.slug);
    const imageContract = imageBySlug.get(post.slug);
    const rendered = renderedBySlug.get(post.slug) || [];

    if (!approval) {
      failures.push(`${post.file}: missing human publication approval record`);
      continue;
    }

    if (approval.status !== "approved") {
      failures.push(`${post.file}: approval status must be "approved"`);
    }
    if (approval.decision !== approvalsDocument.approval_policy?.required_decision) {
      failures.push(`${post.file}: approval decision must be "${approvalsDocument.approval_policy?.required_decision}"`);
    }
    if (approval.reviewerType !== "human") {
      failures.push(`${post.file}: reviewerType must be "human"`);
    }
    if (!approval.approvedBy || AGENT_REVIEWER_PATTERN.test(approval.approvedBy)) {
      failures.push(`${post.file}: approvedBy must name a human/operator reviewer, not an agent`);
    }
    if (!approval.approvedAt || Number.isNaN(Date.parse(approval.approvedAt))) {
      failures.push(`${post.file}: approvedAt must be an ISO timestamp`);
    }
    if (!approval.approvalRef || approval.approvalRef.length < 12) {
      failures.push(`${post.file}: approvalRef is missing or too vague`);
    }
    if (!approval.approvalScope || !approval.approvalScope.includes("current_public_baseline")) {
      failures.push(`${post.file}: approvalScope must bind the current public baseline`);
    }
    if (approval.contentSha256 !== post.contentSha256) {
      failures.push(`${post.file}: approval contentSha256 does not match current Markdown`);
    }

    const expectedWorkflow = post.series === "About" ? "about-exempt" : "packet";
    if (approval.sourceWorkflow !== expectedWorkflow) {
      failures.push(`${post.file}: approval sourceWorkflow must be "${expectedWorkflow}"`);
    }
    if (post.series !== "About" && post.workflow !== "packet") {
      failures.push(`${post.file}: non-About post must have workflow: "packet" before approval`);
    }

    if (!imageContract) {
      failures.push(`${post.file}: missing image contract`);
    } else if (approval.image !== imageContract.image || post.ogImage !== imageContract.image) {
      failures.push(`${post.file}: approval image, ogImage, and image contract must match`);
    }

    const requiredEvidence = new Set(asArray(approval.requiredEvidence));
    const gates = new Set(REQUIRED_GATES);
    if (post.series !== "About") gates.add("source_workflow_gate");
    for (const gate of gates) {
      if (!requiredEvidence.has(gate)) {
        failures.push(`${post.file}: approval missing required evidence gate "${gate}"`);
      }
    }

    const renderedViewports = new Set(rendered.map(result => result.viewport));
    if (!renderedViewports.has("desktop") || !renderedViewports.has("mobile")) {
      failures.push(`${post.file}: rendered approval evidence must include desktop and mobile screenshots`);
    }
    for (const result of rendered) {
      if (asArray(result.failures).length > 0) {
        failures.push(`${post.file}: rendered ${result.viewport} audit has failures`);
      }
      if (!result.audit?.expectedImageVisible) {
        failures.push(`${post.file}: rendered ${result.viewport} audit does not prove expected image visibility`);
      }
      if (!result.screenshotPath || !existsSync(result.screenshotPath)) {
        failures.push(`${post.file}: rendered ${result.viewport} screenshot file is missing`);
      }
    }
  }

  for (const approval of approvals) {
    if (!seenSlugs.has(approval.slug)) {
      failures.push(`approval manifest has stale slug: ${approval.slug}`);
    }
  }

  process.stdout.write(`publication_approval_posts_checked=${posts.length}\n`);
  process.stdout.write(`publication_approval_records_checked=${approvals.length}\n`);
  process.stdout.write(`publication_approval_rendered_summary=${RENDERED_SUMMARY_PATH}\n`);

  if (failures.length > 0) {
    process.stderr.write("Publication approval gate failed.\n");
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("publication_approval_gate=fail\n");
    return 1;
  }

  process.stdout.write("publication_approval_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

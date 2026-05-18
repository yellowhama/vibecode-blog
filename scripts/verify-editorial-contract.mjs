import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const BLOG_DIR = "src/data/blog";

const CONTRACT_ANCHOR =
  /\b(technical contract|contract|boundary|deterministic|local-first|audit trail|control surface|policy|evidence|source-backed|verified|warden)\b/i;

const PROOF_ROUTE =
  /github\.com\/yellowhama|warden|field log|technical contract|install\.sh|source-backed|evidence|verified/i;

const EVIDENCE_ANCHOR =
  /references:\s*(?:\r?\n\s*-|$)|https?:\/\/|```|`[^`]+`|verified fix|real failure|source-backed|audit|advisory|log|command|config|screenshot|diff|evidence/i;

const HANGUL = /[\u3131-\u318e\uac00-\ud7a3]/;
const MARKDOWN_IMAGE = /!\[[^\]]+\]\(([^)]+)\)/g;

function parseMarkdown(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: "", body: text };
  }
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

function publicImagePathToFile(path) {
  const cleanPath = path.split(/[?#]/)[0];
  if (!cleanPath.startsWith("/images/")) return null;
  return join("public", cleanPath.slice(1));
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function checkPost(file, text) {
  const { frontmatter, body } = parseMarkdown(text);
  const title = getFrontmatterValue(frontmatter, "title");
  const description = getFrontmatterValue(frontmatter, "description");
  const lang = getFrontmatterValue(frontmatter, "lang");
  const ogImage = getFrontmatterValue(frontmatter, "ogImage");
  const combined = `${frontmatter}\n${body}`;
  const failures = [];

  if (!title) failures.push("missing title");
  if (!description) failures.push("missing description");
  if (!CONTRACT_ANCHOR.test(combined)) {
    failures.push("missing technical-contract, boundary, evidence, Warden, or source-backed anchor");
  }
  if (!PROOF_ROUTE.test(combined)) {
    failures.push("missing natural route to Warden, GitHub, Field Log, install, source-backed evidence, or technical-contract proof");
  }
  if (!EVIDENCE_ANCHOR.test(combined)) {
    failures.push("missing source/evidence anchor such as references, URL, command, config, audit, log, or code block");
  }
  if (HANGUL.test(combined)) {
    failures.push("public posts must be English; Hangul text is not allowed");
  }
  if (lang && lang.toLowerCase() !== "en") {
    failures.push(`public posts must use lang "en" when lang is set, got "${lang}"`);
  }
  if (!ogImage) {
    failures.push("missing ogImage");
  } else if (ogImage.startsWith("http://") || ogImage.startsWith("https://")) {
    failures.push("ogImage must be a local /images/... asset");
  } else {
    const ogImageFile = publicImagePathToFile(ogImage);
    if (!ogImageFile) {
      failures.push(`ogImage must use a public image path starting with /images/: ${ogImage}`);
    } else if (!(await exists(ogImageFile))) {
      failures.push(`ogImage file does not exist: ${ogImage}`);
    }
  }

  const markdownImages = [...body.matchAll(MARKDOWN_IMAGE)].map((match) => match[1].trim());
  if (markdownImages.length === 0) {
    failures.push("missing in-body markdown image");
  }
  for (const imagePath of markdownImages) {
    if (imagePath.includes("public/images") || imagePath.startsWith("../")) {
      failures.push(`markdown image must use browser path /images/..., not source path: ${imagePath}`);
      continue;
    }
    const imageFile = publicImagePathToFile(imagePath);
    if (!imageFile) {
      failures.push(`markdown image must use a local /images/... asset: ${imagePath}`);
    } else if (!(await exists(imageFile))) {
      failures.push(`markdown image file does not exist: ${imagePath}`);
    }
  }

  return {
    file,
    title,
    failures,
    draft: isDraft(frontmatter),
  };
}

async function main() {
  const files = (await readdir(BLOG_DIR))
    .filter((file) => file.endsWith(".md"))
    .sort();

  const results = [];
  for (const file of files) {
    const text = await readFile(join(BLOG_DIR, file), "utf8");
    const result = await checkPost(file, text);
    if (!result.draft) {
      results.push(result);
    }
  }

  const failures = results.filter((result) => result.failures.length > 0);
  process.stdout.write(`editorial_contract_posts_checked=${results.length}\n`);

  if (failures.length > 0) {
    process.stderr.write("Editorial contract gate failed.\n");
    for (const result of failures) {
      process.stderr.write(`- ${result.file}: ${result.failures.join("; ")}\n`);
    }
    process.stdout.write("editorial_contract_gate=fail\n");
    return 1;
  }

  process.stdout.write("editorial_contract_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

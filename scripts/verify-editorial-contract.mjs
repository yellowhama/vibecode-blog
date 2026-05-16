import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const BLOG_DIR = "src/data/blog";

const CONTRACT_ANCHOR =
  /\b(technical contract|contract|boundary|deterministic|local-first|audit trail|control surface|policy|evidence|source-backed|verified|warden|musu)\b|계약|경계|증거|검증|감사|출처/i;

const PROOF_ROUTE =
  /https:\/\/musu\.pro|github\.com\/yellowhama|musu|warden|field log|technical contract|install\.sh/i;

const EVIDENCE_ANCHOR =
  /references:\s*(?:\r?\n\s*-|$)|https?:\/\/|```|`[^`]+`|verified fix|real failure|source-backed|audit|advisory|log|command|config|screenshot|diff|evidence|증거|출처|검증/i;

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

function checkPost(file, text) {
  const { frontmatter, body } = parseMarkdown(text);
  const title = getFrontmatterValue(frontmatter, "title");
  const description = getFrontmatterValue(frontmatter, "description");
  const combined = `${frontmatter}\n${body}`;
  const failures = [];

  if (!title) failures.push("missing title");
  if (!description) failures.push("missing description");
  if (!CONTRACT_ANCHOR.test(combined)) {
    failures.push("missing technical-contract, boundary, evidence, Warden, or MUSU anchor");
  }
  if (!PROOF_ROUTE.test(combined)) {
    failures.push("missing natural route to MUSU, Warden, GitHub, Field Log, install, or technical-contract proof");
  }
  if (!EVIDENCE_ANCHOR.test(combined)) {
    failures.push("missing source/evidence anchor such as references, URL, command, config, audit, log, or code block");
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
    const result = checkPost(file, text);
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

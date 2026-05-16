import { access, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";
const DEFAULT_WIKI_ROOT = process.env.LLM_WIKI_ROOT ?? "C:\\Users\\empty\\llm-wiki";
const ENFORCEMENT_DATE = new Date("2026-05-17T00:00:00Z");
const REQUIRED_PACKET_SUFFIXES = [
  "reader-pressure",
  "title-angle",
  "evidence-bundle",
  "brief",
  "gate-0",
  "draft-critique",
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

function packetPath(wikiRoot, slug, suffix) {
  return join(wikiRoot, "companies", "vibecode-town", "plans", `${slug}-${suffix}.md`);
}

async function fileExists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function parseDate(dateText) {
  if (!dateText) return null;
  const date = new Date(dateText);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function main() {
  const blogDir = getArg("--blog-dir") ?? DEFAULT_BLOG_DIR;
  const wikiRoot = resolve(getArg("--wiki-root") ?? DEFAULT_WIKI_ROOT);
  const files = (await readdir(blogDir))
    .filter((file) => file.endsWith(".md"))
    .sort();

  const failures = [];
  let checked = 0;
  let packetBacked = 0;
  let legacy = 0;
  let skipped = 0;

  for (const file of files) {
    const text = await readFile(join(blogDir, file), "utf8");
    const { frontmatter } = parseMarkdown(text);

    if (isDraft(frontmatter)) {
      skipped += 1;
      continue;
    }

    const series = getFrontmatterValue(frontmatter, "series");
    if (series === "About") {
      skipped += 1;
      continue;
    }

    checked += 1;
    const slug = file.replace(/\.md$/, "");
    const workflow = getFrontmatterValue(frontmatter, "workflow");
    const pubDate = parseDate(getFrontmatterValue(frontmatter, "pubDatetime"));

    if (workflow === "legacy") {
      legacy += 1;
      if (!pubDate) {
        failures.push(`${file}: legacy workflow requires a valid pubDatetime`);
      } else if (pubDate >= ENFORCEMENT_DATE) {
        failures.push(`${file}: legacy workflow is only allowed before ${ENFORCEMENT_DATE.toISOString()}`);
      }
      continue;
    }

    const missing = [];
    for (const suffix of REQUIRED_PACKET_SUFFIXES) {
      const requiredPath = packetPath(wikiRoot, slug, suffix);
      if (!(await fileExists(requiredPath))) {
        missing.push(requiredPath);
      }
    }

    if (missing.length > 0) {
      failures.push(`${file}: missing source workflow packet(s): ${missing.join(", ")}`);
    } else {
      packetBacked += 1;
    }
  }

  process.stdout.write(`source_workflow_blog_dir=${blogDir}\n`);
  process.stdout.write(`source_workflow_wiki_root=${wikiRoot}\n`);
  process.stdout.write(`source_workflow_posts_checked=${checked}\n`);
  process.stdout.write(`source_workflow_packet_backed_posts=${packetBacked}\n`);
  process.stdout.write(`source_workflow_legacy_posts=${legacy}\n`);
  process.stdout.write(`source_workflow_posts_skipped=${skipped}\n`);

  if (failures.length > 0) {
    process.stderr.write("Source workflow packet gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("source_workflow_gate=fail\n");
    return 1;
  }

  process.stdout.write("source_workflow_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

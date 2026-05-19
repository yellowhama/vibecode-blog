import { access, readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const BLOG_DIR = "src/data/blog";
const PUBLIC_SOURCE_ROOTS = [
  "src/data/blog",
  "src/pages",
  "src/components",
  "src/layouts",
  "src/styles",
  "src/config.ts",
  "src/content.config.ts",
];

const TEXT_EXTENSIONS = new Set([".astro", ".css", ".md", ".ts"]);
const NON_ENGLISH_PUBLIC_TEXT = /[\u3131-\u318e\uac00-\ud7a3\u4e00-\u9fff]/u;
const FORBIDDEN_PRODUCT_MENTIONS = [
  { label: "musu.pro", pattern: /musu\.pro/i },
  { label: "MUSU Pro", pattern: /\bMUSU\s+Pro\b/i },
  { label: "MUSU", pattern: /\bMUSU\b/ },
  { label: "musu-bee", pattern: /\bmusu-bee\b/i },
];

const PROBLEM_ANCHOR =
  /\b(problem|failure|risk|broken|dangerous|bottleneck|lost|leak|wrong|hidden|unsafe|gap|waste|confused|generic|slop)\b/i;
const WHY_ANCHOR =
  /\b(matters|because|means|costs|trust|proof|evidence|boundary|contract|verification|review|operator|public|reader)\b/i;
const ACTION_ANCHOR =
  /\b(check|verify|use|run|reject|fix|keep|turn|write|audit|route|ship|publish|review|start|stop|decide)\b/i;
const ACTION_SECTION =
  /^##\s+(Reader Decision|Technical Verdict|Boundary|.*Checklist|Control Surface|Publishing Contract|Prompt Pattern|The Export Rule)\s*$/im;

function slashPath(path) {
  return path.replace(/\\/g, "/");
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

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function collectTextFiles(path) {
  const files = [];
  if ((await exists(path)) && TEXT_EXTENSIONS.has(extname(path).toLowerCase())) {
    return [path];
  }

  const entries = await readdir(path, { withFileTypes: true });
  for (const entry of entries) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectTextFiles(child));
    } else if (TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(child);
    }
  }
  return files;
}

function stripMarkdownNoise(markdown) {
  return markdown
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#.+$/gm, "")
    .trim();
}

function firstReadableIntro(body) {
  const lines = stripMarkdownNoise(body).split(/\r?\n/);
  const paragraphs = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("|")) continue;
    if (/^\d+\.\s/.test(trimmed)) continue;
    paragraphs.push(trimmed);
    if (paragraphs.join(" ").length > 480) break;
  }
  return paragraphs.join(" ");
}

function checkPost(file, text) {
  const { frontmatter, body } = parseMarkdown(text);
  if (isDraft(frontmatter)) return [];

  const failures = [];
  const slug = basename(file, ".md");
  const series = getFrontmatterValue(frontmatter, "series");
  const title = getFrontmatterValue(frontmatter, "title");
  const description = getFrontmatterValue(frontmatter, "description");
  const lang = getFrontmatterValue(frontmatter, "lang");
  const ogImage = getFrontmatterValue(frontmatter, "ogImage");
  const intro = firstReadableIntro(body);

  if (!title || title.length < 12) {
    failures.push(`${file}: title must be specific enough for scanner-first review`);
  }
  if (!description || description.length < 80) {
    failures.push(`${file}: description must explain the post job in at least 80 characters`);
  }
  if (lang && lang.toLowerCase() !== "en") {
    failures.push(`${file}: lang must be en when set`);
  }
  if (NON_ENGLISH_PUBLIC_TEXT.test(`${frontmatter}\n${body}`)) {
    failures.push(`${file}: public post contains non-English CJK/Hangul text`);
  }
  if (series !== "About" && !/^references:\s*(?:\r?\n\s*-|$)/m.test(frontmatter)) {
    failures.push(`${file}: non-About public posts must include source references`);
  }
  if (series !== "About" && !PROBLEM_ANCHOR.test(intro)) {
    failures.push(`${file}: intro must name a problem, failure, risk, or gap`);
  }
  if (series !== "About" && !WHY_ANCHOR.test(`${description}\n${intro}`)) {
    failures.push(`${file}: intro/description must show why the issue matters`);
  }
  if (series !== "About" && !ACTION_ANCHOR.test(`${description}\n${intro}\n${body}`)) {
    failures.push(`${file}: post must make the reader action or decision inspectable`);
  }
  if (!ACTION_SECTION.test(body)) {
    failures.push(`${file}: post needs a clear decision, checklist, boundary, or action section`);
  }

  const expectedImage = `/images/posts/${slug}.png`;
  if (ogImage !== expectedImage) {
    failures.push(`${file}: ogImage must be post-specific ${expectedImage}`);
  }

  return failures;
}

async function main() {
  const failures = [];
  const seenFiles = new Set();
  let filesScanned = 0;

  for (const root of PUBLIC_SOURCE_ROOTS) {
    for (const file of await collectTextFiles(root)) {
      const publicPath = slashPath(file);
      if (seenFiles.has(publicPath)) continue;
      seenFiles.add(publicPath);
      filesScanned += 1;
      const text = await readFile(file, "utf8");

      if (NON_ENGLISH_PUBLIC_TEXT.test(text)) {
        failures.push(`${publicPath}: public source contains non-English CJK/Hangul text`);
      }
      for (const forbidden of FORBIDDEN_PRODUCT_MENTIONS) {
        if (forbidden.pattern.test(text)) {
          failures.push(`${publicPath}: public source contains forbidden product mention "${forbidden.label}"`);
        }
      }
      if (publicPath.startsWith(BLOG_DIR)) {
        failures.push(...checkPost(publicPath, text));
      }
    }
  }

  process.stdout.write(`public_page_review_files_scanned=${filesScanned}\n`);

  if (failures.length > 0) {
    process.stderr.write("Public page review gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("public_page_review_gate=fail\n");
    return 1;
  }

  process.stdout.write("public_page_review_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

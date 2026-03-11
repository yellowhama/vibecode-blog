import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ragDir = path.resolve(__dirname, "..");
const sourcesDir = path.join(ragDir, "sources");
const indexPath = path.join(ragDir, "index.json");

// Also index directly from phase1 and blog-only if sources/ is empty
const projectRoot = path.resolve(ragDir, "../../../..");
const fallbackDirs = [
  path.join(projectRoot, "content/blog/phase1"),
  path.join(projectRoot, "content/blog/blog-only"),
];

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u3131-\uD79D]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function listMarkdownFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip 'en' subdirectory (translations)
        if (entry.name === "en") continue;
        files.push(...(await listMarkdownFiles(full)));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        files.push(full);
      }
    }
    return files;
  } catch {
    return [];
  }
}

/**
 * Split by horizontal rules (---) instead of H2.
 * Falls back to H2 splitting if no --- found.
 */
function splitByHR(markdown) {
  const lines = markdown.split("\n");

  // Find --- separators (must be on own line, at least 3 dashes)
  const hrIdx = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^-{3,}\s*$/.test(lines[i])) hrIdx.push(i);
  }

  if (hrIdx.length === 0) {
    // Fallback: try H2 splitting
    return splitByH2(markdown);
  }

  const chunks = [];
  const boundaries = [0, ...hrIdx.map((i) => i + 1)];
  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i];
    const end = i + 1 < boundaries.length ? boundaries[i + 1] - 1 : lines.length;
    const chunkLines = lines.slice(start, end);
    const text = chunkLines.join("\n").trim();
    if (!text) continue;

    // Try to extract a heading from the chunk
    const heading = chunkLines.find((l) => l.startsWith("## ") || l.startsWith("# "));
    chunks.push({
      heading: heading ? heading.replace(/^#+\s+/, "").trim() : null,
      text,
    });
  }
  return chunks;
}

function splitByH2(markdown) {
  const lines = markdown.split("\n");
  const h2Idx = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) h2Idx.push(i);
  }
  if (h2Idx.length === 0) {
    return [{ heading: null, text: markdown.trim() }];
  }
  const chunks = [];
  for (let i = 0; i < h2Idx.length; i++) {
    const start = h2Idx[i];
    const end = i + 1 < h2Idx.length ? h2Idx[i + 1] : lines.length;
    const heading = lines[start].slice(3).trim();
    const text = lines.slice(start, end).join("\n").trim();
    chunks.push({ heading, text });
  }
  return chunks;
}

function findTitle(markdown, fallback) {
  const firstH1 = markdown.split("\n").find((l) => l.startsWith("# "));
  return firstH1 ? firstH1.slice(2).trim() : fallback;
}

/**
 * Extract metadata tags from filename and content.
 */
function extractMeta(filename, text) {
  const meta = {};

  // Act detection: act1-1-ko.md → act=1, chapter=1
  const actMatch = filename.match(/act(\d+)-(\d+)/);
  if (actMatch) {
    meta.act = parseInt(actMatch[1]);
    meta.chapter = parseInt(actMatch[2]);
  }

  // Blog number: 058-xxx.md → blog_number=58
  const numMatch = filename.match(/^(\d{3})/);
  if (numMatch) {
    meta.blog_number = parseInt(numMatch[1]);
  }

  // Concept keywords detection
  const concepts = [];
  const conceptMap = {
    "스펙": "spec",
    "spec": "spec",
    "SDD": "sdd",
    "DDD": "ddd",
    "TDD": "tdd",
    "도메인": "domain",
    "domain": "domain",
    "테스트": "test",
    "test": "test",
    "바이브코딩": "vibe-coding",
    "디버깅": "debugging",
    "모듈": "module",
    "의존성": "dependency",
    "경계": "boundary",
    "bounded context": "bounded-context",
    "프롬프트": "prompt",
  };

  const textLower = text.toLowerCase();
  for (const [keyword, concept] of Object.entries(conceptMap)) {
    if (textLower.includes(keyword.toLowerCase())) {
      if (!concepts.includes(concept)) concepts.push(concept);
    }
  }
  if (concepts.length > 0) meta.concepts = concepts;

  return meta;
}

// Collect source files
let mdFiles = await listMarkdownFiles(sourcesDir);

// If sources/ is empty, use fallback dirs
if (mdFiles.length === 0) {
  console.log("sources/ empty — indexing from phase1 + blog-only directly");
  for (const dir of fallbackDirs) {
    mdFiles.push(...(await listMarkdownFiles(dir)));
  }
}

const chunks = [];

for (const filePath of mdFiles) {
  const rel = path.relative(ragDir, filePath).replaceAll(path.sep, "/");
  const raw = await fs.readFile(filePath, "utf8");
  const title = findTitle(raw, path.basename(filePath));
  const parts = splitByHR(raw);
  const filename = path.basename(filePath);

  parts.forEach((part, idx) => {
    const headingSlug = part.heading ? slugify(part.heading) : "root";
    const meta = extractMeta(filename, part.text);
    chunks.push({
      id: `${rel}::${headingSlug}::${idx + 1}`,
      source_path: rel,
      title,
      heading: part.heading,
      text: part.text,
      chars: part.text.length,
      ...meta,
    });
  });
}

const payload = {
  generated_at: new Date().toISOString(),
  description: "대본 소재 RAG 인덱스 — phase1 + blog-only 블로그 청크",
  source_count: mdFiles.length,
  chunk_count: chunks.length,
  chunks,
};

await fs.writeFile(indexPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(
  `Wrote ${chunks.length} chunks from ${mdFiles.length} files to ${path.relative(process.cwd(), indexPath)}`
);

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ragDir = path.resolve(__dirname, "..");
const sourcesDir = path.join(ragDir, "sources");
const indexPath = path.join(ragDir, "index.json");

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u3131-\uD79D]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function listMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(full)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
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

const mdFiles = await listMarkdownFiles(sourcesDir);
const chunks = [];

for (const filePath of mdFiles) {
  const rel = path.relative(ragDir, filePath).replaceAll(path.sep, "/");
  const raw = await fs.readFile(filePath, "utf8");
  const title = findTitle(raw, path.basename(filePath));
  const parts = splitByH2(raw);

  parts.forEach((part, idx) => {
    const headingSlug = part.heading ? slugify(part.heading) : "root";
    chunks.push({
      id: `${rel}::${headingSlug}::${idx + 1}`,
      source_path: rel,
      title,
      heading: part.heading,
      text: part.text,
      chars: part.text.length
    });
  });
}

const payload = {
  generated_at: new Date().toISOString(),
  sources_dir: "sources",
  source_count: mdFiles.length,
  chunk_count: chunks.length,
  chunks
};

await fs.writeFile(indexPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Wrote ${chunks.length} chunks to ${path.relative(process.cwd(), indexPath)}`);

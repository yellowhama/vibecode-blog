import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ragDir = path.resolve(__dirname, "..");
const indexPath = path.join(ragDir, "index.json");

function tokenize(q) {
  return q
    .toLowerCase()
    .split(/[\s,.;:(){}[\]<>"'!?/\\|]+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function countOcc(haystack, needle) {
  let idx = 0;
  let count = 0;
  while (true) {
    idx = haystack.indexOf(needle, idx);
    if (idx === -1) break;
    count++;
    idx += needle.length;
  }
  return count;
}

function scoreChunk(chunk, tokens) {
  const text = (chunk.text || "").toLowerCase();
  const title = (chunk.title || "").toLowerCase();
  const heading = (chunk.heading || "").toLowerCase();
  const concepts = (chunk.concepts || []).join(" ").toLowerCase();

  let score = 0;
  for (const t of tokens) {
    score += countOcc(text, t);
    if (title.includes(t)) score += 2;
    if (heading.includes(t)) score += 3;
    if (concepts.includes(t)) score += 5;
  }
  return score;
}

const args = process.argv.slice(2);
const query = args.find((a) => !a.startsWith("--"));
const topN = Number(
  (args.find((a) => a.startsWith("--top=")) || "").split("=")[1] || 5
);
const asJson = args.includes("--json");

if (!query) {
  console.error('Usage: node query.mjs "your query" [--top=5] [--json]');
  process.exit(2);
}

const raw = await fs.readFile(indexPath, "utf8");
const index = JSON.parse(raw);
const tokens = tokenize(query);

const scored = index.chunks
  .map((c) => ({ score: scoreChunk(c, tokens), chunk: c }))
  .filter((x) => x.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, Math.max(1, topN));

if (asJson) {
  console.log(
    JSON.stringify(
      {
        query,
        tokens,
        results: scored.map((s) => ({ score: s.score, ...s.chunk })),
      },
      null,
      2
    )
  );
  process.exit(0);
}

console.log(`# RAG Results`);
console.log(`- query: ${query}`);
console.log(`- tokens: ${tokens.join(", ") || "(none)"}`);
console.log(`- index: ${index.chunk_count} chunks from ${index.source_count} files`);
console.log("");

for (const item of scored) {
  const c = item.chunk;
  const where = c.heading
    ? `${c.source_path} — ${c.heading}`
    : `${c.source_path}`;
  console.log(`## ${where}`);
  console.log(`- score: ${item.score}`);
  if (c.concepts) console.log(`- concepts: ${c.concepts.join(", ")}`);
  if (c.act) console.log(`- act: ${c.act}, chapter: ${c.chapter}`);
  console.log("");
  // Show first 300 chars as preview
  const preview = c.text.trim().slice(0, 300);
  console.log(preview + (c.text.length > 300 ? "..." : ""));
  console.log("\n---\n");
}

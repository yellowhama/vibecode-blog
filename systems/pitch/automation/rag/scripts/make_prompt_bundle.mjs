import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ragDir = path.resolve(__dirname, "..");
const kitDir = path.resolve(ragDir, "..");

const indexPath = path.join(ragDir, "index.json");
const orchestratorPath = path.join(kitDir, "prompts", "00_orchestrator.md");
const outPath = path.join(kitDir, "prompt_bundle.md");

function tokenize(q) {
  return q
    .toLowerCase()
    .split(/[\s,.;:(){}[\]<>\"'!?/\\|]+/g)
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

  let score = 0;
  for (const t of tokens) {
    score += countOcc(text, t);
    if (title.includes(t)) score += 2;
    if (heading.includes(t)) score += 3;
  }
  return score;
}

function topChunks(index, query, topN) {
  const tokens = tokenize(query);
  return index.chunks
    .map((c) => ({ score: scoreChunk(c, tokens), chunk: c }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, topN))
    .map((x) => x.chunk);
}

const args = process.argv.slice(2);
const topN = Number((args.find((a) => a.startsWith("--top=")) || "").split("=")[1] || 2);
const queriesArg = (args.find((a) => a.startsWith("--queries=")) || "").split("=")[1];

const defaultQueries = [
  "상세페이지 목적 목표 전환 클레임",
  "Brand Voice 금지어 톤",
  "Hero 섹션 규칙",
  "Proof 근거 TODO",
  "Design Blocks 모바일",
  "Image 보정 보조",
  "QA 근거 금칙어 필수고지",
  "Pricing 가격 옵션 할인 무료배송",
  "Policy 배송 교환 환불 AS",
  "Support FAQ 컴플레인 대응",
  "Claims 허용 금지 과장 비교"
];
const queries = queriesArg ? queriesArg.split("|").map((s) => s.trim()).filter(Boolean) : defaultQueries;

const indexRaw = await fs.readFile(indexPath, "utf8");
const index = JSON.parse(indexRaw);
const orchestrator = await fs.readFile(orchestratorPath, "utf8");

const picked = [];
for (const q of queries) {
  picked.push({ query: q, chunks: topChunks(index, q, topN) });
}

let ragContext = `# RAG Context (auto-selected)\n\n`;
ragContext += `- generated_at: ${new Date().toISOString()}\n`;
ragContext += `- top_per_query: ${topN}\n`;
ragContext += `- queries: ${queries.join(" | ")}\n\n`;

for (const block of picked) {
  ragContext += `## Query: ${block.query}\n\n`;
  for (const c of block.chunks) {
    const where = c.heading ? `${c.source_path} — ${c.heading}` : c.source_path;
    ragContext += `### ${where}\n\n`;
    ragContext += `${c.text.trim()}\n\n`;
  }
}

const bundle = [
  "# Prompt Bundle — Detail Page Draft Factory",
  "",
  "아래 내용을 Claude Code에 그대로 붙여넣어 실행하세요.",
  "",
  "---",
  "",
  ragContext.trim(),
  "",
  "---",
  "",
  orchestrator.trim(),
  ""
].join("\n");

await fs.writeFile(outPath, bundle, "utf8");
console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);

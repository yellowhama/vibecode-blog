import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import sharp from "sharp";

const DEFAULT_OUTPUT_DIR = "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrap(value, maxChars = 46, maxLines = 4) {
  const words = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.length ? lines : ["missing"];
}

function compact(value, max = 180) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function svgText(lines, x, y, options = {}) {
  const {
    size = 22,
    fill = "#21170f",
    family = "Inter, Arial, sans-serif",
    weight = "600",
    lineHeight = 30,
  } = options;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("")}</text>`;
}

function quoteCard({ x, y, width, title, quote, color, fill = "#fffaf2" }) {
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="206" rx="18" fill="${fill}" stroke="#d8c7b8" stroke-width="2"/>
    <rect width="${width}" height="44" rx="18" fill="${color}"/>
    <text x="24" y="29" font-family="Consolas, monospace" font-size="18" font-weight="700" fill="#fffaf2">${escapeXml(title)}</text>
    ${svgText(wrap(quote, 43, 4), 24, 86, { size: 22, lineHeight: 31, fill: "#21170f", family: "Georgia, serif", weight: "700" })}
  </g>`;
}

function buildSvg({ title, beforeQuote, afterQuote, rejectedRows, acceptanceEvidence }) {
  const rowText = rejectedRows.join(" / ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
  <rect width="1200" height="760" fill="#f3eadf"/>
  <g stroke="#e1d2c4" stroke-width="1">
    ${Array.from({ length: 31 }, (_, index) => `<line x1="${index * 40}" y1="0" x2="${index * 40}" y2="760"/>`).join("")}
    ${Array.from({ length: 20 }, (_, index) => `<line x1="0" y1="${index * 40}" x2="1200" y2="${index * 40}"/>`).join("")}
  </g>
  <rect x="46" y="42" width="1108" height="676" rx="30" fill="#fffaf2" stroke="#21170f" stroke-width="3"/>
  <text x="82" y="88" font-family="Consolas, monospace" font-size="21" font-weight="700" fill="#744c94">PRIVATE REVISION TRACE</text>
  ${svgText(wrap(title, 38, 2), 82, 148, { size: 44, lineHeight: 50, fill: "#21170f", family: "Georgia, serif", weight: "700" })}
  <rect x="82" y="222" width="1036" height="48" rx="14" fill="#f0dfd4" stroke="#d8c7b8"/>
  <text x="108" y="253" font-family="Consolas, monospace" font-size="19" font-weight="700" fill="#21170f">human rejects: ${escapeXml(rowText)}</text>
  ${quoteCard({ x: 82, y: 314, width: 485, title: "before: approved-looking, weak evidence", quote: beforeQuote, color: "#8e3b2f" })}
  <path d="M584 418 H620" stroke="#744c94" stroke-width="6" stroke-linecap="round"/>
  <path d="M606 402 L624 418 L606 434" fill="none" stroke="#744c94" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  ${quoteCard({ x: 634, y: 314, width: 484, title: "after: source question first", quote: afterQuote, color: "#255b42" })}
  <g transform="translate(82 562)">
    <rect width="1036" height="104" rx="18" fill="#21170f"/>
    <text x="28" y="36" font-family="Consolas, monospace" font-size="18" font-weight="700" fill="#d8794a">acceptance evidence</text>
    ${svgText(wrap(acceptanceEvidence, 90, 2), 28, 72, { size: 21, lineHeight: 29, fill: "#fffaf2", family: "Inter, Arial, sans-serif", weight: "600" })}
  </g>
</svg>`;
}

function firstItem(items, id) {
  return items.find((item) => item?.planItemId === id) ?? items[0];
}

async function main() {
  const slug = getArg("--slug");
  if (!slug) throw new Error("--slug is required");
  const revisionResultPath = resolve(getArg("--revision-result") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-human-quality-revision-result.json`);
  const beforePath = resolve(getArg("--before") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-before-loop77.md`);
  const afterArg = getArg("--after");
  const afterPath = afterArg ? resolve(afterArg) : "";
  const currentDraftArg = getArg("--current-draft");
  const currentDraftPath = currentDraftArg ? resolve(currentDraftArg) : "";
  const output = resolve(getArg("--output") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-revision-trace.png`);
  const summaryPath = resolve(getArg("--summary") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-revision-trace-summary.json`);
  const check = hasArg("--check");

  const revisionResult = JSON.parse(await readFile(revisionResultPath, "utf8"));
  const beforeMarkdown = await readFile(beforePath, "utf8");
  const afterMarkdown = afterPath ? await readFile(afterPath, "utf8") : "";
  const currentDraft = currentDraftPath ? await readFile(currentDraftPath, "utf8") : "";
  const beforeMarkdownSha256 = sha256(beforeMarkdown);
  const afterMarkdownSha256 = afterPath ? sha256(afterMarkdown) : revisionResult.afterMarkdownSha256;
  const currentDraftSha256 = currentDraftPath ? sha256(currentDraft) : "";
  const failures = [];
  const items = Array.isArray(revisionResult.items) ? revisionResult.items : [];
  const openingItem = firstItem(items, "revision-plan-01-first-30-seconds");
  const rejectedRows = items.map((item) => item?.targetSection ?? item?.planItemId ?? "rejected row").slice(0, 3);
  const title = `${slug}: what changed after human rejection`;
  const svg = buildSvg({
    title,
    beforeQuote: compact(openingItem?.beforeQuote, 220),
    afterQuote: compact(openingItem?.afterQuote, 220),
    rejectedRows,
    acceptanceEvidence: compact(openingItem?.acceptanceEvidence, 240),
  });
  const image = await sharp(Buffer.from(svg)).png().toBuffer();
  const imageSha256 = createHash("sha256").update(image).digest("hex").toUpperCase();
  const summary = {
    schema: "vibecode-private-revision-trace/v1",
    slug,
    revisionResultPath,
    beforePath,
    afterPath: afterPath || null,
    currentDraftPath: currentDraftPath || null,
    beforeMarkdownSha256,
    afterMarkdownSha256,
    currentDraftSha256: currentDraftSha256 || null,
    currentDraftContainsArtifact: currentDraftPath ? currentDraft.includes(basename(output)) : null,
    output,
    imageSha256,
    width: 1200,
    height: 760,
    itemCount: items.length,
    broadRewriteDenied: items.every((item) => item?.broadRewriteDenied === true),
    rejectedRows,
    beforeQuote: openingItem?.beforeQuote ?? "",
    afterQuote: openingItem?.afterQuote ?? "",
  };
  const summaryText = `${JSON.stringify(summary, null, 2)}\n`;

  if (revisionResult.schema !== "vibecode-human-quality-revision-result/v1") {
    failures.push("revision result schema must be vibecode-human-quality-revision-result/v1");
  }
  if (revisionResult.slug !== slug) failures.push("revision result slug must match --slug");
  if (revisionResult.beforeMarkdownSha256 !== beforeMarkdownSha256) {
    failures.push("revision result beforeMarkdownSha256 does not match --before");
  }
  if (afterPath && revisionResult.afterMarkdownSha256 !== afterMarkdownSha256) {
    failures.push("revision result afterMarkdownSha256 does not match --after");
  }
  if (currentDraftPath && !currentDraft.includes(basename(output))) {
    failures.push("current draft must reference the generated revision trace artifact");
  }
  if (revisionResult.promotionAllowed !== false) failures.push("revision trace must remain private promotionAllowed=false");
  if (items.length < 1) failures.push("revision result must contain at least one item");
  if (!summary.broadRewriteDenied) failures.push("every revision trace item must deny broad rewrite");
  if (!openingItem?.beforeQuote || !openingItem?.afterQuote) failures.push("revision trace requires before and after quotes");

  if (check) {
    if (!existsSync(output)) failures.push(`revision trace image missing: ${output}`);
    if (!existsSync(summaryPath)) failures.push(`revision trace summary missing: ${summaryPath}`);
    if (existsSync(output)) {
      const currentImage = await readFile(output);
      const currentSha = createHash("sha256").update(currentImage).digest("hex").toUpperCase();
      if (currentSha !== imageSha256) failures.push("revision trace image is stale");
    }
    if (existsSync(summaryPath)) {
      const currentSummary = await readFile(summaryPath, "utf8");
      if (currentSummary !== summaryText) failures.push("revision trace summary is stale");
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, image);
    await writeFile(summaryPath, summaryText, "utf8");
  }

  process.stdout.write(`private_revision_trace_artifact=${output}\n`);
  process.stdout.write(`private_revision_trace_summary=${summaryPath}\n`);
  process.stdout.write(`private_revision_trace_sha256=${imageSha256}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("private_revision_trace_artifact=fail\n");
    return 1;
  }
  process.stdout.write("private_revision_trace_artifact=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

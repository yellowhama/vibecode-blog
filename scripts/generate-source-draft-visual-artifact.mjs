import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const DEFAULT_BLOG_DIR = "src/data/blog";
const DEFAULT_OUTPUT_DIR = "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
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

function section(body, heading) {
  const pattern = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "im");
  const match = body.match(pattern);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const next = body.slice(start).search(/^##\s+/im);
  return body.slice(start, next === -1 ? undefined : start + next).trim();
}

function sectionAny(body, headings) {
  for (const heading of headings) {
    const value = section(body, heading);
    if (value) return value;
  }
  return "";
}

function paragraph(text) {
  return text
    .split(/\r?\n\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .find((item) => !item.startsWith("```") && !item.startsWith("|") && !item.startsWith("!["))
    ?.replace(/\r?\n/g, " ")
    .trim() ?? "";
}

function allCodeBlocks(text) {
  return [...text.matchAll(/```(?:txt)?\r?\n([\s\S]*?)```/g)].map((match) => match[1].trim());
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function compact(value, max = 90) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function wrap(value, maxChars = 34, maxLines = 3) {
  const words = String(value ?? "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
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
  if (words.length > 0 && lines.length === 0) lines.push(words.slice(0, 4).join(" "));
  return lines.length ? lines : ["missing"];
}

function textBlock(x, y, lines, options = {}) {
  const {
    size = 22,
    fill = "#21170f",
    family = "Inter, Arial, sans-serif",
    weight = "600",
    lineHeight = 30,
  } = options;
  const tspans = lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${tspans}</text>`;
}

function card({ x, y, width, height, title, body, accent = "#744c94" }) {
  const lines = wrap(body, 34, 4);
  return `
  <g transform="translate(${x} ${y})">
    <rect width="${width}" height="${height}" rx="18" fill="#fffaf2" stroke="#d8c7b8" stroke-width="2"/>
    <rect width="8" height="${height}" rx="4" fill="${accent}"/>
    <text x="28" y="38" font-family="Consolas, monospace" font-size="18" font-weight="700" fill="${accent}">${escapeXml(title)}</text>
    ${textBlock(28, 78, lines, { size: 22, lineHeight: 31 })}
  </g>`;
}

function arrow(x1, y1, x2, y2) {
  return `
  <path d="M${x1} ${y1} L${x2} ${y2}" stroke="#7a4f9a" stroke-width="6" stroke-linecap="round"/>
  <path d="M${x2 - 18} ${y2 - 14} L${x2} ${y2} L${x2 - 18} ${y2 + 14}" fill="none" stroke="#7a4f9a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function extractVisualModel({ body, title, slug }) {
  const opening = paragraph(
    sectionAny(body, ["Opening Pressure", "The Paragraph That Fooled Me", "The Paragraph That Gets Past You"]),
  );
  const readerProblem = paragraph(sectionAny(body, ["Reader Problem", "The Failure Is Not Style", "The Reader Problem"]));
  const angle = paragraph(sectionAny(body, ["Angle", "The Harness Is the Point", "The Operating Claim"]));
  const transfer = paragraph(
    sectionAny(body, [
      "Reader Transfer",
      "The Table To Use Before You Prompt Again",
      "Use This Before You Prompt Again",
    ]),
  );
  const codeBlocks = allCodeBlocks(body);
  const weakClaim = compact(codeBlocks.find((block) => block.includes("Now we have")) ?? codeBlocks[0] ?? opening);
  const sourceMap = compact(codeBlocks.find((block) => block.includes("skill:")) ?? codeBlocks.find((block) => block.includes("Research Scout")) ?? angle);
  const beforeAfter = compact(codeBlocks.find((block) => block.includes("before:") && block.includes("after:")) ?? transfer);
  return {
    title,
    slug,
    weakClaim,
    readerProblem: compact(readerProblem, 130),
    operatingClaim: compact(angle, 130),
    sourceMap,
    beforeAfter,
    transfer: compact(transfer, 130),
  };
}

function buildSvg(model) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f3eadf"/>
  <g stroke="#e1d2c4" stroke-width="1">
    ${Array.from({ length: 31 }, (_, index) => `<line x1="${index * 40}" y1="0" x2="${index * 40}" y2="630"/>`).join("")}
    ${Array.from({ length: 16 }, (_, index) => `<line x1="0" y1="${index * 40}" x2="1200" y2="${index * 40}"/>`).join("")}
  </g>
  <rect x="50" y="44" width="1100" height="542" rx="28" fill="#fffaf2" stroke="#d8c7b8" stroke-width="2"/>
  <text x="86" y="92" font-family="Consolas, monospace" font-size="22" font-weight="700" fill="#744c94">PRIVATE SOURCE-DRAFT VISUAL</text>
  ${textBlock(86, 148, wrap(model.title, 38, 2), { family: "Georgia, serif", size: 42, lineHeight: 48, weight: "700" })}
  <text x="86" y="230" font-family="Consolas, monospace" font-size="20" fill="#74675d">${escapeXml(model.slug)}</text>

  ${card({ x: 86, y: 282, width: 235, height: 190, title: "weak claim", body: model.weakClaim, accent: "#8e3b2f" })}
  ${arrow(331, 376, 394, 376)}
  ${card({ x: 410, y: 282, width: 235, height: 190, title: "source trace", body: model.sourceMap, accent: "#744c94" })}
  ${arrow(655, 376, 718, 376)}
  ${card({ x: 734, y: 282, width: 235, height: 190, title: "before/after", body: model.beforeAfter, accent: "#255b42" })}
  ${arrow(979, 376, 1042, 376)}
  <g transform="translate(1010 282)">
    <rect width="104" height="190" rx="18" fill="#21170f"/>
    <text x="24" y="52" font-family="Consolas, monospace" font-size="18" font-weight="700" fill="#fffaf2">ship?</text>
    <text x="21" y="104" font-family="Consolas, monospace" font-size="17" fill="#fffaf2">human</text>
    <text x="21" y="132" font-family="Consolas, monospace" font-size="17" fill="#fffaf2">review</text>
    <text x="21" y="160" font-family="Consolas, monospace" font-size="17" fill="#fffaf2">first</text>
  </g>

  <g transform="translate(86 500)">
    <rect width="1028" height="48" rx="12" fill="#f3eadf" stroke="#d8c7b8" stroke-width="2"/>
    <text x="22" y="31" font-family="Consolas, monospace" font-size="19" fill="#21170f">reader decision: inspect source -> reject unsupported output -> keep approval boundary</text>
  </g>
</svg>`;
}

async function main() {
  const slug = getArg("--slug");
  if (!slug) throw new Error("--slug is required");
  const blogDir = resolve(getArg("--blog-dir") ?? DEFAULT_BLOG_DIR);
  const draftPath = resolve(blogDir, `${slug}.md`);
  const output = resolve(getArg("--output") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-source-map.png`));
  const summaryPath = resolve(getArg("--summary") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-source-map-summary.json`));
  const check = hasArg("--check");
  const markdown = await readFile(draftPath, "utf8");
  const { frontmatter, body } = parseMarkdown(markdown);
  const title = getFrontmatterValue(frontmatter, "title") || slug;
  const markdownSha256 = createHash("sha256").update(markdown).digest("hex");
  const model = extractVisualModel({ body, title, slug });
  const svg = buildSvg(model);
  const image = await sharp(Buffer.from(svg)).png().toBuffer();
  const imageSha256 = createHash("sha256").update(image).digest("hex").toUpperCase();
  const summary = {
    schema: "vibecode-source-draft-visual/v1",
    slug,
    title,
    draftPath,
    markdownSha256,
    output,
    imageSha256,
    requiredFields: {
      weakClaim: model.weakClaim !== "",
      sourceMap: model.sourceMap !== "",
      beforeAfter: model.beforeAfter !== "",
      transfer: model.transfer !== "",
    },
  };
  const summaryText = `${JSON.stringify(summary, null, 2)}\n`;
  const failures = [];
  for (const [name, present] of Object.entries(summary.requiredFields)) {
    if (!present) failures.push(`visual artifact missing ${name}`);
  }

  if (check) {
    if (!existsSync(output)) failures.push(`visual artifact missing: ${output}`);
    if (!existsSync(summaryPath)) failures.push(`visual artifact summary missing: ${summaryPath}`);
    if (failures.length === 0) {
      const currentImage = await readFile(output);
      const currentSummary = JSON.parse(await readFile(summaryPath, "utf8"));
      const currentSha = createHash("sha256").update(currentImage).digest("hex").toUpperCase();
      if (currentSha !== imageSha256) failures.push("visual artifact image is stale");
      if (currentSummary.markdownSha256 !== markdownSha256 || currentSummary.imageSha256 !== imageSha256) {
        failures.push("visual artifact summary is stale");
      }
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, image);
    await writeFile(summaryPath, summaryText, "utf8");
  }

  process.stdout.write(`source_draft_visual_artifact=${output}\n`);
  process.stdout.write(`source_draft_visual_summary=${summaryPath}\n`);
  process.stdout.write(`source_draft_visual_sha256=${imageSha256}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("source_draft_visual_artifact=fail\n");
    return 1;
  }
  process.stdout.write("source_draft_visual_artifact=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

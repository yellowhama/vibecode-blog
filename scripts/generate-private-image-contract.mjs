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

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function parseMarkdown(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: text };
  return { frontmatter: match[1], body: match[2] };
}

function frontmatterValue(frontmatter, name) {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
  if (!match) return "";
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function isDraft(frontmatter) {
  return /^draft:\s*true\s*$/m.test(frontmatter);
}

function bodyImages(body) {
  return [...body.matchAll(/!\[([^\]]*)]\(([^)]+)\)/g)].map((match) => ({
    alt: match[1].trim(),
    src: match[2].trim(),
  }));
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapText(value, maxChars = 34, maxLines = 3) {
  const words = String(value ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function svgText(lines, x, y, size, color, family = "Georgia, serif", weight = "700", gap = 1.18) {
  return lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : size * gap;
      return `<text x="${x}" y="${y + dy}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(line)}</text>`;
    })
    .join("\n");
}

function buildSvg({ title, subtitle, signal }) {
  const titleLines = wrapText(title, 30, 3);
  const subtitleLines = wrapText(subtitle, 56, 2);
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f4efe7"/>
  <rect x="52" y="46" width="1096" height="538" rx="22" fill="#fffaf2" stroke="#21170f" stroke-width="3"/>
  <rect x="86" y="82" width="210" height="42" rx="21" fill="#21170f"/>
  <text x="112" y="109" font-family="Consolas, monospace" font-size="18" font-weight="700" fill="#fffaf2">PRIVATE CANDIDATE</text>
  <circle cx="1016" cy="134" r="58" fill="#744c94"/>
  <circle cx="1062" cy="190" r="42" fill="#d8794a"/>
  <path d="M900 158 L1030 158 L1030 282 L900 282 Z" fill="none" stroke="#21170f" stroke-width="5"/>
  <path d="M926 192 H1004 M926 226 H984 M926 260 H1014" stroke="#21170f" stroke-width="5" stroke-linecap="round"/>
  ${svgText(titleLines, 86, 210, 62, "#21170f")}
  ${svgText(subtitleLines, 90, 452, 25, "#51463e", "Inter, Arial, sans-serif", "600", 1.3)}
  <rect x="86" y="516" width="1028" height="38" rx="19" fill="#f0dfd4" stroke="#d8c7b8"/>
  <text x="112" y="541" font-family="Consolas, monospace" font-size="17" font-weight="700" fill="#21170f">${escapeXml(signal)}</text>
</svg>`;
}

function reviewRejectCount(review) {
  return Array.isArray(review.scorecard) ? review.scorecard.filter((row) => row?.verdict === "reject").length : -1;
}

async function main() {
  const slug = getArg("--slug");
  if (!slug) throw new Error("--slug is required");
  const blogDir = resolve(getArg("--blog-dir") ?? DEFAULT_BLOG_DIR);
  const draftPath = resolve(blogDir, `${slug}.md`);
  const reviewPath = getArg("--quality-review") ? resolve(getArg("--quality-review")) : "";
  const output = resolve(getArg("--output") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-candidate-og.png`));
  const contractPath = resolve(getArg("--contract") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-private-image-contract.json`));
  const check = hasArg("--check");
  const markdown = await readFile(draftPath, "utf8");
  const markdownSha256 = sha256(markdown);
  const { frontmatter, body } = parseMarkdown(markdown);
  const title = frontmatterValue(frontmatter, "title") || slug;
  const publicOgImage = frontmatterValue(frontmatter, "ogImage");
  const images = bodyImages(body);
  const review = reviewPath ? JSON.parse(await readFile(reviewPath, "utf8")) : null;
  const anchors = [
    "which source changed the claim",
    "smaller failure ledger",
    "A useful content agent brings you to the decision",
  ];
  const subtitle = "Source, artifact, image, and approval state must agree before a content skill touches public work.";
  const signal = "source -> artifact -> image contract -> human approval";
  const svg = buildSvg({ title, subtitle, signal });
  const image = await sharp(Buffer.from(svg)).png().toBuffer();
  const imageSha256 = createHash("sha256").update(image).digest("hex").toUpperCase();
  const contract = {
    schema: "vibecode-private-image-contract/v1",
    slug,
    title,
    draftPath,
    markdownSha256,
    status: "private_candidate_only",
    publicCopyAllowed: false,
    approvalRequired: true,
    publicOgImage,
    candidateImage: output,
    imageSha256,
    width: 1200,
    height: 630,
    bodyImages: images,
    anchors,
    rationale:
      "The private candidate image must represent the article's source-to-artifact-to-approval argument and must not be reused across another post.",
    qualityReview: reviewPath
      ? {
          path: reviewPath,
          markdownSha256: review?.markdownSha256 ?? "",
          rejectCount: reviewRejectCount(review),
        }
      : null,
  };
  const contractText = `${JSON.stringify(contract, null, 2)}\n`;
  const failures = [];

  if (!isDraft(frontmatter)) failures.push("private image contract source must remain draft:true");
  if (!body.includes("approval_candidate=false")) failures.push("private image contract source must keep approval_candidate=false");
  if (!publicOgImage.startsWith("/images/posts/")) failures.push("draft ogImage must name the future public post image path");
  if (images.length < 2) failures.push("draft must include at least two private body images before candidate proof");
  for (const anchor of anchors) {
    if (!normalize(markdown).includes(normalize(anchor))) failures.push(`image contract anchor missing from draft: ${anchor}`);
  }
  if (review) {
    if (review.markdownSha256 !== markdownSha256) failures.push("quality review markdownSha256 must match current draft");
    if (reviewRejectCount(review) !== 0) failures.push("quality review must have zero rejected rows before candidate image contract");
  }

  if (check) {
    if (!existsSync(output)) failures.push(`candidate image missing: ${output}`);
    if (!existsSync(contractPath)) failures.push(`private image contract missing: ${contractPath}`);
    if (existsSync(output)) {
      const currentImage = await readFile(output);
      const currentSha = createHash("sha256").update(currentImage).digest("hex").toUpperCase();
      if (currentSha !== imageSha256) failures.push("candidate image is stale");
    }
    if (existsSync(contractPath)) {
      const currentContract = await readFile(contractPath, "utf8");
      if (currentContract !== contractText) failures.push("private image contract is stale");
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, image);
    await writeFile(contractPath, contractText, "utf8");
  }

  process.stdout.write(`private_candidate_image=${output}\n`);
  process.stdout.write(`private_image_contract=${contractPath}\n`);
  process.stdout.write(`private_candidate_image_sha256=${imageSha256}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("private_image_contract=fail\n");
    return 1;
  }
  process.stdout.write("private_image_contract=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

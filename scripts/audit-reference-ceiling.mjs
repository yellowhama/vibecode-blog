import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";

const CODE_FENCE = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`\n]+`/g;
const MARKDOWN_IMAGE = /!\[[^\]]+]\(([^)]+)\)/g;
const TABLE_ROW = /^\|.+\|$/m;
const DATE_OR_RECEIPT =
  /\b(?:20\d{2}-\d{2}-\d{2}|[a-f0-9]{7,64}|\d+(?:\.\d+)?(?:pages|posts|viewports|records|words|files|routes|screenshots|checks|ms|s|%))\b/i;
const SCENE_WORDS =
  /\b(failed|broke|blocked|caught|noticed|opened|ran|clicked|shipped|deleted|moved|asked|watched|looked|saw|found)\b/i;
const STAKE_WORDS =
  /\b(cost|risk|trust|production|public|reader|customer|money|time|security|leak|deploy|publish|approval|handoff)\b/i;
const ARTIFACT_WORDS =
  /\b(screenshot|summary\.json|rendered|before\/after|before and after|failure log|log|diff|commit|sha|hash|receipt|trace|artifact|contact sheet|browser|playwright|lighthouse)\b/i;
const TRANSFER_WORDS =
  /\b(use this|ask this|copy|checklist|review|decision|matrix|template|run this|before accepting|reject|accept|good answer|bad answer)\b/i;
const VOICE_WORDS =
  /\b(the rule|the point|the useful|the dangerous|the practical|that is why|this is why|the better question|the second sentence|less smooth|trust)\b/i;

function parseArgs(argv) {
  const args = {
    blogDir: DEFAULT_BLOG_DIR,
    output: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--blog-dir") args.blogDir = argv[++index] ?? args.blogDir;
    else if (arg === "--output") args.output = argv[++index] ?? "";
    else if (arg === "--help") {
      process.stdout.write(
        "Usage: node scripts/audit-reference-ceiling.mjs [--blog-dir <dir>] [--output <json>]\n",
      );
      process.exit(0);
    }
  }

  return args;
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

function stripMarkdown(markdown) {
  return markdown
    .replace(CODE_FENCE, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, " ")
    .replace(/^#{1,6}\s+.+$/gm, " ")
    .replace(/[`*_>#|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(text) {
  const clean = stripMarkdown(text);
  if (!clean) return [];
  return clean.split(/\s+/).filter(Boolean);
}

function firstWords(body, count) {
  return words(body).slice(0, count).join(" ");
}

function countMatches(text, pattern) {
  return (text.match(pattern) ?? []).length;
}

function hasHeading(body, pattern) {
  return [...body.matchAll(/^##\s+(.+)$/gm)].some(match => pattern.test(match[1]));
}

function scoreOpeningScene(body) {
  const intro = firstWords(body, 220);
  const findings = [];
  let score = 0;

  if (SCENE_WORDS.test(intro)) score += 6;
  else findings.push("opening lacks a visible scene or action verb");

  if (STAKE_WORDS.test(intro)) score += 5;
  else findings.push("opening does not make the stakes felt quickly");

  if (DATE_OR_RECEIPT.test(intro) || /\b(Vercel|Coolify|MCP|DESIGN\.md|Pagefind|Chrome|GitHub|Warden)\b/.test(intro)) {
    score += 4;
  } else {
    findings.push("opening needs a named system, date, count, command, or artifact");
  }

  if (/\bI\b|\bwe\b|\bthis site\b|\bthe repo\b|\bthe agent\b/i.test(intro)) score += 3;
  else findings.push("opening feels detached from a specific operator or system");

  if (/\bbut\b|\bexcept\b|\binstead\b|\bnot\b|\bwrong\b|\bhidden\b/i.test(intro)) score += 2;
  else findings.push("opening lacks tension or contradiction");

  return { score, max: 20, findings };
}

function scoreOriginalArtifacts(body) {
  const codeBlocks = countMatches(body, CODE_FENCE);
  const inlineCode = countMatches(body, INLINE_CODE);
  const findings = [];
  let score = 0;

  if (ARTIFACT_WORDS.test(body)) score += 6;
  else findings.push("does not name enough real artifacts such as screenshots, diffs, logs, receipts, or rendered summaries");

  if (/\b(before\/after|before and after|failed before|worked after|moved from|replaced|old|new)\b/i.test(body)) score += 5;
  else findings.push("missing before/after contrast");

  if (/\b(summary\.json|screenshot|rendered|playwright|browser|lighthouse|contact sheet)\b/i.test(body)) score += 5;
  else findings.push("missing screenshot/rendered/browser artifact evidence");

  if (/\b(commit|sha|hash|approval|records|viewports|pages|words|files|routes)\b/i.test(body)) score += 4;
  else findings.push("missing measurable receipt language");

  if (codeBlocks >= 2) score += 3;
  else findings.push("needs at least two code/log/command blocks for dense technical reading");

  if (inlineCode >= 8) score += 2;
  else findings.push("needs more inline file paths, commands, config keys, or artifact names");

  return { score, max: 25, findings };
}

function scoreReaderTransfer(body) {
  const findings = [];
  let score = 0;

  if (TRANSFER_WORDS.test(body)) score += 6;
  else findings.push("reader does not get a directly reusable action");

  if (TABLE_ROW.test(body)) score += 5;
  else findings.push("no decision table or matrix");

  if (hasHeading(body, /\b(Checklist|Decision|Review|Verdict|Rule|Matrix|Template|Questions?)\b/i)) score += 4;
  else findings.push("no named reader-transfer section");

  if (/\b(good answer|bad answer|accept|reject|before accepting|do not accept|use this when)\b/i.test(body)) score += 3;
  else findings.push("transfer artifact does not clearly say what to accept or reject");

  if (CODE_FENCE.test(body)) score += 2;
  else findings.push("no copyable command/prompt/checklist block");

  return { score, max: 20, findings };
}

function scoreVoice(body) {
  const paragraphs = body
    .split(/\r?\n\r?\n/)
    .map(paragraph => stripMarkdown(paragraph))
    .filter(Boolean);
  const longParagraphs = paragraphs.filter(paragraph => words(paragraph).length > 85).length;
  const findings = [];
  let score = 0;

  if (VOICE_WORDS.test(body)) score += 6;
  else findings.push("needs more quotable judgment lines");

  if (/\bnot .*\. .*not\b|\btoo broad\b|\bless smooth\b|\bwrong standard\b|\bhidden contract\b/i.test(body)) score += 4;
  else findings.push("voice lacks compression or contrast");

  if (longParagraphs === 0) score += 4;
  else findings.push(`${longParagraphs} paragraph(s) are too long for scanner-first reading`);

  if (words(body).length >= 900) score += 3;
  else findings.push("piece is short for a strong reference essay");

  if (/^##\s+.+$/gm.test(body) && countMatches(body, /^##\s+.+$/gm) >= 6) score += 3;
  else findings.push("needs more section-level rhythm");

  return { score, max: 20, findings };
}

function scoreVisualProof(body, slug) {
  const images = [...body.matchAll(MARKDOWN_IMAGE)].map(match => match[1].trim());
  const findings = [];
  let score = 0;

  if (images[0] === `/images/posts/${slug}.png`) score += 4;
  else findings.push("body image does not match slug-specific public image contract");

  if (/\b(screenshot|rendered|browser|summary\.json|contact sheet|before\/after|failure log|diagram)\b/i.test(body)) score += 5;
  else findings.push("visual proof is not tied to a rendered artifact, screenshot, diagram, or failure log");

  if (/\b(first-screen|desktop|mobile|viewports|1200x630|image contract|ogImage)\b/i.test(body)) score += 3;
  else findings.push("visual proof lacks render/device/image-contract detail");

  if (images.length === 1) score += 3;
  else findings.push(`expected exactly one public body image under current contract, got ${images.length}`);

  return { score, max: 15, findings };
}

function scorePost(file, text) {
  const { frontmatter, body } = parseMarkdown(text);
  const slug = basename(file, ".md");
  const title = getFrontmatterValue(frontmatter, "title");
  const series = getFrontmatterValue(frontmatter, "series");

  if (series === "About") {
    return {
      file,
      slug,
      title,
      series,
      skipped: true,
      reason: "About pages are not scored by the reference ceiling audit.",
    };
  }

  const dimensions = {
    openingScene: scoreOpeningScene(body),
    originalArtifacts: scoreOriginalArtifacts(body),
    readerTransfer: scoreReaderTransfer(body),
    voice: scoreVoice(body),
    visualProof: scoreVisualProof(body, slug),
  };
  const score = Object.values(dimensions).reduce((sum, item) => sum + item.score, 0);
  const ceilingGaps = Object.entries(dimensions)
    .flatMap(([name, item]) => item.findings.map(finding => `${name}: ${finding}`))
    .slice(0, 8);

  return {
    file,
    slug,
    title,
    series,
    skipped: false,
    wordCount: words(body).length,
    score,
    grade: score >= 88 ? "reference-ceiling" : score >= 76 ? "strong-but-thin" : score >= 62 ? "needs-artifacts" : "not-reference-grade",
    ceilingGaps,
    dimensions,
  };
}

async function collectPosts(blogDir) {
  const files = (await readdir(blogDir))
    .filter(file => file.endsWith(".md"))
    .sort();
  const posts = [];
  for (const file of files) {
    const text = await readFile(join(blogDir, file), "utf8");
    const { frontmatter } = parseMarkdown(text);
    if (isDraft(frontmatter)) continue;
    posts.push(scorePost(file, text));
  }
  return posts;
}

function summarize(posts, args) {
  const scored = posts.filter(post => !post.skipped);
  const averageScore = scored.length
    ? Math.round(scored.reduce((sum, post) => sum + post.score, 0) / scored.length)
    : 0;

  return {
    generatedAt: new Date().toISOString(),
    blogDir: resolve(args.blogDir),
    postsChecked: scored.length,
    postsSkipped: posts.filter(post => post.skipped).length,
    averageScore,
    weakestPosts: [...scored]
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map(post => ({
        slug: post.slug,
        score: post.score,
        grade: post.grade,
        ceilingGaps: post.ceilingGaps,
      })),
    posts,
  };
}

async function maybeWriteReport(output, summary) {
  if (!output) return;
  const target = resolve(output);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  process.stdout.write(`reference_ceiling_report=${target}\n`);
}

function printSummary(summary) {
  process.stdout.write(`reference_ceiling_posts_checked=${summary.postsChecked}\n`);
  process.stdout.write(`reference_ceiling_posts_skipped=${summary.postsSkipped}\n`);
  process.stdout.write(`reference_ceiling_average_score=${summary.averageScore}\n`);
  for (const post of summary.weakestPosts) {
    process.stdout.write(`reference_ceiling_weakest=${post.slug} score=${post.score} grade=${post.grade}\n`);
  }
  process.stdout.write("reference_ceiling_gate=report_only\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!existsSync(args.blogDir)) {
    throw new Error(`blog directory not found: ${args.blogDir}`);
  }

  const posts = await collectPosts(args.blogDir);
  const summary = summarize(posts, args);
  await maybeWriteReport(args.output, summary);
  printSummary(summary);
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";

const CODE_FENCE = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`\n]+`/g;
const MARKDOWN_IMAGE = /!\[([^\]]*)]\(([^)]+)\)/g;
const PATH_OR_ARTIFACT =
  /\b(?:src\/|scripts\/|dist\/|F:\\|\.json\b|\.md\b|\.html\b|\.png\b|\.webp\b|summary\.json|manifest|approval|queue|packet|artifact)\b/i;
const HASH_OR_DATE =
  /\b(?:20\d{2}-\d{2}-\d{2}|[a-f0-9]{7,64}|[A-F0-9]{16,64})\b/;
const COUNT_OR_METRIC =
  /\b\d+(?:\.\d+)?\s*(?:ms|s|%|px|routes|posts|pages|words|files|checks|viewports|screenshots|images|records|items|commits|sources|tokens|dollars|clicks)\b/i;
const ACTION_VERBS =
  /\b(opened|ran|checked|failed|passed|caught|found|compared|rewrote|removed|pushed|committed|rendered|captured|verified|queued|approved|rejected|watched|clicked)\b/i;
const NAMED_SYSTEM =
  /\b(Codex|Claude|Vercel|MCP|DESIGN\.md|Stitch|Pagefind|Astro|GitHub|Warden|Lighthouse|Playwright|Chrome|Vibecode|musu\.pro|Supabase|Hostinger|direnv|LiteLLM|mitmproxy|inspect-ai)\b/i;
const STAKES =
  /\b(trust|risk|reader|approval|publish|production|customer|money|cost|security|leak|failure|rollback|handoff|domain|index|ranking|quality|evidence)\b/i;
const CONTRAST =
  /\b(but|except|instead|not|wrong|hidden|looked fine|failed|green.*red|passed.*failed|before|after|the problem)\b/i;
const PROOF_WORDS =
  /\b(screenshot|rendered|first-screen|contact sheet|failure log|trace|diff|before\/after|before and after|commit|hash|receipt|artifact|summary\.json|browser|viewports|console|lighthouse|playwright)\b/i;
const PAYOFF_WORDS =
  /\b(so what|why this matters|that is why|the point|the move|use this|copy this|ask this|before you accept|reject|accept|checklist|decision|template|matrix|what to do)\b/i;
const HYPE_WORDS =
  /\b(game[- ]changer|revolutionary|unlock|supercharge|10x|mind[- ]blowing|insane|amazing|seamless|effortless|ultimate|powerful)\b/i;

function parseArgs(argv) {
  const args = {
    blogDir: DEFAULT_BLOG_DIR,
    output: "",
    strict: false,
    minCandidateScore: 104,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--blog-dir") args.blogDir = argv[++index] ?? args.blogDir;
    else if (arg === "--output") args.output = argv[++index] ?? "";
    else if (arg === "--strict") args.strict = true;
    else if (arg === "--min-candidate-score") {
      args.minCandidateScore = Number.parseInt(argv[++index] ?? String(args.minCandidateScore), 10);
    } else if (arg === "--help") {
      process.stdout.write(
        [
          "Usage: node scripts/audit-reference-blogger-ceiling.mjs [--blog-dir <dir>] [--output <json>] [--strict]",
          "",
          "Report-only by default. --strict fails if any public article is below --min-candidate-score.",
        ].join("\n"),
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

function isDraft(frontmatter) {
  return /^draft:\s*true\s*$/m.test(frontmatter);
}

function getFrontmatterValue(frontmatter, name) {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
  if (!match) return "";
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function countReferences(frontmatter) {
  if (!/^references:\s*$/m.test(frontmatter)) return 0;
  return (frontmatter.match(/^\s*-\s+name:/gm) ?? []).length;
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

function headings(body) {
  return [...body.matchAll(/^##\s+(.+)$/gm)].map(match => match[1].trim());
}

function paragraphWordCounts(body) {
  return body
    .split(/\r?\n\r?\n/)
    .map(paragraph => words(paragraph).length)
    .filter(count => count > 0);
}

function hasNear(text, leftPattern, rightPattern, window = 220) {
  for (const match of text.matchAll(leftPattern)) {
    const start = Math.max(0, match.index - window);
    const end = Math.min(text.length, match.index + match[0].length + window);
    if (rightPattern.test(text.slice(start, end))) return true;
  }
  return false;
}

function dimension(score, max, findings, signals = []) {
  return { score: Math.min(score, max), max, findings, signals };
}

function scoreReportedScene(body) {
  const intro = firstWords(body, 260);
  const rawIntro = body.slice(0, 1600);
  const findings = [];
  const signals = [];
  let score = 0;

  if (ACTION_VERBS.test(intro)) {
    score += 4;
    signals.push("opening shows an operator action");
  } else findings.push("opening does not start from an operator action or failure");

  if (NAMED_SYSTEM.test(intro)) {
    score += 4;
    signals.push("opening names a concrete system");
  } else findings.push("opening needs a named system, tool, repo, or surface");

  if (HASH_OR_DATE.test(rawIntro) || COUNT_OR_METRIC.test(rawIntro)) {
    score += 4;
    signals.push("opening carries a dated or counted receipt");
  } else findings.push("opening lacks a date, hash, count, or measurable receipt");

  if (STAKES.test(intro)) {
    score += 3;
    signals.push("stakes arrive early");
  } else findings.push("opening does not answer why the reader should care fast enough");

  if (CONTRAST.test(intro)) {
    score += 3;
    signals.push("opening has tension");
  } else findings.push("opening lacks contradiction, failure, or before/after tension");

  return dimension(score, 18, findings, signals);
}

function scoreEvidenceDensity(body, frontmatter) {
  const codeBlocks = countMatches(body, CODE_FENCE);
  const inlineCode = countMatches(body, INLINE_CODE);
  const referenceCount = countReferences(frontmatter);
  const findings = [];
  const signals = [];
  let score = 0;

  if (PATH_OR_ARTIFACT.test(body)) {
    score += 5;
    signals.push("names source or artifact paths");
  } else findings.push("too few file paths, artifact names, queues, or specs");

  if (HASH_OR_DATE.test(body)) {
    score += 4;
    signals.push("uses dated or hashed receipts");
  } else findings.push("missing date/hash receipts beyond general claims");

  if (COUNT_OR_METRIC.test(body)) {
    score += 4;
    signals.push("uses counted evidence");
  } else findings.push("missing counts, timings, route totals, scores, or result numbers");

  if (codeBlocks >= 2) {
    score += 3;
    signals.push("has multiple copyable/log blocks");
  } else findings.push("needs at least two command/log/config blocks for technical density");

  if (inlineCode >= 10) {
    score += 2;
    signals.push("has dense inline technical anchors");
  } else findings.push("needs more inline commands, paths, config keys, or artifact names");

  if (referenceCount >= 2) {
    score += 2;
    signals.push(`${referenceCount} frontmatter references`);
  } else findings.push("needs multiple source references when making a broader claim");

  return dimension(score, 20, findings, signals);
}

function scoreInlineProofFit(body, slug) {
  const images = [...body.matchAll(MARKDOWN_IMAGE)].map(match => ({
    alt: match[1],
    src: match[2],
    index: match.index ?? 0,
  }));
  const findings = [];
  const signals = [];
  let score = 0;

  if (images.length === 1 && images[0].src === `/images/posts/${slug}.png`) {
    score += 4;
    signals.push("uses exactly one slug-matched post image");
  } else {
    findings.push(`expected exactly one slug-matched image, got ${images.length}`);
  }

  if (PROOF_WORDS.test(body)) {
    score += 4;
    signals.push("body names proof objects");
  } else findings.push("image/prose is not tied to screenshot, rendered proof, log, diff, or receipt");

  if (images.some(image => PROOF_WORDS.test(image.alt))) {
    score += 3;
    signals.push("image alt text describes proof");
  } else findings.push("image alt text does not read like a proof object");

  if (hasNear(body, MARKDOWN_IMAGE, PROOF_WORDS, 260)) {
    score += 4;
    signals.push("proof language appears near the image");
  } else findings.push("the image is not explained near the visual slot");

  if (/\b(before\/after|before and after|before:|after:|old|new|failed before|passed after)\b/i.test(body)) {
    score += 3;
    signals.push("has before/after evidence");
  } else findings.push("needs a concrete before/after contrast, not only a principle");

  return dimension(score, 18, findings, signals);
}

function scoreReferenceContrast(body, frontmatter) {
  const referenceCount = countReferences(frontmatter);
  const findings = [];
  const signals = [];
  let score = 0;

  if (referenceCount >= 3) {
    score += 4;
    signals.push("has three or more source references");
  } else findings.push("needs enough references to compare against, not just cite");

  if (/\b(compare|compared|reference|benchmark|against|unlike|whereas|the better version|the weaker version)\b/i.test(body)) {
    score += 4;
    signals.push("explicitly compares standards");
  } else findings.push("does not compare the claim against a stronger outside standard");

  if (/\b(they get right|what works|what fails|the mistake|the stronger pattern|the weaker pattern)\b/i.test(body)) {
    score += 3;
    signals.push("extracts a reference function");
  } else findings.push("references are not converted into a reusable writing/product function");

  if (!HYPE_WORDS.test(body)) {
    score += 3;
    signals.push("avoids hype vocabulary");
  } else findings.push("hype words weaken the field-log tone");

  return dimension(score, 14, findings, signals);
}

function scoreReaderPayoff(body) {
  const foundHeadings = headings(body);
  const findings = [];
  const signals = [];
  let score = 0;

  if (PAYOFF_WORDS.test(body)) {
    score += 4;
    signals.push("states reader payoff");
  } else findings.push("reader payoff is implied instead of stated");

  if (foundHeadings.some(heading => /\b(Checklist|Decision|Rule|Matrix|Template|Questions|Use|Verdict|Next)\b/i.test(heading))) {
    score += 4;
    signals.push("has a named transfer section");
  } else findings.push("needs a named checklist, decision, template, or verdict section");

  if (/^\|.+\|$/m.test(body)) {
    score += 3;
    signals.push("has a table/matrix");
  } else findings.push("needs a scannable decision table or matrix");

  if (/\b(good answer|bad answer|accept|reject|do not accept|before you ship|before publishing)\b/i.test(body)) {
    score += 3;
    signals.push("gives accept/reject criteria");
  } else findings.push("needs accept/reject criteria instead of only explanation");

  if (/\b(Monday|next time|before the next|run this|copy this|paste this|turn this into)\b/i.test(body)) {
    score += 2;
    signals.push("contains a next-use instruction");
  } else findings.push("does not tell the reader what to do next");

  return dimension(score, 16, findings, signals);
}

function scoreVoiceAndRhythm(body) {
  const counts = paragraphWordCounts(body);
  const longParagraphs = counts.filter(count => count > 95).length;
  const veryShortParagraphs = counts.filter(count => count <= 18).length;
  const findingPrefix = longParagraphs === 1 ? "1 paragraph is" : `${longParagraphs} paragraphs are`;
  const findings = [];
  const signals = [];
  let score = 0;

  if (/\b(The rule|The point|The trick|The useful|The danger|The expensive part|The boring answer|The wrong standard)\b/i.test(body)) {
    score += 4;
    signals.push("has compressed judgment lines");
  } else findings.push("needs more quotable judgment lines");

  if (/\bnot .{0,80}\bbut\b|\bnot .{0,80}\binstead\b|\bthe problem (?:is|was)\b|\bthe mistake (?:is|was)\b/i.test(body)) {
    score += 3;
    signals.push("has contrastive phrasing");
  } else findings.push("voice lacks memorable contrast");

  if (longParagraphs === 0) {
    score += 3;
    signals.push("paragraphs are scanner-friendly");
  } else findings.push(`${findingPrefix} too long for a high-retention blog read`);

  if (veryShortParagraphs >= 2) {
    score += 2;
    signals.push("uses short breath paragraphs");
  } else findings.push("needs more short breath paragraphs after dense evidence");

  if (countMatches(body, /^##\s+.+$/gm) >= 5) {
    score += 2;
    signals.push("has section rhythm");
  } else findings.push("needs more section-level rhythm");

  if (words(body).length >= 1000 && words(body).length <= 2600) {
    score += 2;
    signals.push("length fits a strong technical blog essay");
  } else findings.push("length is outside the current target range for a reference blogger post");

  return dimension(score, 16, findings, signals);
}

function scoreBoundaryTaste(body) {
  const findings = [];
  const signals = [];
  let score = 0;

  if (/\b(does not mean|doesn't mean|not proof of|cannot prove|not enough|boundary|limit|caveat)\b/i.test(body)) {
    score += 4;
    signals.push("states a boundary");
  } else findings.push("needs a boundary so evidence does not sound overclaimed");

  if (/\b(I would not|do not|don't|avoid|never|unless|only when|stop)\b/i.test(body)) {
    score += 3;
    signals.push("has taste constraints");
  } else findings.push("needs clearer taste constraints");

  if (/\b(reject|block|fail|red flag|do not ship|not ready)\b/i.test(body)) {
    score += 3;
    signals.push("has rejection criteria");
  } else findings.push("needs rejection criteria for weak work");

  return dimension(score, 10, findings, signals);
}

function gradeFor(score, candidateThreshold) {
  if (score >= candidateThreshold) return "reference-blogger-candidate";
  if (score >= 86) return "strong-operating-essay";
  if (score >= 70) return "needs-reported-scene";
  return "not-blogger-grade";
}

function revisionPriority(dimensions) {
  return Object.entries(dimensions)
    .map(([name, item]) => ({
      dimension: name,
      score: item.score,
      max: item.max,
      missing: item.findings.slice(0, 3),
    }))
    .sort((a, b) => a.score / a.max - b.score / b.max)
    .slice(0, 3);
}

function scorePost(file, text, candidateThreshold) {
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
      reason: "About pages are not scored by the reference-blogger ceiling audit.",
    };
  }

  const dimensions = {
    reportedScene: scoreReportedScene(body),
    evidenceDensity: scoreEvidenceDensity(body, frontmatter),
    inlineProofFit: scoreInlineProofFit(body, slug),
    referenceContrast: scoreReferenceContrast(body, frontmatter),
    readerPayoff: scoreReaderPayoff(body),
    voiceAndRhythm: scoreVoiceAndRhythm(body),
    boundaryTaste: scoreBoundaryTaste(body),
  };
  const score = Object.values(dimensions).reduce((sum, item) => sum + item.score, 0);
  const ceilingGaps = revisionPriority(dimensions).flatMap(item =>
    item.missing.map(missing => `${item.dimension}: ${missing}`),
  );
  const strongestSignals = Object.values(dimensions)
    .flatMap(item => item.signals)
    .slice(0, 8);

  return {
    file,
    slug,
    title,
    series,
    skipped: false,
    wordCount: words(body).length,
    score,
    maxScore: 112,
    grade: gradeFor(score, candidateThreshold),
    ceilingGaps,
    strongestSignals,
    revisionPriority: revisionPriority(dimensions),
    dimensions,
  };
}

async function collectPosts(blogDir, candidateThreshold) {
  const files = (await readdir(blogDir)).filter(file => file.endsWith(".md")).sort();
  const posts = [];
  for (const file of files) {
    const text = await readFile(join(blogDir, file), "utf8");
    const { frontmatter } = parseMarkdown(text);
    if (isDraft(frontmatter)) continue;
    posts.push(scorePost(file, text, candidateThreshold));
  }
  return posts;
}

function summarize(posts, args) {
  const scored = posts.filter(post => !post.skipped);
  const averageScore = scored.length
    ? Math.round(scored.reduce((sum, post) => sum + post.score, 0) / scored.length)
    : 0;
  const candidates = scored.filter(post => post.grade === "reference-blogger-candidate");
  const revisionQueue = [...scored]
    .filter(post => post.grade !== "reference-blogger-candidate")
    .sort((a, b) => a.score - b.score)
    .slice(0, 10)
    .map(post => ({
      slug: post.slug,
      score: post.score,
      grade: post.grade,
      firstFixes: post.revisionPriority,
    }));

  return {
    generatedAt: new Date().toISOString(),
    blogDir: resolve(args.blogDir),
    mode: args.strict ? "strict" : "report_only",
    candidateThreshold: args.minCandidateScore,
    postsChecked: scored.length,
    postsSkipped: posts.filter(post => post.skipped).length,
    averageScore,
    candidateCount: candidates.length,
    candidateSlugs: candidates.map(post => post.slug),
    revisionQueue,
    posts,
  };
}

async function maybeWriteReport(output, summary) {
  if (!output) return;
  const target = resolve(output);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  process.stdout.write(`reference_blogger_ceiling_report=${target}\n`);
}

function printSummary(summary) {
  process.stdout.write(`reference_blogger_ceiling_posts_checked=${summary.postsChecked}\n`);
  process.stdout.write(`reference_blogger_ceiling_posts_skipped=${summary.postsSkipped}\n`);
  process.stdout.write(`reference_blogger_ceiling_average_score=${summary.averageScore}\n`);
  process.stdout.write(`reference_blogger_ceiling_candidate_count=${summary.candidateCount}\n`);
  for (const item of summary.revisionQueue.slice(0, 5)) {
    process.stdout.write(
      `reference_blogger_ceiling_revision=${item.slug} score=${item.score} grade=${item.grade}\n`,
    );
  }
  process.stdout.write(
    `reference_blogger_ceiling_gate=${summary.mode === "strict" ? "strict" : "report_only"}\n`,
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!Number.isFinite(args.minCandidateScore)) {
    throw new Error("--min-candidate-score must be a number");
  }
  if (!existsSync(args.blogDir)) {
    throw new Error(`blog directory not found: ${args.blogDir}`);
  }

  const posts = await collectPosts(args.blogDir, args.minCandidateScore);
  const summary = summarize(posts, args);
  await maybeWriteReport(args.output, summary);
  printSummary(summary);

  if (args.strict && summary.revisionQueue.length > 0) {
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

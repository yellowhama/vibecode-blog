import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";

const WEAK_PHRASES = [
  "game changer",
  "revolutionary",
  "amazing",
  "insane",
  "beautiful",
  "powerful",
  "seamless",
  "robust",
  "world-class",
  "high-quality",
  "cutting-edge",
  "unlock",
  "leverage",
  "supercharge",
];

const PROBLEM_WORDS =
  /\b(problem|failure|failed|break|broken|risk|dangerous|bottleneck|lost|leak|wrong|hidden|unsafe|gap|waste|confused|slop|cost|missed|blocked)\b/i;
const WHY_WORDS =
  /\b(because|matters|means|costs|trust|money|time|reader|public|operator|production|proof|evidence|review|deploy|security|data)\b/i;
const PROMISE_WORDS =
  /\b(decision|rule|use|switch|check|verify|reject|fix|keep|write|audit|route|ship|publish|review|start|stop|contract|checklist)\b/i;
const SPECIFICITY_WORDS =
  /\b(commit|sha|hash|npm|node|chrome|vercel|coolify|astro|mcp|design\.md|html|markdown|pagefind|lighthouse|supabase|github|browser|screenshot|json|csv|http|api|cli|diff|log|route|schema|migration)\b/i;
const MECHANISM_HEADINGS =
  /^##\s+.*\b(How|Mechanism|Workflow|Control Surface|Failure Mode|Broken System|Contract|Loop|Architecture|Pipeline|Stack|Model|What Changed|Where .* Changes)\b.*$/im;
const ARTIFACT_HEADINGS =
  /^##\s+.*\b(Checklist|Prompt Pattern|Decision Matrix|Reader Decision|Technical Verdict|Template|Contract|Control Surface|Export Rule|Table|Runbook)\b.*$/im;
const BOUNDARY_HEADINGS =
  /^##\s+.*\b(Boundary|What This Does Not Prove|Where This Breaks|Caveat|Limits|Failure Boundary|Not Enough)\b.*$/im;
const MARKDOWN_IMAGE = /!\[[^\]]+]\(([^)]+)\)/g;
const CODE_FENCE = /```[\s\S]*?```/g;
const TABLE_ROW = /^\|.+\|$/m;
const INLINE_CODE = /`[^`\n]+`/g;
const DATE_OR_NUMBER = /\b(?:20\d{2}-\d{2}-\d{2}|20\d{2}|[a-f0-9]{7,64}|\d+(?:\.\d+)?(?:%|x|ms|s|sec|seconds|pages|posts|screenshots|records|files|words|clicks|requests|routes|viewports)?)\b/i;

function parseArgs(argv) {
  const args = {
    blogDir: DEFAULT_BLOG_DIR,
    output: "",
    strict: false,
    minScore: 78,
    minAverage: 82,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--blog-dir") args.blogDir = argv[++index] ?? args.blogDir;
    else if (arg === "--output") args.output = argv[++index] ?? "";
    else if (arg === "--strict") args.strict = true;
    else if (arg === "--min-score") args.minScore = Number(argv[++index] ?? args.minScore);
    else if (arg === "--min-average") args.minAverage = Number(argv[++index] ?? args.minAverage);
    else if (arg === "--help") {
      process.stdout.write(`Usage: node scripts/audit-reference-writing.mjs [--blog-dir <dir>] [--output <json>] [--strict] [--min-score <n>] [--min-average <n>]\n`);
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

function getReferenceCount(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  const start = lines.findIndex(line => /^references:\s*$/.test(line));
  if (start === -1) return 0;

  let count = 0;
  for (const line of lines.slice(start + 1)) {
    if (/^[A-Za-z][\w-]*:\s*/.test(line)) break;
    if (/^\s*-\s+name:\s*/.test(line)) count += 1;
  }
  return count;
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
  return stripMarkdown(text).split(/\s+/).filter(Boolean);
}

function firstWords(body, count) {
  return words(body).slice(0, count).join(" ");
}

function sectionHeadings(body) {
  return [...body.matchAll(/^##\s+(.+)$/gm)].map(match => match[1].trim());
}

function countMatches(text, pattern) {
  return (text.match(pattern) ?? []).length;
}

function scoreLead(body, description) {
  const intro = firstWords(body, 150);
  const findings = [];
  let score = 0;

  if (PROBLEM_WORDS.test(intro)) score += 7;
  else findings.push("first 150 words do not clearly name pain, failure, risk, or contradiction");

  if (WHY_WORDS.test(`${description} ${intro}`)) score += 6;
  else findings.push("first 150 words do not show why the issue matters");

  if (PROMISE_WORDS.test(`${description} ${intro}`)) score += 5;
  else findings.push("first 150 words do not promise a reader decision, rule, or action");

  if (SPECIFICITY_WORDS.test(intro) || DATE_OR_NUMBER.test(intro)) score += 2;
  else findings.push("opening is not specific enough; add a named tool, date, command, artifact, or number");

  return { score, max: 20, findings };
}

function scoreEvidence(frontmatter, body) {
  const referenceCount = getReferenceCount(frontmatter);
  const codeBlocks = countMatches(body, CODE_FENCE);
  const inlineCode = countMatches(body, INLINE_CODE);
  const hasTable = TABLE_ROW.test(body);
  const hasNumbers = DATE_OR_NUMBER.test(body);
  const findings = [];
  let score = 0;

  if (referenceCount >= 1) score += 5;
  else findings.push("missing frontmatter source reference");

  if (referenceCount >= 2) score += 2;
  else findings.push("only one or zero references; reference-grade posts usually compare more than one source or one source plus first-party evidence");

  if (codeBlocks >= 1 || hasTable) score += 5;
  else findings.push("no code block, log block, command block, or table");

  if (inlineCode >= 4) score += 3;
  else findings.push("too few concrete inline artifacts such as commands, files, paths, hashes, or config keys");

  if (hasNumbers) score += 4;
  else findings.push("no dates, counts, hashes, percentages, versions, or measurable receipt");

  if (/field receipt|receipt|evidence|screenshot|summary\.json|commit|sha|approval|rendered|audit/i.test(body)) score += 1;
  else findings.push("does not name a receipt or audit artifact");

  return { score, max: 20, findings };
}

function scoreMechanism(body) {
  const headings = sectionHeadings(body);
  const findings = [];
  let score = 0;

  if (MECHANISM_HEADINGS.test(body)) score += 7;
  else findings.push("no mechanism section; explain how the system or failure actually works");

  if (headings.length >= 4) score += 3;
  else findings.push("too few scannable sections for a technical reader");

  if (/->|=>|workflow|pipeline|lifecycle|step|loop|state|route|input|output|boundary/i.test(body)) score += 3;
  else findings.push("mechanism lacks sequence, state, or input/output language");

  if (CODE_FENCE.test(body) || TABLE_ROW.test(body)) score += 2;
  else findings.push("mechanism is not supported by code, table, log, or structured artifact");

  return { score, max: 15, findings };
}

function scoreArtifact(body) {
  const findings = [];
  let score = 0;

  if (ARTIFACT_HEADINGS.test(body)) score += 5;
  else findings.push("no named reusable artifact section such as checklist, prompt pattern, decision matrix, or technical verdict");

  if (CODE_FENCE.test(body)) score += 4;
  else findings.push("no copyable block for the reader to reuse");

  if (TABLE_ROW.test(body)) score += 3;
  else findings.push("no table or matrix that compresses the decision");

  if (/before the next|use this|ask for|verify|run|checklist|template|copy|decide|reader/i.test(body)) score += 3;
  else findings.push("artifact does not translate into a concrete reader action");

  return { score, max: 15, findings };
}

function scoreBoundary(body) {
  const findings = [];
  let score = 0;

  if (BOUNDARY_HEADINGS.test(body)) score += 6;
  else findings.push("missing boundary section that says what the post does not prove");

  if (/does not prove|doesn't prove|not enough|fails when|breaks when|accepted boundary|hidden failure|caveat|limit/i.test(body)) score += 4;
  else findings.push("boundary is not explicit enough");

  return { score, max: 10, findings };
}

function scoreVoiceAndScan(body, combined) {
  const readable = stripMarkdown(body);
  const paragraphs = body
    .split(/\r?\n\r?\n/)
    .map(paragraph => stripMarkdown(paragraph))
    .filter(Boolean);
  const longParagraphs = paragraphs.filter(paragraph => words(paragraph).length > 90).length;
  const headings = sectionHeadings(body);
  const weakHits = WEAK_PHRASES.filter(phrase =>
    new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(combined),
  );
  const findings = [];
  let score = 0;

  if (words(readable).length >= 700) score += 2;
  else findings.push("post is probably too short for reference-grade technical argument");

  if (longParagraphs === 0) score += 2;
  else findings.push(`${longParagraphs} paragraph(s) exceed 90 words; scanners will skip them`);

  if (headings.length >= 5) score += 2;
  else findings.push("needs more meaningful section headings for scanner-first reading");

  if (weakHits.length === 0) score += 2;
  else findings.push(`weak/hype phrases found: ${weakHits.join(", ")}`);

  if (/\b(the rule|the useful|the practical|the decision|the fix|the point|that is the)\b/i.test(body)) score += 2;
  else findings.push("voice lacks a memorable, quotable judgment line");

  return { score, max: 10, findings };
}

function scoreVisual(body, slug) {
  const images = [...body.matchAll(MARKDOWN_IMAGE)].map(match => match[1].trim());
  const findings = [];
  let score = 0;

  if (images.length === 1) score += 3;
  else findings.push(`expected exactly one body image, got ${images.length}`);

  if (images[0] === `/images/posts/${slug}.png`) score += 2;
  else findings.push("image path does not match slug-specific contract");

  if (/diagram|matrix|workflow|loop|contract|surface|receipt|table|screenshot|before\/after|annotated/i.test(body)) score += 3;
  else findings.push("image/artifact function is unclear; make the visual prove or compress something");

  if (/screenshot|rendered|before\/after|summary\.json|contact sheet|annotated|diagram/i.test(body)) score += 2;
  else findings.push("post does not connect visual proof to a screenshot, rendered artifact, or explanatory diagram");

  return { score, max: 10, findings };
}

function scorePost(file, text) {
  const { frontmatter, body } = parseMarkdown(text);
  const slug = basename(file, ".md");
  const title = getFrontmatterValue(frontmatter, "title");
  const description = getFrontmatterValue(frontmatter, "description");
  const series = getFrontmatterValue(frontmatter, "series");
  const combined = `${frontmatter}\n${body}`;
  const bodyWords = words(body).length;

  if (series === "About") {
    return {
      file,
      slug,
      title,
      series,
      skipped: true,
      reason: "About pages are not scored as reference blogger articles.",
    };
  }

  const dimensions = {
    lead: scoreLead(body, description),
    evidence: scoreEvidence(frontmatter, body),
    mechanism: scoreMechanism(body),
    artifact: scoreArtifact(body),
    boundary: scoreBoundary(body),
    voiceAndScan: scoreVoiceAndScan(body, combined),
    visual: scoreVisual(body, slug),
  };

  const score = Object.values(dimensions).reduce((sum, item) => sum + item.score, 0);
  const blockers = [];

  if (dimensions.lead.score < 14) blockers.push("weak opening: first 150 words do not carry pain, stakes, and promise");
  if (dimensions.evidence.score < 13) blockers.push("low evidence density");
  if (dimensions.artifact.score < 9) blockers.push("missing or weak reusable reader artifact");
  if (dimensions.boundary.score < 8) blockers.push("missing explicit boundary/caveat");
  if (dimensions.visual.score < 7) blockers.push("visual is present but not doing enough explanatory/proof work");

  return {
    file,
    slug,
    title,
    series,
    skipped: false,
    wordCount: bodyWords,
    referenceCount: getReferenceCount(frontmatter),
    score,
    grade: score >= 88 ? "reference-ready" : score >= 78 ? "rewrite-light" : score >= 65 ? "rewrite-required" : "blocker-rewrite",
    blockers,
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
  const belowMinimum = scored.filter(post => post.score < args.minScore);
  const withBlockers = scored.filter(post => post.blockers.length > 0);

  return {
    generatedAt: new Date().toISOString(),
    blogDir: resolve(args.blogDir),
    strict: args.strict,
    thresholds: {
      minScore: args.minScore,
      minAverage: args.minAverage,
    },
    postsChecked: scored.length,
    postsSkipped: posts.filter(post => post.skipped).length,
    averageScore,
    worstPosts: [...scored]
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map(post => ({
        slug: post.slug,
        score: post.score,
        grade: post.grade,
        blockers: post.blockers,
      })),
    belowMinimum: belowMinimum.map(post => post.slug),
    postsWithBlockers: withBlockers.map(post => post.slug),
    posts,
  };
}

async function maybeWriteReport(output, summary) {
  if (!output) return;
  const target = resolve(output);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  process.stdout.write(`reference_writing_report=${target}\n`);
}

function printSummary(summary) {
  process.stdout.write(`reference_writing_posts_checked=${summary.postsChecked}\n`);
  process.stdout.write(`reference_writing_posts_skipped=${summary.postsSkipped}\n`);
  process.stdout.write(`reference_writing_average_score=${summary.averageScore}\n`);
  for (const post of summary.worstPosts) {
    process.stdout.write(`reference_writing_worst=${post.slug} score=${post.score} grade=${post.grade}\n`);
  }
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

  const failures = [];
  if (summary.averageScore < args.minAverage) {
    failures.push(`average score ${summary.averageScore} is below minimum ${args.minAverage}`);
  }
  for (const post of summary.posts.filter(item => !item.skipped)) {
    if (post.score < args.minScore) {
      failures.push(`${post.file}: score ${post.score} is below minimum ${args.minScore}`);
    }
    for (const blocker of post.blockers) {
      failures.push(`${post.file}: ${blocker}`);
    }
  }

  if (args.strict && failures.length > 0) {
    process.stderr.write("Reference writing gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("reference_writing_gate=fail\n");
    return 1;
  }

  if (failures.length > 0) {
    process.stdout.write("reference_writing_audit_status=needs_rewrite\n");
  } else {
    process.stdout.write("reference_writing_audit_status=reference_ready\n");
  }
  process.stdout.write("reference_writing_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

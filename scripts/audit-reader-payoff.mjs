import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve, join } from "node:path";
import { getProseParagraphs } from "./ast-utils.mjs";

const DEFAULT_BLOG_DIR = "src/data/blog";
const CODE_FENCE = /```[\s\S]*?```/g;
const MARKDOWN_IMAGE = /!\[[^\]]*]\([^)]+\)/g;
const LINK = /\[[^\]]+]\([^)]+\)/g;
const PROBLEM_WORDS =
  /\b(problem|failure|failed|break|broken|risk|danger|leak|wrong|bottleneck|waste|confused|slop|blocked|hidden|missed|cost|trust|unsafe|drift|stale)\b/i;
const STAKES_WORDS =
  /\b(because|matters|means|costs|trust|money|time|production|public|reader|customer|security|deploy|publish|approval|review|handoff|maintain|lose|waste)\b/i;
const ACTION_WORDS =
  /\b(use|check|verify|reject|accept|run|ask|write|ship|publish|review|decide|fix|stop|keep|start|audit|compare|look for)\b/i;
const DECISION_WORDS =
  /\b(decision|rule|checklist|matrix|question|verdict|boundary|contract|standard|accept|reject|good answer|bad answer|before accepting|use this when)\b/i;
const READER_WORDS =
  /\b(reader|you|your|operator|reviewer|team|builder|agent|engineer|writer|founder)\b/i;
const SPECIFIC_OBJECT_WORDS =
  /\b(sha|hash|commit|npm|node|script|json|html|markdown|screenshot|rendered|summary\.json|route|file|repo|diff|log|artifact|vercel|coolify|mcp|design\.md|pagefind|browser|github|cli|api)\b/i;
const BAD_OPENERS =
  /^(in this (article|post)|today[, ]|this post (will|explains)|we'?re going to|let'?s dive|welcome to|in today'?s fast-paced world)\b/i;
const PROCEDURE_WORDS =
  /\b(click|copy|paste|install|download|open|select|scroll|drag|upload|rename|head over|go to|sign up|log in)\b/gi;
const WHY_WORDS =
  /\b(because|why|matters|means|cost|risk|trust|failure|boundary|decision|reject|accept|proof|evidence|tradeoff|so)\b/gi;

function parseArgs(argv) {
  const args = {
    blogDir: DEFAULT_BLOG_DIR,
    output: "",
    strict: false,
    minScore: 82,
    minAverage: 86,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--blog-dir") args.blogDir = argv[++index] ?? args.blogDir;
    else if (arg === "--output") args.output = argv[++index] ?? "";
    else if (arg === "--strict") args.strict = true;
    else if (arg === "--min-score") args.minScore = Number(argv[++index] ?? args.minScore);
    else if (arg === "--min-average") args.minAverage = Number(argv[++index] ?? args.minAverage);
    else if (arg === "--help") {
      process.stdout.write(
        "Usage: node scripts/audit-reader-payoff.mjs [--blog-dir <dir>] [--output <json>] [--strict] [--min-score <n>] [--min-average <n>]\n",
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
    .replace(MARKDOWN_IMAGE, " ")
    .replace(LINK, " ")
    .replace(/^#{1,6}\s+.+$/gm, " ")
    .replace(/[`*_>#|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(markdown) {
  const clean = stripMarkdown(markdown);
  return clean ? clean.split(/\s+/).filter(Boolean) : [];
}

function firstWords(markdown, count) {
  return words(markdown).slice(0, count).join(" ");
}

function lastWords(markdown, count) {
  const allWords = words(markdown);
  return allWords.slice(Math.max(0, allWords.length - count)).join(" ");
}

function firstParagraph(body) {
  return getProseParagraphs(body)[0]?.text ?? "";
}

function countMatches(text, pattern) {
  return (text.match(pattern) ?? []).length;
}

function headingCount(body) {
  return countMatches(body, /^##\s+.+$/gm);
}

function scoreOpening(body, description) {
  const intro = firstWords(body, 170);
  const first = firstParagraph(body);
  const findings = [];
  let score = 0;

  if (!BAD_OPENERS.test(first)) score += 6;
  else findings.push("opens like a generic tutorial instead of a live argument");

  if (PROBLEM_WORDS.test(intro)) score += 6;
  else findings.push("opening does not quickly name the failure, pain, or contradiction");

  if (STAKES_WORDS.test(`${description} ${intro}`)) score += 6;
  else findings.push("opening does not answer why this matters");

  if (ACTION_WORDS.test(`${description} ${intro}`)) score += 5;
  else findings.push("opening does not tell the reader what decision or action they will get");

  if (SPECIFIC_OBJECT_WORDS.test(intro)) score += 3;
  else findings.push("opening needs a concrete object: file, command, log, product, route, screenshot, or hash");

  return { score, max: 26, findings };
}

function scoreSoWhat(body) {
  const clean = stripMarkdown(body);
  const findings = [];
  let score = 0;

  if (DECISION_WORDS.test(clean)) score += 7;
  else findings.push("body lacks decision language: accept/reject/rule/checklist/boundary");

  if (/\b(so what|that matters because|that means|the useful question|the rule is|the point is|the practical move|what changes)\b/i.test(clean)) {
    score += 6;
  } else {
    findings.push("body rarely turns facts into so-what-now judgment");
  }

  if (READER_WORDS.test(clean)) score += 4;
  else findings.push("body does not keep the reader or operator in the frame");

  if (headingCount(body) >= 5) score += 3;
  else findings.push("needs enough section rhythm for a scanner to follow the argument");

  return { score, max: 20, findings };
}

function scoreProcedureBalance(body) {
  const clean = stripMarkdown(body);
  const procedureHits = countMatches(clean, PROCEDURE_WORDS);
  const whyHits = countMatches(clean, WHY_WORDS);
  const findings = [];
  let score = 0;

  if (whyHits >= 10) score += 6;
  else findings.push("too few why/risk/decision/evidence words to support a strong argument");

  if (procedureHits <= whyHits + 8) score += 6;
  else findings.push(`procedure language outruns reasoning language (${procedureHits} procedure hits vs ${whyHits} why hits)`);

  if (/\b(not|instead|but|however|unless|only when|rather than|wrong standard|hidden contract)\b/i.test(clean)) score += 5;
  else findings.push("argument lacks contrast; it reads too much like a neutral how-to");

  return { score, max: 17, findings };
}

function scoreReaderArtifact(body) {
  const clean = stripMarkdown(body);
  const findings = [];
  let score = 0;

  if (/^\|.+\|$/m.test(body)) score += 5;
  else findings.push("no table or matrix that compresses the reader decision");

  if (CODE_FENCE.test(body)) score += 4;
  else findings.push("no copyable block, command, or prompt the reader can reuse");

  if (/\b(use this|ask this|run this|before accepting|before shipping|do not accept|good answer|bad answer|checklist|review questions|decision matrix|reader decision|ask for the contract)\b/i.test(`${body}\n${clean}`)) {
    score += 6;
  } else {
    findings.push("reader artifact is present but not framed as reusable");
  }

  return { score, max: 15, findings };
}

function scoreEnding(body) {
  const ending = lastWords(body, 190);
  const findings = [];
  let score = 0;

  if (ACTION_WORDS.test(ending)) score += 5;
  else findings.push("ending does not leave the reader with an action");

  if (/does not prove|not enough|breaks when|fails when|boundary|caveat|limit|do not/i.test(ending)) score += 5;
  else findings.push("ending does not preserve a boundary or reject condition");

  if (/\b(next|before|when|if|use|ask|run|reject|accept|keep)\b/i.test(ending)) score += 4;
  else findings.push("ending does not translate the article into the next review move");

  return { score, max: 14, findings };
}

function scoreVoice(body) {
  const clean = stripMarkdown(body);
  const paragraphs = getProseParagraphs(body);
  const longParagraphs = paragraphs.filter(p => p.wordCount > 90).length;
  const findings = [];
  let score = 0;

  if (longParagraphs === 0) score += 4;
  else findings.push(`${longParagraphs} paragraph(s) exceed 90 words`);

  if (/\b(the rule|the point|the better question|the useful|the dangerous|the practical|that is why|that is the)\b/i.test(clean)) {
    score += 4;
  } else {
    findings.push("missing quotable judgment lines");
  }

  if (!/\b(game changer|revolutionary|amazing|insane|unlock productivity|supercharge|seamless|cutting-edge)\b/i.test(clean)) {
    score += 4;
  } else {
    findings.push("contains generic hype language");
  }

  return { score, max: 12, findings };
}

function scorePost(file, text) {
  const { frontmatter, body } = parseMarkdown(text);
  const slug = basename(file, ".md");
  const title = getFrontmatterValue(frontmatter, "title");
  const description = getFrontmatterValue(frontmatter, "description");
  const series = getFrontmatterValue(frontmatter, "series");

  if (series === "About") {
    return {
      file,
      slug,
      title,
      series,
      skipped: true,
      reason: "About pages are not scored by the reader payoff audit.",
    };
  }

  const dimensions = {
    opening: scoreOpening(body, description),
    soWhat: scoreSoWhat(body),
    procedureBalance: scoreProcedureBalance(body),
    readerArtifact: scoreReaderArtifact(body),
    ending: scoreEnding(body),
    voice: scoreVoice(body),
  };
  const score = Object.values(dimensions).reduce((sum, item) => sum + item.score, 0);
  const blockers = [];

  if (dimensions.opening.score < 20) blockers.push("opening does not establish pain, stakes, object, and payoff");
  if (dimensions.soWhat.score < 14) blockers.push("body does not keep converting facts into so-what-now judgment");
  if (dimensions.procedureBalance.score < 12) blockers.push("procedure outruns reasoning");
  if (dimensions.readerArtifact.score < 11) blockers.push("reader cannot reuse the article as a decision artifact");
  if (dimensions.ending.score < 10) blockers.push("ending lacks next action or boundary");

  return {
    file,
    slug,
    title,
    series,
    skipped: false,
    wordCount: words(body).length,
    score,
    grade: score >= 90 ? "reader-payoff-strong" : score >= 82 ? "reader-payoff-pass" : score >= 70 ? "payoff-thin" : "payoff-blocked",
    blockers,
    dimensions,
  };
}

async function collectPosts(blogDir) {
  const files = (await readdir(blogDir)).filter(file => file.endsWith(".md")).sort();
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
    weakestPosts: [...scored]
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
  process.stdout.write(`reader_payoff_report=${target}\n`);
}

function printSummary(summary) {
  process.stdout.write(`reader_payoff_posts_checked=${summary.postsChecked}\n`);
  process.stdout.write(`reader_payoff_posts_skipped=${summary.postsSkipped}\n`);
  process.stdout.write(`reader_payoff_average_score=${summary.averageScore}\n`);
  for (const post of summary.weakestPosts) {
    process.stdout.write(`reader_payoff_weakest=${post.slug} score=${post.score} grade=${post.grade}\n`);
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
    if (post.score < args.minScore) failures.push(`${post.file}: score ${post.score} is below minimum ${args.minScore}`);
    for (const blocker of post.blockers) failures.push(`${post.file}: ${blocker}`);
  }

  if (args.strict && failures.length > 0) {
    process.stderr.write("Reader payoff gate failed.\n");
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("reader_payoff_gate=fail\n");
    return 1;
  }

  process.stdout.write(failures.length > 0 ? "reader_payoff_status=needs_rewrite\n" : "reader_payoff_status=payoff_ready\n");
  process.stdout.write("reader_payoff_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

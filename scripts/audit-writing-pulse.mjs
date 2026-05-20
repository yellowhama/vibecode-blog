import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";

const CODE_FENCE = /```[\s\S]*?```/g;
const MARKDOWN_IMAGE = /!\[[^\]]+]\(([^)]+)\)/g;
const LINK = /\[[^\]]+]\([^)]+\)/g;
const TABLE = /^\|.+\|\r?\n\|[-: |]+\|/m;

const SCENE_WORDS =
  /\b(20\d{2}-\d{2}-\d{2}|at \d{1,2}:\d{2}|I opened|I asked|I ran|we shipped|we found|repo|dashboard|browser|terminal|GitHub|Vercel|MCP|DESIGN\.md|Pagefind|Chrome|screenshot|report|artifact|receipt|commit|hash)\b/i;
const PAIN_WORDS =
  /\b(failed|failure|wrong|broken|stale|leak|reused|generic|missing|blocked|waste|cost|risk|trust|public|production|approval|review|reader|handoff|confused|boring|thin|slop)\b/i;
const READER_MOVE_WORDS =
  /\b(use this|before you|before accepting|do not accept|reject|accept|run|check|ask|decide|switch|write the|look for|forward this|send this)\b/i;
const POV_WORDS =
  /\b(the point is|the rule is|the trap is|the useful move|the better question|the wrong standard|the standard is|the practical move|that is why|that is the point|not [^.]{0,120} but|instead of|rather than|only when)\b/gi;
const WHY_WORDS =
  /\b(because|matters|means|so|cost|risk|trust|proof|evidence|reader|review|approval|public|production|security|handoff|decision|boundary)\b/gi;
const PROCEDURE_WORDS =
  /\b(click|copy|paste|install|download|open|select|scroll|drag|upload|rename|head over|go to|sign up|log in|type|enter|choose)\b/gi;
const PROOF_STORY_WORDS =
  /\b(bad output|bad public output|before\/after|before and after|before:|after:|gate added|accepted review|zero rejected|revision plan|contentSha256|rendered|summary\.json|screenshot|failure log|receipt|hash approval)\b/i;
const FORWARD_WORDS =
  /\b(teammate|reviewer|operator|agent lead|engineer|builder|founder|writer|team|someone|reader|human reviewer|approval)\b/i;
const HYPE_WORDS =
  /\b(game changer|revolutionary|amazing|insane|beautiful|seamless|robust|world-class|high-quality|cutting-edge|unlock productivity|supercharge)\b/i;

function parseArgs(argv) {
  const args = {
    blogDir: DEFAULT_BLOG_DIR,
    output: "",
    strict: false,
    minScore: 80,
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
      process.stdout.write(
        "Usage: node scripts/audit-writing-pulse.mjs [--blog-dir <dir>] [--output <json>] [--strict] [--min-score <n>] [--min-average <n>]\n",
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

function countMatches(text, pattern) {
  return (text.match(pattern) ?? []).length;
}

function headings(body) {
  return [...body.matchAll(/^##\s+(.+)$/gm)].map(match => match[1].trim());
}

function paragraphs(body) {
  return body
    .split(/\r?\n\r?\n/)
    .map(paragraph => stripMarkdown(paragraph))
    .filter(Boolean);
}

function scoreOpening(body, description) {
  const intro = firstWords(body, 190);
  const findings = [];
  let score = 0;

  if (SCENE_WORDS.test(intro)) score += 7;
  else findings.push("opening lacks a concrete scene, artifact, date, command, or operator action");

  if (PAIN_WORDS.test(`${description} ${intro}`)) score += 6;
  else findings.push("opening does not make the reader feel the failure or stakes");

  if (READER_MOVE_WORDS.test(`${description} ${intro}`)) score += 5;
  else findings.push("opening does not tell the reader what to do differently");

  return { score, max: 18, findings };
}

function scorePointOfView(body) {
  const clean = stripMarkdown(body);
  const findings = [];
  let score = 0;

  const povHits = countMatches(clean, POV_WORDS);
  if (povHits >= 3) score += 8;
  else findings.push("not enough explicit judgment lines; the post can read like neutral documentation");

  if (/\b(not .* enough|not .* proof|wrong standard|trap|false positive|hidden assumption|missing contract)\b/i.test(clean)) {
    score += 5;
  } else {
    findings.push("argument needs a sharper wrong-standard contrast");
  }

  if (!HYPE_WORDS.test(clean)) score += 3;
  else findings.push("generic hype language weakens trust");

  return { score, max: 16, findings };
}

function scoreEvidenceStory(body) {
  const clean = stripMarkdown(body);
  const findings = [];
  let score = 0;

  if (PROOF_STORY_WORDS.test(body)) score += 7;
  else findings.push("missing a visible proof story such as bad output -> gate -> after");

  if (CODE_FENCE.test(body) && TABLE.test(body)) score += 5;
  else findings.push("needs both a copyable block and a table/matrix");

  if (countMatches(clean, /\b(20\d{2}-\d{2}-\d{2}|[a-f0-9]{7,64}|\d+\/\d+|\d+\s*(pages|posts|viewports|records|words|files|routes|checks))\b/gi) >= 4) {
    score += 4;
  } else {
    findings.push("needs more dated/count/hash receipts");
  }

  return { score, max: 16, findings };
}

function scoreReasoningPace(body) {
  const clean = stripMarkdown(body);
  const findings = [];
  let score = 0;
  const whyHits = countMatches(clean, WHY_WORDS);
  const procedureHits = countMatches(clean, PROCEDURE_WORDS);

  if (whyHits >= 18) score += 6;
  else findings.push("too few why/risk/trust/decision words for a strong blog argument");

  if (procedureHits <= Math.max(8, whyHits)) score += 5;
  else findings.push(`procedure outruns reasoning (${procedureHits} procedure hits vs ${whyHits} why hits)`);

  const longParagraphs = paragraphs(body).filter(paragraph => paragraph.split(/\s+/).length > 95).length;
  if (longParagraphs === 0) score += 4;
  else findings.push(`${longParagraphs} paragraph(s) exceed 95 words`);

  return { score, max: 15, findings };
}

function scoreReaderTransfer(body) {
  const clean = stripMarkdown(body);
  const ending = lastWords(body, 220);
  const findings = [];
  let score = 0;

  if (TABLE.test(body)) score += 4;
  else findings.push("missing table/matrix for scanner transfer");

  if (/\b(Accept only when|Reject when|Use this|Before accepting|Decision Matrix|Reader Decision|Checklist|Review Question)\b/i.test(body)) {
    score += 6;
  } else {
    findings.push("reader transfer is not labeled as a reusable artifact");
  }

  if (FORWARD_WORDS.test(clean)) score += 3;
  else findings.push("does not name who should receive or use the article");

  if (READER_MOVE_WORDS.test(ending) && /\b(boundary|reject|accept|next|before|when|if|proof|evidence)\b/i.test(ending)) {
    score += 5;
  } else {
    findings.push("ending does not land on a next review move plus boundary");
  }

  return { score, max: 18, findings };
}

function scoreScanAndShape(body) {
  const sectionHeadings = headings(body);
  const findings = [];
  let score = 0;

  if (sectionHeadings.length >= 6) score += 4;
  else findings.push("needs more scannable sections");

  if (sectionHeadings.some(heading => /\b(case|failure|proof|receipt|before|after|field|review)\b/i.test(heading))) score += 3;
  else findings.push("no section advertises the evidence scene");

  if (sectionHeadings.some(heading => /\b(boundary|reject|decision|checklist|matrix|use this|review)\b/i.test(heading))) score += 3;
  else findings.push("no section advertises the reader decision");

  if ([...body.matchAll(MARKDOWN_IMAGE)].length === 1) score += 2;
  else findings.push("expected exactly one body image under the current public contract");

  if (/\b(not decoration|proves|compresses|evidence|diagram|screenshot|rendered)\b/i.test(body)) score += 3;
  else findings.push("visual role is not explained as proof, compression, or evidence");

  return { score, max: 15, findings };
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
      reason: "About pages are not scored by the writing pulse audit.",
    };
  }

  const dimensions = {
    opening: scoreOpening(body, description),
    pointOfView: scorePointOfView(body),
    evidenceStory: scoreEvidenceStory(body),
    reasoningPace: scoreReasoningPace(body),
    readerTransfer: scoreReaderTransfer(body),
    scanAndShape: scoreScanAndShape(body),
  };
  const score = Object.values(dimensions).reduce((sum, item) => sum + item.score, 0);
  const pulseGaps = Object.entries(dimensions)
    .flatMap(([name, item]) => item.findings.map(finding => `${name}: ${finding}`))
    .slice(0, 10);

  return {
    file,
    slug,
    title,
    series,
    skipped: false,
    wordCount: words(body).length,
    score,
    grade: score >= 88 ? "blogger-pulse-strong" : score >= 76 ? "blogger-pulse-pass" : "blogger-pulse-weak",
    pulseGaps,
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
  const blockers = scored
    .filter(post => post.score < args.minScore)
    .map(post => ({ slug: post.slug, score: post.score, pulseGaps: post.pulseGaps }));

  return {
    generatedAt: new Date().toISOString(),
    blogDir: resolve(args.blogDir),
    postsChecked: scored.length,
    postsSkipped: posts.length - scored.length,
    averageScore,
    minScore: args.minScore,
    minAverage: args.minAverage,
    status: blockers.length === 0 && averageScore >= args.minAverage ? "writing_pulse_ready" : "needs_writing_pulse",
    weakest: [...scored]
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map(post => ({
        slug: post.slug,
        score: post.score,
        grade: post.grade,
        pulseGaps: post.pulseGaps,
      })),
    blockers,
    posts,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const blogDir = resolve(args.blogDir);
  if (!existsSync(blogDir)) throw new Error(`blog dir not found: ${blogDir}`);
  const posts = await collectPosts(blogDir);
  const report = summarize(posts, args);

  if (args.output) {
    await mkdir(dirname(resolve(args.output)), { recursive: true });
    await writeFile(resolve(args.output), `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(`writing_pulse_report=${resolve(args.output)}\n`);
  }

  process.stdout.write(`writing_pulse_posts_checked=${report.postsChecked}\n`);
  process.stdout.write(`writing_pulse_posts_skipped=${report.postsSkipped}\n`);
  process.stdout.write(`writing_pulse_average_score=${report.averageScore}\n`);
  for (const post of report.weakest) {
    process.stdout.write(`writing_pulse_weakest=${post.slug} score=${post.score} grade=${post.grade}\n`);
  }
  process.stdout.write(`writing_pulse_status=${report.status}\n`);

  if (args.strict && report.status !== "writing_pulse_ready") {
    process.stderr.write("Writing pulse gate failed.\n");
    for (const blocker of report.blockers) {
      process.stderr.write(`- ${blocker.slug} score=${blocker.score}\n`);
      for (const gap of blocker.pulseGaps.slice(0, 5)) {
        process.stderr.write(`  - ${gap}\n`);
      }
    }
    if (report.averageScore < args.minAverage) {
      process.stderr.write(`- average score ${report.averageScore} below ${args.minAverage}\n`);
    }
    process.stdout.write("writing_pulse_gate=fail\n");
    return 1;
  }

  process.stdout.write("writing_pulse_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

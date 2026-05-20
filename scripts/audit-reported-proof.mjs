import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";

const CODE_FENCE = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`\n]+`/g;
const MARKDOWN_IMAGE = /!\[[^\]]+]\(([^)]+)\)/g;
const FILE_PATH = /\b(?:scripts\/[\w.-]+|src\/[\w./-]+|F:\\[^\s`|)]+|dist\/[\w./-]+|[\w-]+\.json|[\w-]+\.md|[\w-]+\.mjs)\b/gi;
const COMMAND = /\b(?:npm run|node scripts\/|git [a-z-]+|powershell|pagefind|astro build)\b/gi;
const HASH_OR_COUNT = /\b(?:[a-f0-9]{7,64}|\d+(?:\/\d+)?\s*(?:pages|posts|viewports|records|words|files|routes|checks|screenshots)?)\b/gi;

const FAILURE_WORDS = /\b(bad|before|failed|failure|broke|wrong|stale|missing|generic|reused|leak|blocked|rejected|thin)\b/i;
const GATE_WORDS = /\b(gate|verifier|verify|audit|check|contract|review|fix|repair|added|blocked|reject)\b/i;
const AFTER_WORDS = /\b(after|passing|pass|current|accepted|now|result|receipt|green|zero|approved)\b/i;
const VISUAL_PROOF_WORDS = /\b(screenshot|rendered|summary\.json|browser|desktop|mobile|viewport|first-screen|image contract|ogImage|contact sheet|diagram)\b/i;
const STAKE_WORDS = /\b(trust|production|public|reader|money|security|approval|review|handoff|cost|risk|deploy|publish)\b/i;
const TRANSFER_WORDS = /\b(decision|matrix|template|checklist|accept|reject|before accepting|use this|run this|ask this|forward)\b/i;

function parseArgs(argv) {
  const args = {
    blogDir: DEFAULT_BLOG_DIR,
    output: "",
    strict: false,
    minScore: 72,
    minAverage: 80,
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
        "Usage: node scripts/audit-reported-proof.mjs [--blog-dir <dir>] [--output <json>] [--strict] [--min-score <n>] [--min-average <n>]\n",
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
  return clean ? clean.split(/\s+/).filter(Boolean) : [];
}

function firstWords(body, count) {
  return words(body).slice(0, count).join(" ");
}

function countMatches(text, pattern) {
  return (text.match(pattern) ?? []).length;
}

function hasTable(body) {
  return /^\|.+\|\r?\n\|[-: |]+\|/m.test(body);
}

function sectionText(body, headingPattern) {
  const sections = [...body.matchAll(/^##\s+(.+)$/gm)];
  for (let index = 0; index < sections.length; index += 1) {
    const heading = sections[index];
    if (!headingPattern.test(heading[1])) continue;
    const start = heading.index ?? 0;
    const next = sections[index + 1]?.index ?? body.length;
    return body.slice(start, next);
  }
  return "";
}

function hasOrderedProofChain(body) {
  const chainSection =
    sectionText(body, /\b(receipt|case|failure|before|after|field|proof|evidence|example)\b/i) || body;
  const lower = chainSection.toLowerCase();
  const failureIndex = lower.search(FAILURE_WORDS);
  const gateIndex = lower.search(GATE_WORDS);
  const afterIndex = lower.search(AFTER_WORDS);
  return failureIndex >= 0 && gateIndex > failureIndex && afterIndex > gateIndex;
}

function scoreOpening(body) {
  const intro = firstWords(body, 150);
  const findings = [];
  let score = 0;

  if (/\b(20\d{2}-\d{2}-\d{2}|I|we|repo|agent|GitHub|Chrome|Vercel|MCP|DESIGN\.md|Warden|Pagefind)\b/i.test(intro)) {
    score += 6;
  } else {
    findings.push("opening does not start from a named operator, system, date, or artifact");
  }

  if (FAILURE_WORDS.test(intro)) score += 5;
  else findings.push("opening does not expose a failure or rejected state quickly");

  if (STAKE_WORDS.test(intro)) score += 5;
  else findings.push("opening does not make the cost or trust risk clear quickly");

  if (TRANSFER_WORDS.test(intro) || /\b(do differently|practical move|decision|switch modes)\b/i.test(intro)) {
    score += 4;
  } else {
    findings.push("opening does not say what the reader should do differently");
  }

  return { score, max: 20, findings };
}

function scoreProofChain(body) {
  const findings = [];
  let score = 0;

  if (hasOrderedProofChain(body)) score += 12;
  else findings.push("missing ordered failure -> gate/check -> after/pass proof chain");

  if (/\b(before\/after|before and after|Bad public output|Gate added|After:|Before \| After)\b/i.test(body)) {
    score += 5;
  } else {
    findings.push("proof chain is not visible as a before/after or bad/gate/after artifact");
  }

  if (/\b(rejected rows?|accepted review|revision plan|zero-item|approval hash|contentSha256|manifest_items)\b/i.test(body)) {
    score += 4;
  } else {
    findings.push("proof chain lacks review-state or approval-state language");
  }

  if (/\b(cost|trust|waste|public|production|review time|repeat|damage)\b/i.test(body)) score += 4;
  else findings.push("proof chain does not name the cost of ignoring it");

  return { score, max: 25, findings };
}

function scoreArtifactAnchors(body) {
  const findings = [];
  let score = 0;
  const codeBlocks = countMatches(body, CODE_FENCE);
  const inlineCode = countMatches(body, INLINE_CODE);
  const paths = countMatches(body, FILE_PATH);
  const commands = countMatches(body, COMMAND);
  const receipts = countMatches(body, HASH_OR_COUNT);

  if (codeBlocks >= 2) score += 5;
  else findings.push("needs at least two code, command, log, or receipt blocks");

  if (inlineCode >= 8) score += 5;
  else findings.push("needs more inline commands, paths, hashes, or config names");

  if (paths >= 4) score += 5;
  else findings.push("needs more concrete file/script/report paths");

  if (commands >= 1) score += 4;
  else findings.push("needs at least one command the reader can recognize or rerun");

  if (receipts >= 4) score += 6;
  else findings.push("needs more counts, hashes, dates, or measurable receipts");

  return { score, max: 25, findings, counts: { codeBlocks, inlineCode, paths, commands, receipts } };
}

function scoreVisualProof(body, slug) {
  const findings = [];
  const images = [...body.matchAll(MARKDOWN_IMAGE)].map(match => match[1].trim());
  let score = 0;

  if (images[0] === `/images/posts/${slug}.png`) score += 4;
  else findings.push("body image is not the slug-specific post image");

  if (VISUAL_PROOF_WORDS.test(body)) score += 6;
  else findings.push("visual proof is not tied to rendered, screenshot, diagram, or image-contract evidence");

  if (/\b(desktop|mobile|first-screen|viewport|summary\.json|image contract|rendered_page)\b/i.test(body)) {
    score += 4;
  } else {
    findings.push("visual proof lacks rendered/device/image-contract detail");
  }

  if (images.length === 1) score += 3;
  else findings.push(`expected exactly one public body image under current contract, got ${images.length}`);

  if (/\b(?:not decoration|not a screenshot|decorates?|proves?|compresses?|evidence)\b/i.test(body)) score += 3;
  else findings.push("image role is not explained as proof, compression, or evidence");

  return { score, max: 20, findings, images };
}

function scoreReaderTransfer(body) {
  const findings = [];
  let score = 0;

  if (hasTable(body)) score += 5;
  else findings.push("missing decision table or comparison matrix");

  if (TRANSFER_WORDS.test(body)) score += 6;
  else findings.push("missing explicit reader accept/reject/use action");

  if (/\b(Source:|Boundary:|Acceptance check:|Forbidden changes:|Evidence to keep:|Good answer|Bad answer|Accept only when|Reject when)\b/i.test(body)) {
    score += 6;
  } else {
    findings.push("missing reusable review template or accept/reject criteria");
  }

  if (/\b(forward this|the operator choice|before the next|send this|reviewer|teammate|agent lead|builder)\b/i.test(body)) {
    score += 3;
  } else {
    findings.push("reader transfer does not name who should use or receive the post");
  }

  return { score, max: 20, findings };
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
      reason: "About pages are not scored by the reported proof audit.",
    };
  }

  const dimensions = {
    opening: scoreOpening(body),
    proofChain: scoreProofChain(body),
    artifactAnchors: scoreArtifactAnchors(body),
    visualProof: scoreVisualProof(body, slug),
    readerTransfer: scoreReaderTransfer(body),
  };
  const score = Object.values(dimensions).reduce((sum, item) => sum + item.score, 0);
  const proofGaps = Object.entries(dimensions)
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
    grade: score >= 85 ? "reported-proof-strong" : score >= 72 ? "reported-proof-pass" : "needs-reported-proof",
    proofGaps,
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
  const weakest = [...scored].sort((a, b) => a.score - b.score).slice(0, 5);
  const blockers = scored
    .filter(post => post.score < args.minScore)
    .map(post => ({ slug: post.slug, score: post.score, proofGaps: post.proofGaps }));

  return {
    generatedAt: new Date().toISOString(),
    blogDir: resolve(args.blogDir),
    postsChecked: scored.length,
    postsSkipped: posts.length - scored.length,
    averageScore,
    minScore: args.minScore,
    minAverage: args.minAverage,
    status: blockers.length === 0 && averageScore >= args.minAverage ? "reported_proof_ready" : "needs_reported_proof",
    weakest: weakest.map(post => ({
      slug: post.slug,
      score: post.score,
      grade: post.grade,
      proofGaps: post.proofGaps,
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
    process.stdout.write(`reported_proof_report=${resolve(args.output)}\n`);
  }

  process.stdout.write(`reported_proof_posts_checked=${report.postsChecked}\n`);
  process.stdout.write(`reported_proof_posts_skipped=${report.postsSkipped}\n`);
  process.stdout.write(`reported_proof_average_score=${report.averageScore}\n`);
  for (const post of report.weakest) {
    process.stdout.write(`reported_proof_weakest=${post.slug} score=${post.score} grade=${post.grade}\n`);
  }
  process.stdout.write(`reported_proof_status=${report.status}\n`);

  if (args.strict && report.status !== "reported_proof_ready") {
    process.stderr.write("Reported proof gate failed.\n");
    for (const blocker of report.blockers) {
      process.stderr.write(`- ${blocker.slug} score=${blocker.score}\n`);
      for (const gap of blocker.proofGaps.slice(0, 5)) {
        process.stderr.write(`  - ${gap}\n`);
      }
    }
    if (report.averageScore < args.minAverage) {
      process.stderr.write(`- average score ${report.averageScore} below ${args.minAverage}\n`);
    }
    process.stdout.write("reported_proof_gate=fail\n");
    return 1;
  }

  process.stdout.write("reported_proof_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

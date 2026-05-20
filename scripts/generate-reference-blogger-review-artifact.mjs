import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const DEFAULT_SLUG = "software-3-0";
const DEFAULT_BLOG_DIR = "src/data/blog";
const DEFAULT_OUTPUT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/software-3-0-reference-blogger-review.html";
const DEFAULT_SUMMARY =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/software-3-0-reference-blogger-review-summary.json";
const DEFAULT_READER_PAYOFF_REPORT = "F:/Aisaak/CompanyArtifacts/vibecode-reader-payoff-audit/latest.json";
const DEFAULT_REFERENCE_CEILING_REPORT = "F:/Aisaak/CompanyArtifacts/vibecode-reference-ceiling-audit/latest.json";

const REVIEW_ROWS = [
  {
    id: "quote",
    label: "Quote",
    question: "Which sentence would a serious reader quote back to someone else?",
    rejectIf: "The best sentence is only accurate, not sharp enough to survive outside the article.",
  },
  {
    id: "save",
    label: "Save",
    question: "What exact artifact would the reader save for later use?",
    rejectIf: "The article informs the reader but leaves no reusable checklist, matrix, command block, or review question.",
  },
  {
    id: "forward",
    label: "Forward",
    question: "Who would the reader forward this to, and what problem would it help them solve?",
    rejectIf: "The audience is everyone, or the forwarding reason is only 'interesting'.",
  },
  {
    id: "scene",
    label: "Scene",
    question: "What moment, log, screenshot, or before/after makes the argument feel reported instead of summarized?",
    rejectIf: "The post can be summarized as advice without losing any concrete object.",
  },
  {
    id: "stakes",
    label: "Stakes",
    question: "Where does the post show the cost of ignoring the rule?",
    rejectIf: "The risk is implied but not felt in time, trust, money, security, review cost, or public embarrassment.",
  },
  {
    id: "boundary",
    label: "Boundary",
    question: "What claim does the post explicitly refuse to prove?",
    rejectIf: "The article sounds stronger than its evidence, or the caveat is too generic to constrain action.",
  },
];

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

function sha256(value) {
  return createHash("sha256").update(value).digest("hex").toUpperCase();
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, " ")
    .replace(/^#{1,6}\s+.+$/gm, " ")
    .replace(/[`*_>#|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(markdown) {
  const clean = stripMarkdown(markdown);
  return clean ? clean.split(/\s+/).filter(Boolean) : [];
}

function splitSentences(markdown) {
  return stripMarkdown(markdown)
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 40);
}

function excerpt(value, max = 220) {
  const clean = String(value ?? "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}...` : clean;
}

function collectHeadings(body) {
  return [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
}

function collectCodeBlocks(body) {
  return [...body.matchAll(/```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)```/g)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function collectTableBlocks(body) {
  const lines = body.split(/\r?\n/);
  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (/^\|.+\|$/.test(line.trim())) {
      current.push(line.trim());
      continue;
    }
    if (current.length) {
      blocks.push(current.join("\n"));
      current = [];
    }
  }
  if (current.length) blocks.push(current.join("\n"));
  return blocks;
}

function collectImages(body) {
  return [...body.matchAll(/!\[([^\]]*)]\(([^)]+)\)/g)].map((match) => ({
    alt: match[1].trim(),
    src: match[2].trim(),
  }));
}

function collectReferences(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  const referencesStart = lines.findIndex((line) => /^references:\s*$/.test(line));
  if (referencesStart === -1) return [];
  const references = [];
  let current = {};
  for (const line of lines.slice(referencesStart + 1)) {
    if (/^[A-Za-z][\w-]*:\s*/.test(line)) break;
    const name = line.match(/^\s*-\s+name:\s*(.+)$/);
    const url = line.match(/^\s+url:\s*(.+)$/);
    const guru = line.match(/^\s+guru:\s*(.+)$/);
    if (name) {
      if (current.name) references.push(current);
      current = { name: name[1].trim().replace(/^["']|["']$/g, "") };
    } else if (url) current.url = url[1].trim().replace(/^["']|["']$/g, "");
    else if (guru) current.guru = guru[1].trim().replace(/^["']|["']$/g, "");
  }
  if (current.name) references.push(current);
  return references;
}

async function readJsonIfExists(path) {
  if (!path || !existsSync(path)) return null;
  return JSON.parse(await readFile(path, "utf8"));
}

function reportPost(report, slug) {
  return report?.posts?.find((post) => post.slug === slug) ?? null;
}

function bestQuoteCandidates(body) {
  const candidates = splitSentences(body)
    .filter((sentence) =>
      /\b(the rule|the point|the useful|the practical|the dangerous|that is why|do not|should|must|not enough|reject|accept|trust|evidence|boundary)\b/i.test(sentence),
    )
    .sort((a, b) => {
      const aScore = Number(/\b(rule|point|dangerous|practical|reject|accept)\b/i.test(a)) + Number(a.length <= 170);
      const bScore = Number(/\b(rule|point|dangerous|practical|reject|accept)\b/i.test(b)) + Number(b.length <= 170);
      return bScore - aScore;
    });
  return candidates.slice(0, 6);
}

function buildSummary({ slug, markdown, frontmatter, body, readerPayoff, referenceCeiling, output, summaryPath }) {
  const title = getFrontmatterValue(frontmatter, "title") || slug;
  const description = getFrontmatterValue(frontmatter, "description");
  const headings = collectHeadings(body);
  const codeBlocks = collectCodeBlocks(body);
  const tables = collectTableBlocks(body);
  const images = collectImages(body);
  const references = collectReferences(frontmatter);
  const quoteCandidates = bestQuoteCandidates(body);
  const markdownSha256 = sha256(markdown);

  return {
    generatedAt: new Date().toISOString(),
    slug,
    title,
    description,
    markdownSha256,
    wordCount: words(body).length,
    output: resolve(output),
    summary: resolve(summaryPath),
    reviewRows: REVIEW_ROWS.map((row) => row.id),
    readerPayoff: readerPayoff
      ? {
          score: readerPayoff.score,
          grade: readerPayoff.grade,
          blockers: readerPayoff.blockers ?? [],
        }
      : null,
    referenceCeiling: referenceCeiling
      ? {
          score: referenceCeiling.score,
          grade: referenceCeiling.grade,
          gaps: referenceCeiling.ceilingGaps ?? [],
        }
      : null,
    extracted: {
      headings,
      images,
      references,
      quoteCandidates: quoteCandidates.map((item) => excerpt(item, 260)),
      saveCandidates: [
        ...tables.slice(0, 2).map((item) => excerpt(item, 260)),
        ...codeBlocks.slice(0, 3).map((item) => excerpt(item, 260)),
      ].slice(0, 5),
      evidenceObjects: [
        ...images.map((image) => image.src),
        ...references.map((reference) => reference.name),
        ...codeBlocks.slice(0, 3).map((item) => excerpt(item, 120)),
      ].slice(0, 8),
    },
  };
}

function renderList(items, empty, render) {
  if (!items.length) return `<p class="empty">${escapeHtml(empty)}</p>`;
  return `<ul>${items.map(render).join("")}</ul>`;
}

function renderArtifact(summary, body) {
  const firstWords = words(body).slice(0, 120).join(" ");
  const verdictJson = {
    slug: summary.slug,
    markdownSha256: summary.markdownSha256,
    reviewer: "",
    decision: "reject",
    quote: "",
    saveArtifact: "",
    forwardAudience: "",
    requiredRevision: "",
    rowDecisions: Object.fromEntries(summary.reviewRows.map((row) => [row, "reject"])),
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(summary.title)} - Reference Blogger Review</title>
  <style>
    :root { color-scheme: light; --ink:#141414; --muted:#5f6470; --line:#d9dde5; --paper:#fbfaf7; --panel:#ffffff; --accent:#b5482f; --good:#166534; --bad:#991b1b; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: var(--paper); line-height: 1.55; }
    main { max-width: 1180px; margin: 0 auto; padding: 32px 20px 56px; }
    header { border-bottom: 2px solid var(--ink); padding-bottom: 20px; margin-bottom: 24px; }
    h1 { font-size: clamp(2rem, 4vw, 4rem); line-height: 1; margin: 0 0 12px; letter-spacing: 0; max-width: 980px; }
    h2 { font-size: 1.05rem; text-transform: uppercase; letter-spacing: .08em; margin: 0 0 12px; }
    h3 { margin: 0 0 8px; font-size: 1.1rem; }
    .lede { max-width: 850px; font-size: 1.08rem; color: #2f3338; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
    .pill { border: 1px solid var(--line); background: var(--panel); padding: 6px 10px; border-radius: 999px; font-size: .86rem; color: #343840; }
    .grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(320px, .9fr); gap: 18px; align-items: start; }
    .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 18px; }
    .score { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
    .score strong { display: block; font-size: 1.8rem; line-height: 1; }
    .review-row { border-top: 1px solid var(--line); padding: 16px 0; }
    .review-row:first-child { border-top: 0; padding-top: 0; }
    .question { font-size: 1rem; margin: 0 0 8px; }
    .reject { color: var(--bad); font-size: .92rem; margin: 0; }
    .empty { color: var(--muted); font-style: italic; }
    blockquote { margin: 0 0 10px; border-left: 4px solid var(--accent); padding: 8px 12px; background: #fff7ed; }
    code, pre { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
    pre { overflow: auto; border: 1px solid var(--line); background: #111827; color: #f9fafb; padding: 12px; border-radius: 6px; font-size: .84rem; }
    ul { padding-left: 18px; margin: 8px 0 0; }
    li { margin: 6px 0; }
    button { border: 0; background: var(--ink); color: white; padding: 10px 14px; border-radius: 6px; cursor: pointer; font-weight: 700; }
    textarea { width: 100%; min-height: 180px; margin-top: 10px; font-family: "SFMono-Regular", Consolas, monospace; font-size: .82rem; }
    .two { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
    @media (max-width: 860px) { .grid, .two, .score { grid-template-columns: 1fr; } main { padding: 22px 14px 44px; } }
  </style>
</head>
<body>
  <main data-current-sha="${escapeHtml(summary.markdownSha256)}" data-slug="${escapeHtml(summary.slug)}">
    <header>
      <p class="pill">Reference Blogger Review Artifact</p>
      <h1>${escapeHtml(summary.title)}</h1>
      <p class="lede">${escapeHtml(summary.description)}</p>
      <div class="meta">
        <span class="pill">slug: ${escapeHtml(summary.slug)}</span>
        <span class="pill">words: ${summary.wordCount}</span>
        <span class="pill">markdown SHA: ${escapeHtml(summary.markdownSha256.slice(0, 16))}</span>
      </div>
    </header>
    <section class="grid">
      <div class="panel">
        <h2>Quote / Save / Forward Review</h2>
        ${REVIEW_ROWS.map((row) => `<article class="review-row" data-review-row="${escapeHtml(row.id)}">
          <h3>${escapeHtml(row.label)}</h3>
          <p class="question">${escapeHtml(row.question)}</p>
          <p class="reject"><strong>Reject if:</strong> ${escapeHtml(row.rejectIf)}</p>
        </article>`).join("")}
      </div>
      <aside class="panel">
        <h2>Current Scores</h2>
        <div class="score">
          <div class="panel"><span>Reader payoff</span><strong>${escapeHtml(summary.readerPayoff?.score ?? "n/a")}</strong><span>${escapeHtml(summary.readerPayoff?.grade ?? "missing")}</span></div>
          <div class="panel"><span>Reference ceiling</span><strong>${escapeHtml(summary.referenceCeiling?.score ?? "n/a")}</strong><span>${escapeHtml(summary.referenceCeiling?.grade ?? "missing")}</span></div>
        </div>
        <h2 style="margin-top:18px;">Opening Excerpt</h2>
        <blockquote>${escapeHtml(excerpt(firstWords, 520))}</blockquote>
      </aside>
    </section>
    <section class="two" style="margin-top:18px;">
      <div class="panel">
        <h2>Quote Candidates</h2>
        ${renderList(summary.extracted.quoteCandidates, "No quote candidates found.", (item) => `<li>${escapeHtml(item)}</li>`)}
      </div>
      <div class="panel">
        <h2>Save Candidates</h2>
        ${renderList(summary.extracted.saveCandidates, "No reusable artifact candidates found.", (item) => `<li><code>${escapeHtml(item)}</code></li>`)}
      </div>
    </section>
    <section class="two" style="margin-top:18px;">
      <div class="panel">
        <h2>Evidence Objects</h2>
        ${renderList(summary.extracted.evidenceObjects, "No evidence objects found.", (item) => `<li>${escapeHtml(item)}</li>`)}
      </div>
      <div class="panel">
        <h2>Reviewer Export</h2>
        <p>Fill the empty fields after review. Keep the markdown SHA unchanged or regenerate this artifact.</p>
        <button type="button" onclick="navigator.clipboard.writeText(document.querySelector('textarea').value)">Copy JSON</button>
        <textarea>${escapeHtml(JSON.stringify(verdictJson, null, 2))}</textarea>
      </div>
    </section>
  </main>
</body>
</html>`;
}

async function checkArtifact({ slug, markdownSha256, output, summaryPath }) {
  if (!existsSync(output)) throw new Error(`reference blogger review artifact missing: ${output}`);
  if (!existsSync(summaryPath)) throw new Error(`reference blogger review summary missing: ${summaryPath}`);
  const html = await readFile(output, "utf8");
  const summary = JSON.parse(await readFile(summaryPath, "utf8"));
  const failures = [];
  if (summary.slug !== slug) failures.push(`summary slug ${summary.slug} does not match ${slug}`);
  if (summary.markdownSha256 !== markdownSha256) failures.push("summary markdown SHA is stale");
  if (!html.includes(markdownSha256)) failures.push("HTML does not include current markdown SHA");
  for (const row of REVIEW_ROWS) {
    if (!summary.reviewRows?.includes(row.id)) failures.push(`summary missing review row ${row.id}`);
    if (!html.includes(`data-review-row="${row.id}"`)) failures.push(`HTML missing review row ${row.id}`);
  }
  if (!html.includes("Quote / Save / Forward Review")) failures.push("HTML missing review title");
  if (failures.length) {
    throw new Error(`Reference blogger review artifact is stale or incomplete.\n- ${failures.join("\n- ")}`);
  }
}

async function main() {
  const slug = getArg("--slug") ?? DEFAULT_SLUG;
  const blogDir = getArg("--blog-dir") ?? DEFAULT_BLOG_DIR;
  const output = getArg("--output") ?? DEFAULT_OUTPUT;
  const summaryPath = getArg("--summary") ?? DEFAULT_SUMMARY;
  const readerPayoffPath = getArg("--reader-payoff-report") ?? DEFAULT_READER_PAYOFF_REPORT;
  const referenceCeilingPath = getArg("--reference-ceiling-report") ?? DEFAULT_REFERENCE_CEILING_REPORT;
  const postPath = join(blogDir, `${slug}.md`);
  if (!existsSync(postPath)) throw new Error(`post not found: ${postPath}`);

  const markdown = await readFile(postPath, "utf8");
  const { frontmatter, body } = parseMarkdown(markdown);
  const markdownSha256 = sha256(markdown);

  if (hasArg("--check")) {
    await checkArtifact({ slug, markdownSha256, output, summaryPath });
    process.stdout.write(`reference_blogger_review_artifact=${resolve(output)}\n`);
    process.stdout.write(`reference_blogger_review_artifact_gate=pass\n`);
    return 0;
  }

  const readerPayoffReport = await readJsonIfExists(readerPayoffPath);
  const referenceCeilingReport = await readJsonIfExists(referenceCeilingPath);
  const summary = buildSummary({
    slug,
    markdown,
    frontmatter,
    body,
    readerPayoff: reportPost(readerPayoffReport, slug),
    referenceCeiling: reportPost(referenceCeilingReport, slug),
    output,
    summaryPath,
  });
  const html = renderArtifact(summary, body);
  await mkdir(dirname(resolve(output)), { recursive: true });
  await writeFile(output, html, "utf8");
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  process.stdout.write(`reference_blogger_review_artifact=${resolve(output)}\n`);
  process.stdout.write(`reference_blogger_review_summary=${resolve(summaryPath)}\n`);
  process.stdout.write(`reference_blogger_review_markdown_sha256=${summary.markdownSha256}\n`);
  process.stdout.write(`reference_blogger_review_rows=${summary.reviewRows.length}\n`);
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

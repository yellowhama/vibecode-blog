import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function renderMarkdown(body) {
  const lines = body.split(/\r?\n/);
  const html = [];
  let inCode = false;
  let code = [];
  let table = [];
  let paragraph = [];

  function flushParagraph() {
    if (paragraph.length) {
      html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function flushTable() {
    if (!table.length) return;
    const rows = table.filter((line) => !/^\|\s*-+/.test(line)).map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => `<td>${inlineMarkdown(cell.trim())}</td>`)
        .join(""),
    );
    html.push(`<table>${rows.map((row) => `<tr>${row}</tr>`).join("")}</table>`);
    table = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith("---")) continue;
    if (line.startsWith("```")) {
      flushParagraph();
      flushTable();
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushTable();
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushTable();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const image = /^!\[([^\]]*)]\(([^)]+)\)/.exec(line);
    if (image) {
      flushParagraph();
      flushTable();
      html.push(`<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" /><figcaption>${escapeHtml(image[1])}</figcaption></figure>`);
      continue;
    }
    if (line.startsWith("|")) {
      flushParagraph();
      table.push(line);
      continue;
    }
    if (line.startsWith(">")) {
      flushParagraph();
      flushTable();
      html.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s*/, ""))}</blockquote>`);
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushTable();
  return html.join("\n");
}

function buildHtml({ title, slug, bodyHtml, contract, review, markdownSha256 }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - Private Rendered Candidate</title>
  <style>
    :root { --ink:#21170f; --paper:#fffaf2; --canvas:#f3eadf; --line:#d8c7b8; --accent:#744c94; --warn:#8e3b2f; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--canvas); color:var(--ink); font-family: Inter, ui-sans-serif, system-ui, sans-serif; line-height:1.55; }
    main { width:min(980px, calc(100vw - 32px)); margin:0 auto; padding:34px 0 64px; }
    header { border-bottom:2px solid var(--line); padding-bottom:22px; margin-bottom:24px; }
    h1 { font-family: Georgia, serif; font-size:56px; line-height:1.04; margin:0 0 14px; letter-spacing:0; }
    h2 { font-size:28px; margin:34px 0 12px; }
    h3 { font-size:13px; color:var(--accent); text-transform:uppercase; letter-spacing:.08em; margin:0 0 10px; font-family:Consolas, monospace; }
    p, li { font-size:18px; }
    blockquote { margin:18px 0; padding:18px 22px; background:#21170f; color:#fffaf2; border-radius:8px; font-family:Georgia, serif; font-size:25px; line-height:1.3; }
    pre { background:#21170f; color:#fffaf2; border-radius:8px; padding:16px; overflow:auto; font-size:14px; }
    code { font-family:Consolas, monospace; }
    img { max-width:100%; border-radius:8px; border:1px solid var(--line); background:#fff; }
    figcaption { color:#75675e; font-size:13px; margin-top:6px; }
    table { width:100%; border-collapse:collapse; background:var(--paper); margin:16px 0; }
    td { border:1px solid var(--line); padding:10px; vertical-align:top; }
    .meta { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-top:18px; }
    .meta div { background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:12px; }
    .meta span { display:block; color:#75675e; font:700 12px/1.2 Consolas, monospace; text-transform:uppercase; margin-bottom:6px; }
    .warning { color:var(--warn); font-weight:800; }
    .candidate-image { margin:22px 0; }
    @media (max-width: 760px) { h1 { font-size:38px; } .meta { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h3>Private Rendered Candidate Proof</h3>
      <h1>${escapeHtml(title)}</h1>
      <p class="warning">This is a rendered candidate proof, not a publication approval.</p>
      <figure class="candidate-image"><img src="${escapeHtml(contract.candidateImage)}" alt="Private candidate image contract" /><figcaption>Private candidate image contract; public copy is blocked until approval.</figcaption></figure>
      <section class="meta">
        <div><span>Slug</span><code>${escapeHtml(slug)}</code></div>
        <div><span>Markdown SHA</span><code>${escapeHtml(markdownSha256.slice(0, 16))}</code></div>
        <div><span>Quality Review</span><code>${reviewRejectCount(review)} rejects</code></div>
        <div><span>Image Contract</span><code>${escapeHtml(contract.status)}</code></div>
        <div><span>Public Copy</span><code>${contract.publicCopyAllowed ? "allowed" : "blocked"}</code></div>
        <div><span>Approval</span><code>required</code></div>
      </section>
    </header>
    <article>${bodyHtml}</article>
  </main>
</body>
</html>
`;
}

function reviewRejectCount(review) {
  return Array.isArray(review.scorecard) ? review.scorecard.filter((row) => row?.verdict === "reject").length : -1;
}

async function main() {
  const slug = getArg("--slug");
  if (!slug) throw new Error("--slug is required");
  const blogDir = resolve(getArg("--blog-dir") ?? DEFAULT_BLOG_DIR);
  const draftPath = resolve(blogDir, `${slug}.md`);
  const reviewPath = resolve(getArg("--quality-review") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-second-human-quality-review-result.json`));
  const contractPath = resolve(getArg("--image-contract") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-private-image-contract.json`));
  const output = resolve(getArg("--output") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-rendered-candidate.html`));
  const summaryPath = resolve(getArg("--summary") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-rendered-candidate-summary.json`));
  const check = hasArg("--check");
  const markdown = await readFile(draftPath, "utf8");
  const markdownSha256 = sha256(markdown);
  const { frontmatter, body } = parseMarkdown(markdown);
  const title = frontmatterValue(frontmatter, "title") || slug;
  const review = JSON.parse(await readFile(reviewPath, "utf8"));
  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  const contractText = await readFile(contractPath, "utf8");
  const bodyHtml = renderMarkdown(body);
  const html = buildHtml({ title, slug, bodyHtml, contract, review, markdownSha256 });
  const htmlSha256 = sha256(html).toUpperCase();
  const summary = {
    schema: "vibecode-private-rendered-candidate/v1",
    slug,
    title,
    draftPath,
    markdownSha256,
    output,
    htmlSha256,
    reviewPath,
    reviewRejectCount: reviewRejectCount(review),
    imageContract: contractPath,
    imageContractSha256: sha256(contractText).toUpperCase(),
    publicCandidate: false,
    approvalRequired: true,
    bodyTextLength: body.replace(/\s+/g, " ").trim().length,
    renderedSections: [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim()),
  };
  const summaryText = `${JSON.stringify(summary, null, 2)}\n`;
  const failures = [];

  if (!/^draft:\s*true\s*$/m.test(frontmatter)) failures.push("rendered candidate source must remain draft:true");
  if (!body.includes("approval_candidate=false")) failures.push("rendered candidate source must keep approval_candidate=false");
  if (review.markdownSha256 !== markdownSha256) failures.push("quality review markdownSha256 must match rendered candidate source");
  if (reviewRejectCount(review) !== 0) failures.push("rendered candidate requires zero quality-review rejects");
  if (contract.markdownSha256 !== markdownSha256) failures.push("image contract markdownSha256 must match rendered candidate source");
  if (contract.publicCopyAllowed !== false) failures.push("private rendered candidate requires publicCopyAllowed=false");
  for (const required of ["The Paragraph That Gets Past You", "The Failure Is Not Style", "Visual Evidence", "Approval Candidate Verdict"]) {
    if (!body.includes(required)) failures.push(`rendered candidate source missing required section: ${required}`);
  }

  if (check) {
    if (!existsSync(output)) failures.push(`rendered candidate missing: ${output}`);
    if (!existsSync(summaryPath)) failures.push(`rendered candidate summary missing: ${summaryPath}`);
    if (existsSync(output) && (await readFile(output, "utf8")) !== html) failures.push("rendered candidate HTML is stale");
    if (existsSync(summaryPath) && (await readFile(summaryPath, "utf8")) !== summaryText) {
      failures.push("rendered candidate summary is stale");
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html, "utf8");
    await writeFile(summaryPath, summaryText, "utf8");
  }

  process.stdout.write(`private_rendered_candidate=${output}\n`);
  process.stdout.write(`private_rendered_candidate_summary=${summaryPath}\n`);
  process.stdout.write(`private_rendered_candidate_sha256=${htmlSha256}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("private_rendered_candidate=fail\n");
    return 1;
  }
  process.stdout.write("private_rendered_candidate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

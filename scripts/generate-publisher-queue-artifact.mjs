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

function allCodeBlocks(text) {
  return [...text.matchAll(/```(?:txt)?\r?\n([\s\S]*?)```/g)].map((match) => match[1].trim());
}

function queueValue(block, key) {
  const match = block.match(new RegExp(`^\\s*${key}:\\s*"?([^"\\r\\n]+)"?\\s*$`, "m"));
  return match ? match[1].trim() : "";
}

function queueList(block, key) {
  const lines = block.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^\\s*${key}:\\s*$`).test(line));
  if (start === -1) return [];
  const items = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\s*[a-zA-Z_]+:/.test(line)) break;
    const match = line.match(/^\s*-\s+(.+)$/);
    if (match) items.push(match[1].trim().replace(/^["']|["']$/g, ""));
  }
  return items;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function extractQueue({ markdown, slug }) {
  const { frontmatter, body } = parseMarkdown(markdown);
  const title = getFrontmatterValue(frontmatter, "title") || slug;
  const queueBlock = allCodeBlocks(body).find((block) => block.includes("publisher_queue_item:"));
  if (!queueBlock) throw new Error(`${slug}.md does not include a publisher_queue_item block`);
  const requiredProof = queueList(queueBlock, "required_proof");
  const queue = {
    title: queueValue(queueBlock, "title") || title,
    sourceUrl: queueValue(queueBlock, "source_url"),
    readerDecision: queueValue(queueBlock, "reader_decision"),
    requiredProof,
    imageState: queueValue(queueBlock, "image_state"),
    publishState: queueValue(queueBlock, "publish_state"),
    approvalRequired: queueValue(queueBlock, "approval_required"),
    raw: queueBlock,
  };
  return { title, queue };
}

function buildHtml({ slug, title, queue }) {
  const proofItems = queue.requiredProof.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - Publisher Queue Artifact</title>
  <style>
    :root {
      --ink: #20170f;
      --muted: #75675e;
      --paper: #fffaf2;
      --canvas: #f3eadf;
      --line: #d8c7b8;
      --accent: #744c94;
      --warn: #8e3b2f;
      --ok: #255b42;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--canvas);
      color: var(--ink);
      line-height: 1.45;
    }
    main { width: min(1180px, calc(100vw - 32px)); margin: 0 auto; padding: 36px 0 56px; }
    header {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: end;
      border-bottom: 2px solid var(--line);
      padding-bottom: 22px;
    }
    h1 { margin: 0; font-family: Georgia, serif; font-size: 58px; line-height: 1.02; letter-spacing: 0; }
    h2 { margin: 0 0 12px; font-size: 22px; }
    h3 {
      margin: 0 0 8px;
      color: var(--accent);
      font: 700 14px/1.2 Consolas, "SFMono-Regular", monospace;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    p { margin: 0 0 12px; }
    code, pre { font-family: Consolas, "SFMono-Regular", monospace; }
    pre {
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      border-radius: 8px;
      background: #21170f;
      color: #fffaf2;
      padding: 16px;
      font-size: 13px;
    }
    .meta, .card, .queue, .proof {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
      min-width: 0;
    }
    .meta div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid var(--line);
      padding-top: 8px;
      margin-top: 8px;
    }
    .meta div:first-child { border-top: 0; padding-top: 0; margin-top: 0; }
    .section { margin-top: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .queue { display: grid; grid-template-columns: 1fr 360px; gap: 22px; border-top: 5px solid var(--accent); }
    .status {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 7px 12px;
      background: #f7dfdc;
      color: var(--warn);
      font: 700 13px/1 Consolas, "SFMono-Regular", monospace;
      text-transform: uppercase;
    }
    .stack { display: grid; gap: 10px; }
    .row { display: grid; grid-template-columns: 160px 1fr; gap: 14px; border-top: 1px solid var(--line); padding-top: 10px; }
    .row:first-child { border-top: 0; padding-top: 0; }
    .label { color: var(--muted); font: 700 13px/1.2 Consolas, "SFMono-Regular", monospace; text-transform: uppercase; }
    .proof { border-top: 5px solid var(--ok); }
    .proof ul { margin: 0; padding-left: 20px; }
    .proof li { margin: 8px 0; }
    .reject { background: #21170f; color: #fffaf2; border-radius: 8px; padding: 18px; font-family: Georgia, serif; font-size: 26px; line-height: 1.22; }
    @media (max-width: 900px) {
      header, .grid, .queue { grid-template-columns: 1fr; }
      h1 { font-size: 38px; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h3>Private Publisher Queue Artifact</h3>
        <h1>${escapeHtml(title)}</h1>
        <p>This artifact shows the queue item the article asks a publisher to carry before public scheduling.</p>
      </div>
      <aside class="meta" aria-label="Artifact metadata">
        <div><span>Slug</span><code>${escapeHtml(slug)}</code></div>
        <div><span>Queue State</span><code>${escapeHtml(queue.publishState)}</code></div>
        <div><span>Human Approval</span><code>${queue.approvalRequired === "true" ? "required" : "missing"}</code></div>
        <div><span>Public Candidate</span><code>false</code></div>
      </aside>
    </header>

    <section class="section queue">
      <div class="stack">
        <div><span class="status">publish ${escapeHtml(queue.publishState || "unknown")}</span></div>
        <div class="row"><div class="label">reader decision</div><div>${escapeHtml(queue.readerDecision)}</div></div>
        <div class="row"><div class="label">source URL</div><div><code>${escapeHtml(queue.sourceUrl)}</code></div></div>
        <div class="row"><div class="label">image state</div><div><code>${escapeHtml(queue.imageState)}</code>; image cannot be reused across posts without a fresh contract.</div></div>
        <div class="row"><div class="label">approval stop</div><div>Do not publish, schedule, email, or book anything until the human quality review accepts the exact markdown hash.</div></div>
      </div>
      <div class="proof">
        <h2>Required Proof</h2>
        <ul>${proofItems}</ul>
      </div>
    </section>

    <section class="section grid">
      <article class="card">
        <h2>Queue Item</h2>
        <pre>${escapeHtml(queue.raw)}</pre>
      </article>
      <article class="card">
        <h2>Reject Condition</h2>
        <div class="reject">If this receipt is missing, the post is not a draft queue item. It is just output waiting to escape.</div>
      </article>
    </section>
  </main>
</body>
</html>
`;
}

async function main() {
  const slug = getArg("--slug");
  if (!slug) throw new Error("--slug is required");
  const blogDir = resolve(getArg("--blog-dir") ?? DEFAULT_BLOG_DIR);
  const draftPath = resolve(blogDir, `${slug}.md`);
  const output = resolve(getArg("--output") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-publisher-queue-artifact.html`));
  const summaryPath = resolve(getArg("--summary") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-publisher-queue-artifact-generation-summary.json`));
  const check = hasArg("--check");
  const markdown = await readFile(draftPath, "utf8");
  const markdownSha256 = createHash("sha256").update(markdown).digest("hex");
  const { title, queue } = extractQueue({ markdown, slug });
  const html = buildHtml({ slug, title, queue });
  const artifactSha256 = createHash("sha256").update(html).digest("hex").toUpperCase();
  const summary = {
    schema: "vibecode-publisher-queue-artifact/v1",
    slug,
    title,
    draftPath,
    markdownSha256,
    output,
    artifactSha256,
    requiredFields: {
      sourceUrl: queue.sourceUrl !== "",
      readerDecision: queue.readerDecision !== "",
      requiredProof: queue.requiredProof.length > 0,
      imageState: queue.imageState !== "",
      publishBlocked: queue.publishState === "blocked",
      approvalRequired: queue.approvalRequired === "true",
    },
  };
  const summaryText = `${JSON.stringify(summary, null, 2)}\n`;
  const failures = [];
  for (const [key, value] of Object.entries(summary.requiredFields)) {
    if (!value) failures.push(`missing_or_invalid_${key}`);
  }

  if (check) {
    if (!existsSync(output)) failures.push(`missing artifact: ${output}`);
    if (!existsSync(summaryPath)) failures.push(`missing summary: ${summaryPath}`);
    if (existsSync(output)) {
      const existingHtml = await readFile(output, "utf8");
      const existingSha = createHash("sha256").update(existingHtml).digest("hex").toUpperCase();
      if (existingSha !== artifactSha256) failures.push("artifact is stale");
    }
    if (existsSync(summaryPath)) {
      const existing = JSON.parse(await readFile(summaryPath, "utf8"));
      if (existing.markdownSha256 !== markdownSha256) failures.push("summary markdown hash is stale");
      if (existing.artifactSha256 !== artifactSha256) failures.push("summary artifact hash is stale");
    }
  }

  if (failures.length > 0) {
    throw new Error(`publisher queue artifact is not ready:\n- ${failures.join("\n- ")}`);
  }

  if (!check) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html, "utf8");
    await writeFile(summaryPath, summaryText, "utf8");
  }

  process.stdout.write(`publisher_queue_artifact=${output}\n`);
  process.stdout.write(`publisher_queue_summary=${summaryPath}\n`);
  process.stdout.write(`publisher_queue_artifact_sha256=${artifactSha256}\n`);
  process.stdout.write("publisher_queue_artifact=pass\n");
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

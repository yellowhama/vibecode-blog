import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";
const DEFAULT_OUTPUT_DIR = "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
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

function section(body, heading) {
  const pattern = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "im");
  const match = body.match(pattern);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const next = body.slice(start).search(/^##\s+/im);
  return body.slice(start, next === -1 ? undefined : start + next).trim();
}

function sectionAny(body, headings) {
  for (const heading of headings) {
    const value = section(body, heading);
    if (value) return value;
  }
  return "";
}

function allCodeBlocks(text) {
  return [...text.matchAll(/```(?:txt)?\r?\n([\s\S]*?)```/g)].map((match) => match[1].trim());
}

function allImageRefs(text) {
  return [...text.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((match) => ({
    alt: match[1].trim(),
    src: match[2].trim(),
  }));
}

function receiptValue(block, key) {
  const match = block.match(new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

function localImageSrc(path) {
  if (!path) return "";
  if (/^[a-z]+:\/\//i.test(path)) return path;
  if (/^[A-Za-z]:[\\/]/.test(path)) return `file:///${path.replaceAll("\\", "/")}`;
  return path;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function paragraph(text) {
  return text
    .split(/\r?\n\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .find((item) => !item.startsWith("```") && !item.startsWith("|") && !item.startsWith("!["))
    ?.replace(/\r?\n/g, " ")
    .trim() ?? "";
}

function buildHtml({ slug, title, description, sha256, body }) {
  const opening = sectionAny(body, ["Opening Pressure", "The Paragraph That Fooled Me", "The Paragraph That Gets Past You"]);
  const reviewDesk = section(body, "What Changes In The Next Draft Review");
  const realFailure = section(body, "Real Failure Evidence");
  const readerTransfer = sectionAny(body, [
    "Reader Transfer",
    "The Table To Use Before You Prompt Again",
    "Use This Before You Prompt Again",
  ]);
  const editorial = section(body, "Editorial Critique Result");
  const risk = section(body, "Draft Risk");
  const codeBlocks = allCodeBlocks(body);
  const weakParagraph = codeBlocks.find((block) => block.includes("AI agents are transforming content operations")) ?? "";
  const packetFailure = codeBlocks.find((block) => block.includes("source_changed_claim=no")) ?? "";
  const rewritten = codeBlocks.find((block) => block.includes("The draft generator should not be allowed")) ?? "";
  const earlierOpening = codeBlocks.find((block) => block.includes("The first real test was boring")) ?? "";
  const currentOpening = codeBlocks.find((block) => block.includes("The first honest test of the writing system")) ?? "";
  const redPen = codeBlocks.find((block) => block.includes("If the paragraph can be moved")) ?? "";
  const autopsyBlank = codeBlocks.find((block) => block.includes("paragraph=") && block.includes("keep_or_rewrite=") && !block.includes("AI agents are transforming")) ?? "";
  const autopsyExample = codeBlocks.find((block) => block.includes("paragraph=AI agents are transforming content operations")) ?? "";
  const reviewDeskWeak = codeBlocks.find((block) => block.includes("Agentic systems are changing how teams create")) ?? "";
  const oldReview = codeBlocks.find((block) => block.includes("make it more specific")) ?? "";
  const harnessReview = codeBlocks.find((block) => block.includes("source_changed_claim=which source forced")) ?? "";
  const reviewDeskRewrite = codeBlocks.find((block) => block.includes("The first draft looked fine until the review form")) ?? "";
  const realFailureReceipt = codeBlocks.find((block) => block.includes("failed_draft_commit=0f07239")) ?? "";
  const failedOpening = codeBlocks.find((block) => block.includes("source note -> six packet files")) ?? "";
  const remainingBlockers = codeBlocks.find((block) => block.includes("human_critique=still_open")) ?? "";

  const cards = [
    ["Weak paragraph", weakParagraph],
    ["Packet rejection", packetFailure],
    ["Rewritten paragraph", rewritten],
    ["Earlier opening", earlierOpening],
    ["Current opening", currentOpening],
    ["Cold-reader red pen", redPen],
    ["One-minute autopsy", autopsyBlank],
    ["Autopsy example", autopsyExample],
  ];
  const reviewDeskCards = [
    ["Review-desk weak opening", reviewDeskWeak],
    ["Old style review", oldReview],
    ["Harness review fields", harnessReview],
    ["Review-desk rewrite", reviewDeskRewrite],
  ];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - Draft Review Artifact</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #20170f;
      --muted: #74675d;
      --paper: #fffaf2;
      --canvas: #f4eadf;
      --line: #d9c8b8;
      --accent: #744c94;
      --bad: #8e2f2f;
      --good: #255b42;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--canvas);
      color: var(--ink);
      line-height: 1.55;
    }
    main { width: min(1180px, calc(100vw - 32px)); margin: 0 auto; padding: 40px 0 64px; }
    header { display: grid; grid-template-columns: 1.25fr .75fr; gap: 24px; align-items: end; border-bottom: 2px solid var(--line); padding-bottom: 24px; }
    h1 { margin: 0; font-family: Georgia, serif; font-size: clamp(34px, 5vw, 64px); line-height: 1.02; letter-spacing: 0; }
    h2 { margin: 0 0 14px; font-size: 20px; letter-spacing: 0; }
    h3 { margin: 0 0 10px; font-size: 15px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
    p { margin: 0 0 14px; }
    code, pre { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; padding: 16px; background: #21170f; color: #fffaf2; border-radius: 8px; font-size: 13px; }
    .meta { border: 1px solid var(--line); background: var(--paper); border-radius: 8px; padding: 18px; font-size: 14px; }
    .meta div { display: flex; justify-content: space-between; gap: 16px; border-top: 1px solid var(--line); padding-top: 9px; margin-top: 9px; }
    .meta div:first-child { border-top: 0; padding-top: 0; margin-top: 0; }
    .section { margin-top: 28px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
    .card { background: var(--paper); border: 1px solid var(--line); border-radius: 8px; padding: 18px; min-width: 0; }
    .card.bad { border-top: 5px solid var(--bad); }
    .card.good { border-top: 5px solid var(--good); }
    .card.accent { border-top: 5px solid var(--accent); }
    .pull { background: var(--ink); color: var(--paper); border-radius: 8px; padding: 22px; font-family: Georgia, serif; font-size: 28px; line-height: 1.2; }
    .prose { font-size: 16px; color: var(--muted); }
    .decision { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .pill { background: var(--paper); border: 1px solid var(--line); border-radius: 8px; padding: 14px; }
    .pill strong { display: block; margin-bottom: 5px; color: var(--ink); }
    @media (max-width: 820px) {
      header, .grid, .decision { grid-template-columns: 1fr; }
      main { width: min(100vw - 20px, 1180px); padding-top: 24px; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h3>Private Draft Review Artifact</h3>
        <h1>${escapeHtml(title)}</h1>
        <p class="prose">${escapeHtml(description)}</p>
      </div>
      <aside class="meta" aria-label="Review metadata">
        <div><span>Slug</span><code>${escapeHtml(slug)}</code></div>
        <div><span>Markdown SHA-256</span><code>${escapeHtml(sha256.slice(0, 16))}...</code></div>
        <div><span>Publication state</span><code>draft_only</code></div>
        <div><span>Decision</span><code>keep_internal_example</code></div>
      </aside>
    </header>

    <section class="section">
      <div class="pull">Do not ask whether the prose is polished. Ask what permission the paragraph is trying to smuggle past you.</div>
    </section>

    <section class="section grid">
      <article class="card">
        <h2>Opening Pressure</h2>
        <p>${escapeHtml(paragraph(opening))}</p>
      </article>
      <article class="card">
        <h2>Current Risk</h2>
        <p>${escapeHtml(paragraph(risk))}</p>
      </article>
    </section>

    <section class="section grid">
      ${cards
        .map(([label, content], index) => `<article class="card ${index === 0 ? "bad" : index === 2 || index === 4 || index === 7 ? "good" : "accent"}">
        <h2>${escapeHtml(label)}</h2>
        <pre>${escapeHtml(content || "missing")}</pre>
      </article>`)
        .join("\n")}
    </section>

    <section class="section">
      <h2>Review Desk Protocol</h2>
      <p class="prose">${escapeHtml(paragraph(reviewDesk))}</p>
      <div class="grid">
        ${reviewDeskCards
          .map(([label, content], index) => `<article class="card ${index === 0 || index === 1 ? "bad" : "good"}">
          <h2>${escapeHtml(label)}</h2>
          <pre>${escapeHtml(content || "missing")}</pre>
        </article>`)
          .join("\n")}
      </div>
    </section>

    <section class="section">
      <h2>Real Failed-Draft Trace</h2>
      <p class="prose">${escapeHtml(paragraph(realFailure))}</p>
      <div class="grid">
        <article class="card accent">
          <h2>Evidence Receipt</h2>
          <pre>${escapeHtml(realFailureReceipt || "missing")}</pre>
        </article>
        <article class="card bad">
          <h2>Failed Opening</h2>
          <pre>${escapeHtml(failedOpening || "missing")}</pre>
        </article>
        <article class="card good">
          <h2>Repair Signal</h2>
          <p>Loop 45 moved the failure into the first screen: the weak paragraph appears first, the autopsy fields come back empty, and the editor has a visible reason to reject the prose.</p>
        </article>
        <article class="card accent">
          <h2>Remaining Blockers</h2>
          <pre>${escapeHtml(remainingBlockers || "missing")}</pre>
        </article>
      </div>
    </section>

    <section class="section">
      <h2>Reviewer Decision</h2>
      <div class="decision">
        <div class="pill"><strong>Promote?</strong>No. Keep private until human critique, rendered candidate proof, image contract, and hash approval exist.</div>
        <div class="pill"><strong>What improved?</strong>The reader now gets a reusable paragraph autopsy and review-desk protocol instead of only a principle.</div>
        <div class="pill"><strong>What to inspect next?</strong>Whether the artifact stack and review protocol are vivid enough for a cold reader who has not followed the internal build.</div>
      </div>
    </section>

    <section class="section grid">
      <article class="card">
        <h2>Reader Transfer</h2>
        <p>${escapeHtml(paragraph(readerTransfer))}</p>
      </article>
      <article class="card">
        <h2>Editorial Critique</h2>
        <p>${escapeHtml(paragraph(editorial))}</p>
      </article>
    </section>
  </main>
</body>
</html>`;
}

function tableBlocks(text) {
  const blocks = [];
  let current = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.trim().startsWith("|")) {
      current.push(line);
    } else if (current.length > 0) {
      if (current.length >= 2) blocks.push(current.join("\n"));
      current = [];
    }
  }
  if (current.length >= 2) blocks.push(current.join("\n"));
  return blocks;
}

function allHeadings(text) {
  return [...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
}

function buildGenericHtml({ slug, title, description, sha256, body }) {
  const opening = sectionAny(body, ["Opening Pressure", "The Paragraph That Fooled Me", "The Paragraph That Gets Past You"]);
  const readerProblem = sectionAny(body, ["Reader Problem", "The Failure Is Not Style", "The Reader Problem"]);
  const angle = sectionAny(body, ["Angle", "The Harness Is the Point", "The Operating Claim"]);
  const sourceThread = section(body, "Source Thread");
  const pattern = section(body, "The Pattern Worth Stealing");
  const transfer = sectionAny(body, [
    "Reader Transfer",
    "The Table To Use Before You Prompt Again",
    "Use This Before You Prompt Again",
  ]);
  const verdict = section(body, "Approval Candidate Verdict");
  const boundary = section(body, "Boundary");
  const risk = section(body, "Draft Risk");
  const visual = section(body, "Visual Evidence");
  const codeBlocks = allCodeBlocks(body);
  const tables = tableBlocks(body);
  const headings = allHeadings(body);
  const imageRefs = allImageRefs(body);
  const firstCode = codeBlocks[0] ?? "missing";
  const sourceMap = codeBlocks.find((block) => block.includes("skill:") || block.includes("Research Scout")) ?? "missing";
  const beforeAfter = codeBlocks.find((block) => block.includes("before:") && block.includes("after:")) ?? "missing";
  const receipt = codeBlocks.find((block) => block.includes("approval_candidate=false")) ?? "missing";
  const visualReceipt =
    codeBlocks.find((block) => block.includes("visual_artifact=") || block.includes("source_draft_visual_sha256=")) ??
    "missing";
  const queueReceipt =
    codeBlocks.find((block) => block.includes("publisher_queue_artifact=") || block.includes("publisher_queue_required_text=")) ??
    "";
  const visualArtifact = receiptValue(visualReceipt, "visual_artifact");
  const visualArtifactSrc = localImageSrc(visualArtifact || imageRefs[0]?.src || "");
  const queueScreenshot = receiptValue(queueReceipt, "publisher_queue_screenshot");
  const queueScreenshotSrc = localImageSrc(queueScreenshot);
  const transferTable = tables[0] ?? "missing";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - Source Draft Review Artifact</title>
  <style>
    :root {
      color-scheme: light;
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
      line-height: 1.55;
    }
    main { width: min(1180px, calc(100vw - 32px)); margin: 0 auto; padding: 40px 0 64px; }
    header { display: grid; grid-template-columns: 1.2fr .8fr; gap: 24px; align-items: end; border-bottom: 2px solid var(--line); padding-bottom: 24px; }
    h1 { margin: 0; font-family: Georgia, serif; font-size: clamp(34px, 5vw, 64px); line-height: 1.02; letter-spacing: 0; }
    h2 { margin: 0 0 12px; font-size: 20px; letter-spacing: 0; }
    h3 { margin: 0 0 10px; color: var(--muted); font-size: 14px; letter-spacing: .08em; text-transform: uppercase; }
    p { margin: 0 0 14px; }
    code, pre { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; padding: 16px; background: #21170f; color: #fffaf2; border-radius: 8px; font-size: 13px; }
    .meta, .card, .decision { background: var(--paper); border: 1px solid var(--line); border-radius: 8px; padding: 18px; min-width: 0; }
    .meta div { display: flex; justify-content: space-between; gap: 16px; border-top: 1px solid var(--line); padding-top: 9px; margin-top: 9px; }
    .meta div:first-child { border-top: 0; padding-top: 0; margin-top: 0; }
    .section { margin-top: 28px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
    .three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .card.opening { border-top: 5px solid var(--warn); }
    .card.good { border-top: 5px solid var(--ok); }
    .card.accent { border-top: 5px solid var(--accent); }
    .pull { background: var(--ink); color: var(--paper); border-radius: 8px; padding: 22px; font-family: Georgia, serif; font-size: 28px; line-height: 1.2; }
    .muted { color: var(--muted); }
    .visual-img { display: block; width: 100%; max-height: 420px; object-fit: contain; background: #ece0d2; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 14px; }
    .image-list { margin-top: 12px; font-size: 13px; color: var(--muted); overflow-wrap: anywhere; }
    .queue-proof { border-top: 5px solid var(--ok); }
    ul { margin: 0; padding-left: 20px; }
    li { margin: 5px 0; }
    @media (max-width: 860px) {
      header, .grid, .three { grid-template-columns: 1fr; }
      main { width: min(100vw - 20px, 1180px); padding-top: 24px; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h3>Private Source Draft Review Artifact</h3>
        <h1>${escapeHtml(title)}</h1>
        <p class="muted">${escapeHtml(description)}</p>
      </div>
      <aside class="meta" aria-label="Review metadata">
        <div><span>Slug</span><code>${escapeHtml(slug)}</code></div>
        <div><span>Markdown SHA-256</span><code>${escapeHtml(sha256.slice(0, 16))}...</code></div>
        <div><span>Publication state</span><code>draft_only</code></div>
        <div><span>Approval candidate</span><code>false</code></div>
      </aside>
    </header>

    <section class="section">
      <div class="pull">Review the evidence spine, not the smoothness of the prose.</div>
    </section>

    <section class="section three">
      <article class="decision">
        <h2>Reader Decision</h2>
        <p>${escapeHtml(paragraph(readerProblem))}</p>
      </article>
      <article class="decision">
        <h2>Operating Claim</h2>
        <p>${escapeHtml(paragraph(angle))}</p>
      </article>
      <article class="decision">
        <h2>Approval Boundary</h2>
        <p>${escapeHtml(paragraph(verdict))}</p>
      </article>
    </section>

    <section class="section grid">
      <article class="card opening">
        <h2>Opening Evidence</h2>
        <p>${escapeHtml(paragraph(opening))}</p>
        <pre>${escapeHtml(firstCode)}</pre>
      </article>
      <article class="card accent">
        <h2>Source Trace</h2>
        <p>${escapeHtml(paragraph(sourceThread))}</p>
        <pre>${escapeHtml(sourceMap)}</pre>
      </article>
      <article class="card good">
        <h2>Before/After Trace</h2>
        <p>${escapeHtml(paragraph(pattern))}</p>
        <pre>${escapeHtml(beforeAfter)}</pre>
      </article>
      <article class="card accent">
        <h2>Reader Transfer Table</h2>
        <p>${escapeHtml(paragraph(transfer))}</p>
        <pre>${escapeHtml(transferTable)}</pre>
      </article>
    </section>

    <section class="section">
      <article class="card good">
        <h2>Visual Evidence</h2>
        ${
          visualArtifactSrc
            ? `<img class="visual-img" src="${escapeHtml(visualArtifactSrc)}" alt="Source draft visual artifact preview" />`
            : ""
        }
        <p>${escapeHtml(paragraph(visual))}</p>
        <pre>${escapeHtml(visualReceipt)}</pre>
        ${
          imageRefs.length > 0
            ? `<div class="image-list"><strong>Markdown image refs:</strong><ul>${imageRefs
                .map((image) => `<li>${escapeHtml(image.alt || "untitled")} - <code>${escapeHtml(image.src)}</code></li>`)
                .join("")}</ul></div>`
            : ""
        }
      </article>
    </section>

    ${
      queueReceipt
        ? `<section class="section">
      <article class="card queue-proof">
        <h2>Queue Evidence</h2>
        ${
          queueScreenshotSrc
            ? `<img class="visual-img" src="${escapeHtml(queueScreenshotSrc)}" alt="Publisher queue artifact screenshot" />`
            : ""
        }
        <p>The draft includes a rendered publisher queue artifact so the queue advice can be inspected as an object, not only as prose.</p>
        <pre>${escapeHtml(queueReceipt)}</pre>
      </article>
    </section>`
        : ""
    }

    <section class="section grid">
      <article class="card">
        <h2>Packet Receipt</h2>
        <pre>${escapeHtml(receipt)}</pre>
      </article>
      <article class="card">
        <h2>Draft Risk</h2>
        <p>${escapeHtml(paragraph(risk))}</p>
      </article>
      <article class="card">
        <h2>Boundary</h2>
        <p>${escapeHtml(paragraph(boundary))}</p>
      </article>
      <article class="card">
        <h2>Structure Map</h2>
        <ul>${headings.map((heading) => `<li>${escapeHtml(heading)}</li>`).join("")}</ul>
      </article>
    </section>

    <section class="section">
      <div class="decision">
        <h2>Reviewer Decision</h2>
        <p>This artifact does not approve publication. The reviewer must decide whether the draft has enough source-backed scene, proof, transfer, voice, and image contract to become an approval candidate. Any rejection keeps the draft private.</p>
      </div>
    </section>
  </main>
</body>
</html>`;
}

async function main() {
  const slug = getArg("--slug") ?? "writing-harness-not-more-prompts";
  const blogDir = getArg("--blog-dir") ?? DEFAULT_BLOG_DIR;
  const output =
    getArg("--output") ?? resolve(DEFAULT_OUTPUT_DIR, `${slug}-review-artifact.html`);
  const draftPath = resolve(blogDir, `${slug}.md`);
  const markdown = await readFile(draftPath, "utf8");
  const { frontmatter, body } = parseMarkdown(markdown);

  if (!/^draft:\s*true\s*$/m.test(frontmatter)) {
    throw new Error(`${slug}.md is not a private draft`);
  }
  const builder = body.includes("paragraph=") && body.includes("keep_or_rewrite=")
    ? buildHtml
    : buildGenericHtml;

  const html = builder({
    slug,
    title: getFrontmatterValue(frontmatter, "title") || slug,
    description: getFrontmatterValue(frontmatter, "description"),
    sha256: createHash("sha256").update(markdown).digest("hex"),
    body,
  });

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html, "utf8");
  process.stdout.write(`draft_review_artifact=${output}\n`);
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

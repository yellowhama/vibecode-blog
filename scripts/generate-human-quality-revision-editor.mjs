import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DEFAULT_PLAN =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-revision-plan.json";
const DEFAULT_DRAFT = "src/data/blog/writing-harness-not-more-prompts.md";
const DEFAULT_OUTPUT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-revision-editor.html";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clean(value) {
  return String(value ?? "").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return markdown;
  const end = markdown.indexOf("\n---", 3);
  return end === -1 ? markdown : markdown.slice(end + 4);
}

function markdownPreview(value, max = 900) {
  const text = clean(value).replace(/\s+/g, " ");
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function sectionText(markdown, sectionName) {
  const body = stripFrontmatter(markdown);
  if (!sectionName || sectionName === "Opening") {
    const firstHeading = body.search(/^##\s+/m);
    return markdownPreview(firstHeading === -1 ? body : body.slice(0, firstHeading));
  }
  const pattern = new RegExp(`^##\\s+${sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
  const match = pattern.exec(body);
  if (!match) return "";
  const start = match.index + match[0].length;
  const rest = body.slice(start);
  const next = rest.search(/^##\s+/m);
  return markdownPreview(next === -1 ? rest : rest.slice(0, next));
}

function repairPrompt(plan, item) {
  return [
    `Revise only the anchored body area for ${plan.slug}.`,
    "",
    `Scorecard row: ${item.scorecardLabel}`,
    `Target section: ${item.targetSection}`,
    `Target quote: ${item.targetQuote}`,
    `Reviewer problem: ${item.reviewerProblem}`,
    `Required change: ${item.requiredChange}`,
    "",
    "Constraints:",
    ...asArray(item.rewriteBrief).map((line) => `- ${line}`),
    "",
    `Acceptance check: ${item.acceptanceCheck}`,
    "",
    "Return a minimal markdown patch. Preserve draft:true and approval_candidate=false.",
  ].join("\n");
}

function renderItem(plan, markdown, item, index) {
  const section = sectionText(markdown, item.targetSection);
  const prompt = repairPrompt(plan, item);
  return `
    <article class="item">
      <div class="item__header">
        <span class="badge">Repair ${index + 1}</span>
        <h2>${escapeHtml(item.scorecardLabel)}</h2>
      </div>
      <dl class="grid">
        <div>
          <dt>Target section</dt>
          <dd>${escapeHtml(item.targetSection)}</dd>
        </div>
        <div>
          <dt>Evidence anchor</dt>
          <dd>${escapeHtml(item.evidenceAnchor?.id)} · ${escapeHtml(item.evidenceAnchor?.label)}</dd>
        </div>
        <div>
          <dt>Reviewer problem</dt>
          <dd>${escapeHtml(item.reviewerProblem)}</dd>
        </div>
        <div>
          <dt>Required change</dt>
          <dd>${escapeHtml(item.requiredChange)}</dd>
        </div>
      </dl>
      <section>
        <h3>Target Quote</h3>
        <blockquote>${escapeHtml(item.targetQuote)}</blockquote>
      </section>
      <section>
        <h3>Current Section Context</h3>
        <pre>${escapeHtml(section || "No section context found.")}</pre>
      </section>
      <section>
        <h3>Narrow Rewrite Brief</h3>
        <ul>
          ${asArray(item.rewriteBrief)
            .map((line) => `<li>${escapeHtml(line)}</li>`)
            .join("")}
        </ul>
      </section>
      <section>
        <h3>Acceptance Check</h3>
        <p>${escapeHtml(item.acceptanceCheck)}</p>
      </section>
      <section>
        <h3>Copy Repair Prompt</h3>
        <textarea readonly>${escapeHtml(prompt)}</textarea>
      </section>
    </article>`;
}

function renderHtml(plan, markdown) {
  const items = asArray(plan.items);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Human Quality Revision Desk - ${escapeHtml(plan.slug)}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #171717;
      --muted: #626262;
      --line: #d9d3c7;
      --paper: #fbfaf7;
      --panel: #ffffff;
      --accent: #9f3f2f;
      --accent-soft: #f2ded8;
      --code: #27221d;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--paper);
      color: var(--ink);
      line-height: 1.55;
    }
    main {
      width: min(1120px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 40px 0 56px;
    }
    header {
      border-bottom: 1px solid var(--line);
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(2rem, 4vw, 3.6rem); line-height: 1.05; letter-spacing: 0; }
    h2 { font-size: 1.35rem; letter-spacing: 0; }
    h3 { font-size: 0.95rem; margin-bottom: 8px; letter-spacing: 0; }
    .lede {
      max-width: 760px;
      margin-top: 14px;
      color: var(--muted);
      font-size: 1.02rem;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
      margin-top: 22px;
    }
    .meta div,
    .item {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
    }
    .meta div { padding: 14px; }
    .label {
      display: block;
      color: var(--muted);
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 3px;
    }
    .item {
      padding: 22px;
      margin-top: 18px;
    }
    .item__header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 4px 9px;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 0.82rem;
      font-weight: 700;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
      margin: 0 0 18px;
    }
    .grid div {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      background: #fffdf9;
    }
    dt {
      color: var(--muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    dd { margin: 0; }
    section + section { margin-top: 18px; }
    blockquote, pre, textarea {
      width: 100%;
      margin: 0;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fffdf9;
      color: var(--code);
    }
    blockquote {
      padding: 14px;
      border-left: 5px solid var(--accent);
    }
    pre {
      min-height: 160px;
      max-height: 320px;
      overflow: auto;
      padding: 14px;
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
      font-size: 0.88rem;
    }
    textarea {
      min-height: 260px;
      resize: vertical;
      padding: 14px;
      font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
      font-size: 0.88rem;
    }
    ul { margin: 0; padding-left: 20px; }
    .empty {
      margin-top: 18px;
      padding: 22px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
    }
  </style>
</head>
<body>
  <main>
    <header>
      <span class="badge">Human Quality Revision Desk</span>
      <h1>${escapeHtml(plan.slug)}</h1>
      <p class="lede">Use this artifact after a real human quality review rejects one or more anchored scorecard rows. It is built for narrow body repair, not a broad style pass.</p>
      <div class="meta">
        <div><span class="label">Plan status</span>${escapeHtml(plan.planStatus)}</div>
        <div><span class="label">Revision items</span>${items.length}</div>
        <div><span class="label">Promotion allowed</span>${escapeHtml(String(plan.promotionAllowed))}</div>
        <div><span class="label">Next gate</span>${escapeHtml(plan.nextGate)}</div>
      </div>
    </header>
    ${
      items.length
        ? items.map((item, index) => renderItem(plan, markdown, item, index)).join("\n")
        : '<section class="empty"><h2>No Body Revision Required</h2><p>The source plan contains no rejected review rows.</p></section>'
    }
  </main>
</body>
</html>
`;
}

function validateEditor(plan, html) {
  const failures = [];
  const items = asArray(plan.items);
  if (plan.schema !== "vibecode-human-quality-revision-plan/v1") {
    failures.push("revision editor plan schema must be vibecode-human-quality-revision-plan/v1");
  }
  if (plan.promotionAllowed !== false) failures.push("revision editor requires promotionAllowed=false");
  if (!html.includes("Human Quality Revision Desk")) failures.push("revision editor missing title");
  if (!html.includes("not a broad style pass")) failures.push("revision editor missing broad-style-pass warning");
  if (!html.includes("Copy Repair Prompt")) failures.push("revision editor missing repair prompt section");
  if (items.length > 0 && !html.includes("Current Section Context")) {
    failures.push("revision editor missing current section context");
  }
  for (const item of items) {
    if (!html.includes(escapeHtml(item.scorecardLabel))) failures.push(`revision editor missing ${item.scorecardLabel}`);
    if (!html.includes(escapeHtml(item.targetQuote))) failures.push(`revision editor missing target quote for ${item.id}`);
    if (!html.includes(escapeHtml(item.requiredChange))) {
      failures.push(`revision editor missing required change for ${item.id}`);
    }
  }
  return failures;
}

async function main() {
  const planPath = resolve(getArg("--plan") ?? DEFAULT_PLAN);
  const draftPath = resolve(getArg("--draft") ?? DEFAULT_DRAFT);
  const output = resolve(getArg("--output") ?? DEFAULT_OUTPUT);
  const check = hasArg("--check");
  const plan = JSON.parse(await readFile(planPath, "utf8"));
  const markdown = await readFile(draftPath, "utf8");
  const html = renderHtml(plan, markdown);
  const failures = validateEditor(plan, html);

  if (check) {
    if (!existsSync(output)) {
      failures.push(`human quality revision editor missing: ${output}`);
    } else if ((await readFile(output, "utf8")) !== html) {
      failures.push("human quality revision editor is stale");
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html, "utf8");
  }

  process.stdout.write(`human_quality_revision_editor=${output}\n`);
  process.stdout.write(`human_quality_revision_editor_items=${asArray(plan.items).length}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("human_quality_revision_editor=fail\n");
    return 1;
  }
  process.stdout.write("human_quality_revision_editor=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

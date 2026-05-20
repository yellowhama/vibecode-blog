import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DEFAULT_TEMPLATE =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-review-template.json";
const DEFAULT_OUTPUT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-quality-review-editor.html";

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

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function defaultDraftPath(template) {
  return `src/data/blog/${template.slug}.md`;
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return markdown;
  const end = markdown.indexOf("\n---", 3);
  return end === -1 ? markdown : markdown.slice(end + 4);
}

function wordCount(value) {
  const words = String(value ?? "").match(/[A-Za-z0-9][A-Za-z0-9'-]*/g);
  return words ? words.length : 0;
}

function cleanParagraph(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/^#+\s*/, "")
    .trim();
}

function collectMarkdownParagraphs(body) {
  const paragraphs = [];
  let inFence = false;
  let buffer = [];
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      inFence = !inFence;
      if (buffer.length) {
        paragraphs.push(cleanParagraph(buffer.join(" ")));
        buffer = [];
      }
      continue;
    }
    if (inFence || !line || line.startsWith("|") || line.startsWith("!") || line.startsWith("- ")) {
      if (buffer.length) {
        paragraphs.push(cleanParagraph(buffer.join(" ")));
        buffer = [];
      }
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      if (buffer.length) {
        paragraphs.push(cleanParagraph(buffer.join(" ")));
        buffer = [];
      }
      continue;
    }
    buffer.push(line);
  }
  if (buffer.length) paragraphs.push(cleanParagraph(buffer.join(" ")));
  return paragraphs.filter((paragraph) => paragraph.length >= 90);
}

function parseDraftContext(markdown, draftPath) {
  const body = stripFrontmatter(markdown);
  const headingMatch = body.match(/^#\s+(.+)$/m);
  const title = headingMatch ? headingMatch[1].trim() : "";
  const headings = Array.from(body.matchAll(/^##\s+(.+)$/gm)).map((match) => match[1].trim());
  const images = Array.from(body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)).map((match) => ({
    alt: match[1].trim(),
    src: match[2].trim(),
  }));
  const receiptLines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) =>
      /^(publication_state|approval_required|approval_candidate|editorial_decision|candidate_blockers|real_failed_draft_evidence|critique|rendered_screenshot|rendered_summary|source_workflow_slug)=/.test(line),
    );
  const paragraphs = collectMarkdownParagraphs(body);
  const opening = paragraphs.slice(0, 3);
  const selected = [];
  for (const paragraph of paragraphs) {
    if (
      selected.length < 8 &&
      /failed|review|reader|evidence|artifact|AutoAgent|red-pen|paragraph|harness/i.test(paragraph)
    ) {
      selected.push(paragraph);
    }
  }
  for (const paragraph of opening) {
    if (!selected.includes(paragraph) && selected.length < 8) selected.unshift(paragraph);
  }
  const context = {
    loaded: true,
    draftPath,
    title,
    wordCount: wordCount(body),
    headings: headings.slice(0, 12),
    images,
    receiptLines,
    opening,
    reviewPassages: selected.slice(0, 8),
  };
  context.evidenceAnchors = buildEvidenceAnchors(context);
  return context;
}

function emptyDraftContext(draftPath) {
  return {
    loaded: false,
    draftPath,
    title: "",
    wordCount: 0,
    headings: [],
    images: [],
    receiptLines: [],
    opening: [],
    reviewPassages: [],
    evidenceAnchors: [],
  };
}

function renderList(items, className, renderItem) {
  if (items.length === 0) return `<p class="${className} empty">No items found.</p>`;
  return `<ul class="${className}">${items.map(renderItem).join("")}</ul>`;
}

function shortText(value, max = 150) {
  const text = cleanParagraph(value);
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function anchor(id, kind, label, text) {
  return { id, kind, label, text: shortText(text, 260) };
}

function buildEvidenceAnchors(context) {
  const anchors = [];
  context.opening.forEach((text, index) => {
    anchors.push(anchor(`opening-${index + 1}`, "opening", `Opening excerpt ${index + 1}`, text));
  });
  context.receiptLines.forEach((text, index) => {
    anchors.push(anchor(`receipt-${index + 1}`, "receipt", `Receipt line ${index + 1}`, text));
  });
  context.images.forEach((image, index) => {
    anchors.push(anchor(`image-${index + 1}`, "image", `Image ${index + 1}`, `${image.src} ${image.alt}`));
  });
  context.reviewPassages.forEach((text, index) => {
    anchors.push(anchor(`passage-${index + 1}`, "passage", `Passage to inspect ${index + 1}`, text));
  });
  return anchors;
}

function buildEditor(template, draftContext) {
  const scorecard = asArray(template.scorecard);
  const blockers = asArray(template.sourcePacket?.currentBlockers);
  const serializedTemplate = JSON.stringify(template).replaceAll("</", "<\\/");
  const serializedDraftContext = JSON.stringify(draftContext).replaceAll("</", "<\\/");
  const openingCards = draftContext.opening
    .map((paragraph, index) => `<article><p class="eyebrow">Opening excerpt ${index + 1}</p><p>${escapeHtml(paragraph)}</p></article>`)
    .join("");
  const reviewPassageCards = draftContext.reviewPassages
    .map(
      (paragraph, index) => `
        <article class="passage">
          <p class="eyebrow">Passage to inspect ${index + 1}</p>
          <p>${escapeHtml(paragraph)}</p>
        </article>`,
    )
    .join("");
  const receiptList = renderList(draftContext.receiptLines, "receipt-list", (line) => `<li><code>${escapeHtml(line)}</code></li>`);
  const imageList = renderList(draftContext.images, "receipt-list", (image) => `<li><code>${escapeHtml(image.src)}</code> ${escapeHtml(image.alt)}</li>`);
  const headingList = renderList(draftContext.headings, "heading-list", (heading) => `<li>${escapeHtml(heading)}</li>`);
  const evidenceAnchorOptions = draftContext.evidenceAnchors
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)} - ${escapeHtml(item.text)}</option>`)
    .join("");

  const scorecardRows = scorecard
    .map(
      (row, index) => `
        <section class="score-row" data-score-row data-index="${index}">
          <div class="score-head">
            <div>
              <p class="eyebrow">Scorecard row ${index + 1}</p>
              <h2>${escapeHtml(row.label)}</h2>
            </div>
            <div class="verdicts" aria-label="${escapeHtml(row.label)} verdict">
              <label><input type="radio" name="verdict-${index}" value="accept" /> Accept</label>
              <label><input type="radio" name="verdict-${index}" value="reject" /> Reject</label>
            </div>
          </div>
          <dl class="row-contract">
            <div>
              <dt>Reject if</dt>
              <dd>${escapeHtml(row.rejectIf)}</dd>
            </div>
            <div>
              <dt>Required evidence</dt>
              <dd>${escapeHtml(row.requiredEvidence)}</dd>
            </div>
          </dl>
          <label class="field">
            Evidence anchor
            <select data-evidence-anchor>
              <option value="">Choose the passage, receipt, image, or missing proof this row depends on</option>
              ${evidenceAnchorOptions}
            </select>
          </label>
          <label class="field">
            Evidence note
            <textarea data-evidence-note rows="4" placeholder="Name the exact passage, artifact, screenshot, failure trace, or reader reaction that supports this verdict."></textarea>
          </label>
          <label class="field">
            Required change if rejected
            <textarea data-required-change rows="3" placeholder="If rejected, write the concrete repair. Leave blank only for accepted rows."></textarea>
          </label>
        </section>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Human Quality Review Editor - ${escapeHtml(template.slug)}</title>
  <style>
    :root {
      --ink: #241a16;
      --muted: #6f625b;
      --paper: #fffaf1;
      --panel: #ffffff;
      --line: #e2d4c5;
      --accent: #b95b36;
      --good: #1f7a52;
      --bad: #a33a32;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    main {
      width: min(1180px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 32px 0 56px;
    }
    .hero, .score-row, .side-panel {
      background: var(--panel);
      border: 1px solid var(--line);
      box-shadow: 0 1px 0 rgba(36, 26, 22, 0.05);
    }
    .hero { padding: 28px; margin-bottom: 24px; }
    .eyebrow {
      margin: 0 0 8px;
      color: var(--accent);
      font: 800 11px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    h1, h2 { margin: 0; line-height: 1.05; }
    h1 { max-width: 880px; font-family: Georgia, serif; font-size: clamp(34px, 5vw, 64px); font-style: italic; }
    h2 { font-family: Georgia, serif; font-size: 24px; font-style: italic; }
    .hero p { max-width: 820px; color: var(--muted); }
    .meta {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 22px;
    }
    .meta div, .warning {
      border: 1px solid var(--line);
      background: #fffdf8;
      padding: 12px;
    }
    .meta dt {
      color: var(--muted);
      font: 800 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .meta dd { margin: 6px 0 0; overflow-wrap: anywhere; font-size: 13px; }
    .warning {
      margin-top: 16px;
      border-color: #e5b7a7;
      background: #fff3ed;
      color: #6f2d1d;
      font-weight: 700;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 390px;
      gap: 20px;
      align-items: start;
    }
    .reviewer {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .field {
      display: grid;
      gap: 7px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    input[type="text"], input[type="datetime-local"], select, textarea {
      width: 100%;
      border: 1px solid var(--line);
      background: #fffdf8;
      color: var(--ink);
      padding: 10px 11px;
      font: 500 14px/1.45 ui-sans-serif, system-ui, sans-serif;
    }
    textarea {
      min-height: 86px;
      resize: vertical;
      text-transform: none;
      letter-spacing: 0;
    }
    .score-row { padding: 20px; margin-bottom: 16px; }
    .score-head {
      display: flex;
      gap: 16px;
      align-items: start;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .verdicts {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .verdicts label {
      border: 1px solid var(--line);
      background: #fffdf8;
      padding: 8px 10px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .row-contract {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 0 0 16px;
    }
    .row-contract div {
      border: 1px solid var(--line);
      background: #fffdf8;
      padding: 12px;
    }
    .row-contract dt {
      color: var(--muted);
      font: 800 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .row-contract dd { margin: 6px 0 0; font-size: 13px; }
    .review-desk {
      display: grid;
      gap: 16px;
      margin-bottom: 20px;
    }
    .desk-card {
      background: var(--panel);
      border: 1px solid var(--line);
      padding: 18px;
    }
    .desk-card h2 { margin-bottom: 10px; }
    .desk-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .desk-grid article, .passage {
      border: 1px solid var(--line);
      background: #fffdf8;
      padding: 14px;
    }
    .desk-grid p, .passage p { margin: 0; }
    .receipt-list, .heading-list {
      margin: 10px 0 0;
      padding-left: 18px;
      color: var(--muted);
      font-size: 13px;
    }
    .receipt-list li, .heading-list li { margin: 5px 0; }
    .empty { color: var(--bad); font-weight: 800; }
    .review-rule {
      border: 1px solid #e5b7a7;
      background: #fff3ed;
      color: #6f2d1d;
      padding: 12px;
      margin-top: 12px;
      font-weight: 800;
    }
    .side-panel {
      position: sticky;
      top: 16px;
      padding: 18px;
    }
    .side-panel h2 { font-size: 22px; margin-bottom: 12px; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
    button {
      border: 1px solid var(--ink);
      background: var(--ink);
      color: #fff;
      padding: 10px 12px;
      font-weight: 900;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 11px;
    }
    button.secondary { background: #fffdf8; color: var(--ink); }
    .status {
      border: 1px solid var(--line);
      background: #fffdf8;
      padding: 10px;
      font-size: 12px;
      color: var(--muted);
    }
    .status.fail { border-color: #e5b7a7; background: #fff3ed; color: var(--bad); }
    .status.pass { border-color: #9ec8b2; background: #f2fbf6; color: var(--good); }
    pre {
      max-height: 520px;
      overflow: auto;
      margin: 12px 0 0;
      padding: 12px;
      background: #17110f;
      color: #fff8ed;
      font-size: 11px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .blockers {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    .blockers span {
      border: 1px solid #e5b7a7;
      background: #fff3ed;
      color: #6f2d1d;
      padding: 4px 7px;
      font: 800 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
      text-transform: uppercase;
    }
    @media (max-width: 900px) {
      .layout, .reviewer, .meta, .row-contract, .desk-grid { grid-template-columns: 1fr; }
      .side-panel { position: static; }
      .score-head { display: grid; }
      .verdicts { justify-content: flex-start; }
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">Human Quality Review Editor</p>
      <h1>Decide whether this draft is strong enough to leave private review.</h1>
      <p>
        This editor turns the reference-blogger scorecard into a filled JSON result. Any rejected row keeps the draft private. The exported JSON must still pass <code>npm run verify:human-quality-review-result</code>.
      </p>
      <dl class="meta">
        <div><dt>Slug</dt><dd>${escapeHtml(template.slug)}</dd></div>
        <div><dt>Markdown SHA-256</dt><dd>${escapeHtml(template.markdownSha256)}</dd></div>
        <div><dt>Current decision</dt><dd>${escapeHtml(template.sourcePacket?.currentDecision)}</dd></div>
        <div><dt>Promotion without human</dt><dd>${escapeHtml(String(template.promotionAllowedWithoutHuman))}</dd></div>
      </dl>
      <div class="warning">Any rejected row keeps the draft private. Do not promote a merely correct but dull article.</div>
      <div class="blockers" aria-label="Current blockers">
        ${blockers.map((blocker) => `<span>${escapeHtml(blocker)}</span>`).join("")}
      </div>
    </section>

    <div class="layout">
      <section>
        <section class="review-desk" aria-label="Draft review desk">
          <div class="desk-card">
            <p class="eyebrow">Draft Review Desk</p>
            <h2>Read the article before scoring it.</h2>
            <dl class="meta">
              <div><dt>Draft path</dt><dd>${escapeHtml(draftContext.draftPath)}</dd></div>
              <div><dt>Draft loaded</dt><dd>${escapeHtml(String(draftContext.loaded))}</dd></div>
              <div><dt>Draft title</dt><dd>${escapeHtml(draftContext.title || template.slug)}</dd></div>
              <div><dt>Word count</dt><dd>${escapeHtml(String(draftContext.wordCount))}</dd></div>
            </dl>
            <div class="review-rule">Reviewer must cite an exact passage, artifact, screenshot, receipt line, or missing proof in every evidence note. Do not approve from vibe.</div>
          </div>
          <div class="desk-card">
            <p class="eyebrow">Opening excerpt</p>
            <h2>Can a cold reader care before the system appears?</h2>
            <div class="desk-grid">${openingCards || '<p class="empty">Opening excerpt unavailable.</p>'}</div>
          </div>
          <div class="desk-card">
            <p class="eyebrow">Evidence receipts</p>
            <h2>Proof objects inside the draft</h2>
            <div class="desk-grid">
              <div>
                <p class="eyebrow">Receipt lines</p>
                ${receiptList}
              </div>
              <div>
                <p class="eyebrow">Images</p>
                ${imageList}
              </div>
            </div>
          </div>
          <div class="desk-card">
            <p class="eyebrow">Structure map</p>
            <h2>What the article asks the reader to move through</h2>
            ${headingList}
          </div>
          <div class="desk-card">
            <p class="eyebrow">Passages to inspect</p>
            <h2>Score the writing against these passages, not the idea of the system.</h2>
            ${reviewPassageCards || '<p class="empty">No review passages found.</p>'}
          </div>
        </section>
        <div class="reviewer">
          <label class="field">Reviewer name<input id="reviewer-name" type="text" placeholder="Required" /></label>
          <label class="field">Reviewer handle<input id="reviewer-handle" type="text" placeholder="Optional" /></label>
          <label class="field">Reviewed at<input id="reviewed-at" type="datetime-local" /></label>
        </div>
        <label class="field" style="margin-bottom:16px;">
          Decision
          <select id="decision">
            <option value="">Choose after scoring</option>
            <option value="keep_internal_example">Keep internal example</option>
            <option value="promote_to_approval_candidate">Promote to approval candidate</option>
          </select>
        </label>
        ${scorecardRows}
        <label class="field" style="margin-bottom:16px;">
          Overall rationale
          <textarea id="overall-rationale" rows="6" placeholder="At least 120 characters. Name whether the draft has a real opening, evidence density, point of view, reader transfer, readable voice, and acceptable embarrassment risk."></textarea>
        </label>
        <label class="field">
          Next actions
          <textarea id="next-actions" rows="4" placeholder="One action per line. Rejected rows should become concrete revision work."></textarea>
        </label>
      </section>

      <aside class="side-panel">
        <p class="eyebrow">Export</p>
        <h2>Review JSON</h2>
        <div id="status" class="status">Fill the scorecard to preview JSON.</div>
        <div class="actions">
          <button id="copy-json" type="button">Copy JSON</button>
          <button id="refresh-json" class="secondary" type="button">Refresh</button>
        </div>
        <p class="status">
          Required rows: First 30 seconds, Evidence density, Point of view, Reader transfer, Voice and readability, Embarrassment risk.
        </p>
        <pre id="json-preview" aria-label="Generated review JSON"></pre>
      </aside>
    </div>
  </main>

  <script id="review-template" type="application/json">${serializedTemplate}</script>
  <script id="draft-context" type="application/json">${serializedDraftContext}</script>
  <script>
    const template = JSON.parse(document.getElementById("review-template").textContent);
    const draftContext = JSON.parse(document.getElementById("draft-context").textContent);
    const rows = Array.from(document.querySelectorAll("[data-score-row]"));
    const status = document.getElementById("status");
    const preview = document.getElementById("json-preview");

    function isoFromInput(value) {
      if (!value) return "";
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? "" : date.toISOString();
    }

    function selectedVerdict(index) {
      return document.querySelector('input[name="verdict-' + index + '"]:checked')?.value || "";
    }

    function collectReview() {
      const scorecard = rows.map((row, index) => ({
        evidenceAnchor: draftContext.evidenceAnchors.find((anchor) => anchor.id === row.querySelector("[data-evidence-anchor]").value) || null,
        label: template.scorecard[index].label,
        verdict: selectedVerdict(index),
        evidenceNote: row.querySelector("[data-evidence-note]").value.trim(),
        requiredChange: row.querySelector("[data-required-change]").value.trim()
      }));
      return {
        schema: "vibecode-human-quality-review/v1",
        slug: template.slug,
        markdownSha256: template.markdownSha256,
        reviewStatus: "completed_human_review",
        promotionAllowedWithoutHuman: false,
        sourceDraft: {
          path: draftContext.draftPath || "",
          wordCount: draftContext.wordCount || 0,
          loaded: Boolean(draftContext.loaded)
        },
        reviewer: {
          name: document.getElementById("reviewer-name").value.trim(),
          handle: document.getElementById("reviewer-handle").value.trim(),
          reviewedAt: isoFromInput(document.getElementById("reviewed-at").value)
        },
        decision: document.getElementById("decision").value,
        scorecard,
        overallRationale: document.getElementById("overall-rationale").value.trim(),
        nextActions: document.getElementById("next-actions").value
          .split("\\n")
          .map((item) => item.trim())
          .filter(Boolean)
      };
    }

    function validate(review) {
      const failures = [];
      const rejected = review.scorecard.filter((row) => row.verdict === "reject");
      if (review.reviewer.name.length < 2) failures.push("Reviewer name is required.");
      if (!review.reviewer.reviewedAt) failures.push("Reviewed-at timestamp is required.");
      if (!review.decision) failures.push("Decision is required.");
      if (review.overallRationale.length < 120) failures.push("Overall rationale must be at least 120 characters.");
      if (review.nextActions.length < 1) failures.push("At least one next action is required.");
      for (const row of review.scorecard) {
        if (!["accept", "reject"].includes(row.verdict)) failures.push(row.label + ": verdict required.");
        if (!row.evidenceAnchor) failures.push(row.label + ": evidence anchor is required.");
        if (row.evidenceNote.length < 40) failures.push(row.label + ": evidence note is too thin.");
        if (row.verdict === "reject" && row.requiredChange.length < 20) {
          failures.push(row.label + ": required change is needed when rejected.");
        }
      }
      if (rejected.length > 0 && review.decision !== "keep_internal_example") {
        failures.push("Any rejected row requires decision=keep_internal_example.");
      }
      return failures;
    }

    function refresh() {
      const review = collectReview();
      const failures = validate(review);
      preview.textContent = JSON.stringify(review, null, 2);
      status.className = "status " + (failures.length ? "fail" : "pass");
      status.textContent = failures.length ? failures.join(" ") : "JSON shape is ready for verifier.";
      return review;
    }

    document.addEventListener("input", refresh);
    document.addEventListener("change", refresh);
    document.getElementById("refresh-json").addEventListener("click", refresh);
    document.getElementById("copy-json").addEventListener("click", async () => {
      const review = refresh();
      await navigator.clipboard.writeText(JSON.stringify(review, null, 2) + "\\n");
      status.textContent = "Copied JSON. Save it as the review result, then run the verifier.";
      status.className = "status pass";
    });
    refresh();
  </script>
</body>
</html>
`;
}

function validateEditor(template, html, draftContext) {
  const failures = [];
  const required = [
    "Human Quality Review Editor",
    "Copy JSON",
    "Any rejected row keeps the draft private",
    "Draft Review Desk",
    "Opening excerpt",
    "Evidence receipts",
    "Evidence anchor",
    "Reviewer must cite an exact passage",
    "Evidence density",
    "Embarrassment risk",
    "promotionAllowedWithoutHuman",
    "data-score-row",
    "data-evidence-anchor",
  ];

  if (template.promotionAllowedWithoutHuman !== false) {
    failures.push("review editor must keep promotionAllowedWithoutHuman=false");
  }
  if (!template.slug || !template.markdownSha256) {
    failures.push("review editor template requires slug and markdownSha256");
  }
  if (!draftContext.loaded || draftContext.wordCount < 500 || draftContext.opening.length === 0) {
    failures.push("review editor requires loaded draft context with opening excerpts");
  }
  if (asArray(draftContext.evidenceAnchors).length < 6) {
    failures.push("review editor requires draft evidence anchors");
  }
  if (asArray(template.scorecard).length < 6) {
    failures.push("review editor template requires at least six scorecard rows");
  }
  for (const text of required) {
    if (!html.includes(text)) failures.push(`review editor missing required text: ${text}`);
  }
  return failures;
}

async function main() {
  const templatePath = resolve(getArg("--template") ?? DEFAULT_TEMPLATE);
  const output = resolve(getArg("--output") ?? DEFAULT_OUTPUT);
  const check = hasArg("--check");
  const template = JSON.parse(await readFile(templatePath, "utf8"));
  const draftPath = resolve(getArg("--draft") ?? defaultDraftPath(template));
  const draftContext = existsSync(draftPath)
    ? parseDraftContext(await readFile(draftPath, "utf8"), draftPath)
    : emptyDraftContext(draftPath);
  const html = buildEditor(template, draftContext);
  const failures = validateEditor(template, html, draftContext);

  if (check) {
    if (!existsSync(output)) {
      failures.push(`human quality review editor missing: ${output}`);
    } else if ((await readFile(output, "utf8")) !== html) {
      failures.push("human quality review editor is stale");
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html, "utf8");
  }

  process.stdout.write(`human_quality_review_editor=${output}\n`);
  process.stdout.write(`human_quality_review_editor_rows=${asArray(template.scorecard).length}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("human_quality_review_editor=fail\n");
    return 1;
  }
  process.stdout.write("human_quality_review_editor=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

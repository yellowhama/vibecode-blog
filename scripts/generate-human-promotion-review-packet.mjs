import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DEFAULT_SLUG = "writing-harness-not-more-prompts";
const DEFAULT_BLOG_DIR = "src/data/blog";
const DEFAULT_DECISIONS_PATH = "src/data/draft-editorial-decisions.json";
const DEFAULT_REVIEW_SUMMARY =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-review-artifact-summary.json";
const DEFAULT_OUTPUT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-promotion-review.html";
const DEFAULT_SUMMARY =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-human-promotion-review-summary.json";

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

function receiptValue(body, name) {
  const match = body.match(new RegExp(`^${name}=([^\\r\\n]+)$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function section(body, heading) {
  const pattern = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "im");
  const match = body.match(pattern);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const next = body.slice(start).search(/^##\s+/im);
  return body.slice(start, next === -1 ? undefined : start + next).trim();
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

function allCodeBlocks(text) {
  return [...text.matchAll(/```(?:txt)?\r?\n([\s\S]*?)```/g)].map((match) => match[1].trim());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function decisionBySlug(decisionsDocument, slug) {
  return decisionsDocument.decisions?.find((decision) => decision.slug === slug);
}

function reviewSummaryFacts(reviewSummary) {
  return [
    ["Required text", `${reviewSummary.requiredTextMatches}/${reviewSummary.requiredTextTotal}`],
    ["Body text length", String(reviewSummary.bodyTextLength)],
    ["Scroll height", String(reviewSummary.scrollHeight)],
    ["Screenshot", reviewSummary.screenshot ?? "missing"],
  ];
}

function buildSummary({ slug, markdownSha256, title, decision, reviewSummary, body }) {
  const blockers = receiptValue(body, "candidate_blockers")
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    slug,
    title,
    markdownSha256,
    publicationState: receiptValue(body, "publication_state"),
    approvalCandidate: receiptValue(body, "approval_candidate") === "true",
    humanReviewRequired: true,
    promotionAllowedWithoutHuman: false,
    currentDecision: decision?.decision ?? "missing",
    reviewerType: decision?.reviewerType ?? "missing",
    candidateBlockers: blockers,
    realFailedDraftEvidence: {
      status: decision?.realFailedDraftEvidence?.status ?? "missing",
      kind: decision?.realFailedDraftEvidence?.kind ?? "missing",
      failedDraftCommit: decision?.realFailedDraftEvidence?.failedDraftCommit ?? "missing",
      repairedDraftCommit: decision?.realFailedDraftEvidence?.repairedDraftCommit ?? "missing",
      critiquePath: decision?.realFailedDraftEvidence?.critiquePath ?? "missing",
      renderedScreenshotPath: decision?.realFailedDraftEvidence?.renderedScreenshotPath ?? "missing",
    },
    reviewArtifact: {
      requiredTextMatches: reviewSummary.requiredTextMatches,
      requiredTextTotal: reviewSummary.requiredTextTotal,
      bodyTextLength: reviewSummary.bodyTextLength,
      scrollHeight: reviewSummary.scrollHeight,
      screenshot: reviewSummary.screenshot,
    },
    humanQuestions: [
      "Does the opening make a cold reader care before it asks them to admire the internal system?",
      "Can the reader reuse the paragraph autopsy and review-desk protocol without knowing the loop history?",
      "Does the Loop 44 -> Loop 45 real failed-draft trace make the evidence strong enough, or does publication require another screenshot/log from a separate session?",
      "If this becomes public, what exact sentence, artifact, or claim would embarrass the site?",
    ],
    requiredDecisionOutputs: [
      "promote_to_approval_candidate or keep_internal_example",
      "human reviewer name or handle",
      "specific accept/reject rationale tied to the artifact",
      "final markdown hash after any accepted edits",
    ],
  };
}

function buildHtml({ slug, title, markdownSha256, decision, reviewSummary, body }) {
  const opening = paragraph(section(body, "Opening Pressure"));
  const transfer = paragraph(section(body, "Reader Transfer"));
  const critique = paragraph(section(body, "Editorial Critique Result"));
  const risk = paragraph(section(body, "Draft Risk"));
  const codeBlocks = allCodeBlocks(body);
  const weakParagraph = codeBlocks.find((block) => block.includes("AI agents are transforming content operations")) ?? "";
  const reviewFields = codeBlocks.find((block) => block.includes("source_changed_claim=which source forced")) ?? "";
  const blockers = receiptValue(body, "candidate_blockers");
  const realEvidence = decision?.realFailedDraftEvidence;
  const facts = reviewSummaryFacts(reviewSummary);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - Human Promotion Review</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #21170f;
      --muted: #6e6259;
      --paper: #fffaf2;
      --canvas: #f3eadf;
      --line: #d7c5b5;
      --accent: #744c94;
      --warn: #8e3b2f;
      --ok: #255b42;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--canvas);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    main { width: min(1160px, calc(100vw - 32px)); margin: 0 auto; padding: 36px 0 64px; }
    header { display: grid; grid-template-columns: 1.15fr .85fr; gap: 24px; align-items: end; border-bottom: 2px solid var(--line); padding-bottom: 24px; }
    h1 { margin: 0; font-family: Georgia, serif; font-size: clamp(34px, 5vw, 60px); line-height: 1.02; letter-spacing: 0; }
    h2 { margin: 0 0 10px; font-size: 20px; letter-spacing: 0; }
    h3 { margin: 0 0 8px; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
    p { margin: 0 0 12px; }
    code, pre { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; padding: 14px; border-radius: 8px; background: #21170f; color: #fffaf2; font-size: 13px; }
    .meta, .card, .question, .verdict { background: var(--paper); border: 1px solid var(--line); border-radius: 8px; padding: 18px; }
    .meta div { display: flex; justify-content: space-between; gap: 14px; border-top: 1px solid var(--line); padding-top: 8px; margin-top: 8px; }
    .meta div:first-child { border-top: 0; padding-top: 0; margin-top: 0; }
    .section { margin-top: 26px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .question { border-left: 5px solid var(--accent); }
    .question strong { display: block; margin-bottom: 6px; }
    .verdict { border-top: 5px solid var(--warn); }
    .facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .fact { background: var(--paper); border: 1px solid var(--line); border-radius: 8px; padding: 14px; min-width: 0; }
    .fact span { display: block; color: var(--muted); font-size: 13px; }
    .fact code { overflow-wrap: anywhere; }
    .callout { background: var(--ink); color: var(--paper); border-radius: 8px; padding: 20px; font-family: Georgia, serif; font-size: 25px; line-height: 1.22; }
    .muted { color: var(--muted); }
    @media (max-width: 860px) {
      header, .grid, .facts { grid-template-columns: 1fr; }
      main { width: min(100vw - 20px, 1160px); padding-top: 24px; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h3>Human Promotion Review Packet</h3>
        <h1>${escapeHtml(title)}</h1>
        <p class="muted">This packet does not approve publication. It gives the human reviewer a current-hash, evidence-backed decision surface.</p>
      </div>
      <aside class="meta" aria-label="Promotion metadata">
        <div><span>Slug</span><code>${escapeHtml(slug)}</code></div>
        <div><span>Markdown SHA-256</span><code>${escapeHtml(markdownSha256)}</code></div>
        <div><span>Current decision</span><code>${escapeHtml(decision?.decision ?? "missing")}</code></div>
        <div><span>Current blockers</span><code>${escapeHtml(blockers)}</code></div>
        <div><span>Real failure evidence</span><code>${escapeHtml(realEvidence?.status ?? "missing")}</code></div>
      </aside>
    </header>

    <section class="section">
      <div class="callout">The review is not: "does this sound better?" The review is: "would a cold reader trust, reuse, and remember this without the loop history?"</div>
    </section>

    <section class="section facts">
      ${facts.map(([label, value]) => `<div class="fact"><span>${escapeHtml(label)}</span><code>${escapeHtml(value)}</code></div>`).join("\n")}
    </section>

    <section class="section grid">
      <article class="card">
        <h2>Opening Test</h2>
        <p>${escapeHtml(opening)}</p>
      </article>
      <article class="card">
        <h2>Reader Transfer</h2>
        <p>${escapeHtml(transfer)}</p>
      </article>
      <article class="card">
        <h2>Editorial Result</h2>
        <p>${escapeHtml(critique)}</p>
      </article>
      <article class="card">
        <h2>Remaining Risk</h2>
        <p>${escapeHtml(risk)}</p>
      </article>
    </section>

    <section class="section grid">
      <article class="card">
        <h2>Weak Paragraph Under Review</h2>
        <pre>${escapeHtml(weakParagraph)}</pre>
      </article>
      <article class="card">
        <h2>Review Fields The Human Must Judge</h2>
        <pre>${escapeHtml(reviewFields)}</pre>
      </article>
    </section>

    <section class="section grid">
      <article class="card">
        <h2>Real Failed-Draft Trace</h2>
        <p><strong>Failed draft:</strong> <code>${escapeHtml(realEvidence?.failedDraftCommit ?? "missing")}</code></p>
        <p><strong>Repaired draft:</strong> <code>${escapeHtml(realEvidence?.repairedDraftCommit ?? "missing")}</code></p>
        <p class="muted">${escapeHtml(realEvidence?.critiquePath ?? "missing")}</p>
      </article>
      <article class="card">
        <h2>Failure Signals</h2>
        <pre>${escapeHtml((realEvidence?.failureSignals ?? []).join("\n"))}</pre>
      </article>
    </section>

    <section class="section">
      <h2>Required Human Questions</h2>
      <div class="grid">
        <div class="question"><strong>1. First 30 seconds</strong>Does the bad-paragraph opening make the problem felt before the article explains the system?</div>
        <div class="question"><strong>2. Transfer</strong>Can the reader use the autopsy form and review-desk protocol on their own draft tomorrow?</div>
        <div class="question"><strong>3. Evidence</strong>Does the Loop 44 -> Loop 45 failure trace make the evidence strong enough, or must promotion wait for a separate failed session screenshot/log?</div>
        <div class="question"><strong>4. Embarrassment check</strong>What exact claim, sentence, or artifact would make this piece look overconfident if published?</div>
      </div>
    </section>

    <section class="section verdict">
      <h2>Decision Output Required</h2>
      <p>A valid promotion review must produce one of two decisions: <code>keep_internal_example</code> or <code>promote_to_approval_candidate</code>. Promotion also needs a human reviewer identity, a rationale tied to the current artifact, rendered candidate proof, image contract, and final markdown hash approval.</p>
      <p class="muted">Until those exist, this packet keeps the article private by design.</p>
    </section>
  </main>
</body>
</html>`;
}

async function main() {
  const slug = getArg("--slug") ?? DEFAULT_SLUG;
  const blogDir = getArg("--blog-dir") ?? DEFAULT_BLOG_DIR;
  const decisionsPath = getArg("--decisions") ?? DEFAULT_DECISIONS_PATH;
  const reviewSummaryPath = getArg("--review-summary") ?? DEFAULT_REVIEW_SUMMARY;
  const output = resolve(getArg("--output") ?? DEFAULT_OUTPUT);
  const summaryPath = resolve(getArg("--summary") ?? DEFAULT_SUMMARY);
  const check = hasArg("--check");

  const draftPath = resolve(blogDir, `${slug}.md`);
  const markdown = await readFile(draftPath, "utf8");
  const { frontmatter, body } = parseMarkdown(markdown);
  const decisionsDocument = JSON.parse(await readFile(decisionsPath, "utf8"));
  const decision = decisionBySlug(decisionsDocument, slug);
  const reviewSummary = JSON.parse(await readFile(reviewSummaryPath, "utf8"));
  const markdownSha256 = createHash("sha256").update(markdown).digest("hex");
  const title = getFrontmatterValue(frontmatter, "title") || slug;
  const summary = buildSummary({ slug, markdownSha256, title, decision, reviewSummary, body });
  const html = buildHtml({ slug, title, markdownSha256, decision, reviewSummary, body });

  const failures = [];
  if (!/^draft:\s*true\s*$/m.test(frontmatter)) failures.push(`${slug}.md is not a private draft`);
  if (getFrontmatterValue(frontmatter, "workflow") !== "packet") failures.push(`${slug}.md is not a packet draft`);
  if (summary.publicationState !== "draft_only") failures.push(`${slug}.md must stay draft_only`);
  if (summary.approvalCandidate) failures.push(`${slug}.md is already marked as an approval candidate`);
  if (!summary.candidateBlockers.includes("human_critique")) failures.push(`${slug}.md must keep human_critique blocker`);
  if (decision?.reviewerType === "human" && decision?.decision === "promote_to_approval_candidate") {
    failures.push("human promotion already exists; this packet should no longer be the active review surface");
  }
  if (reviewSummary.requiredTextMatches !== reviewSummary.requiredTextTotal) {
    failures.push("review artifact summary does not prove all required text rendered");
  }
  if (!html.includes(markdownSha256) || !html.includes("Human Promotion Review Packet")) {
    failures.push("human review HTML is missing required identity text");
  }

  if (check) {
    if (!existsSync(output)) failures.push(`human review packet html missing: ${output}`);
    if (!existsSync(summaryPath)) failures.push(`human review packet summary missing: ${summaryPath}`);
    if (failures.length === 0) {
      const currentHtml = await readFile(output, "utf8");
      const currentSummary = JSON.parse(await readFile(summaryPath, "utf8"));
      if (currentHtml !== html) failures.push("human review packet html is stale");
      if (currentSummary.markdownSha256 !== markdownSha256) failures.push("human review packet summary is stale");
      if (currentSummary.promotionAllowedWithoutHuman !== false) {
        failures.push("human review packet must not allow promotion without human review");
      }
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html, "utf8");
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  process.stdout.write(`human_promotion_review_packet=${output}\n`);
  process.stdout.write(`human_promotion_review_summary=${summaryPath}\n`);
  process.stdout.write(`human_promotion_review_markdown_sha256=${markdownSha256}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("human_promotion_review_packet=fail\n");
    return 1;
  }
  process.stdout.write("human_promotion_review_packet=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

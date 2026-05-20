import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import sharp from "sharp";

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

function sha256Upper(value) {
  return createHash("sha256").update(value).digest("hex").toUpperCase();
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrap(value, maxChars = 38, maxLines = 4) {
  const words = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.length ? lines : ["missing"];
}

function svgText(lines, x, y, options = {}) {
  const {
    size = 22,
    fill = "#21170f",
    family = "Inter, Arial, sans-serif",
    weight = "600",
    lineHeight = 30,
  } = options;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("")}</text>`;
}

function card({ x, y, width, height, label, title, body, receipt, color }) {
  return `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="${height}" rx="20" fill="#fffaf2" stroke="#d8c7b8" stroke-width="2"/>
    <rect x="0" y="0" width="${width}" height="52" rx="20" fill="${color}"/>
    <text x="24" y="34" font-family="Consolas, monospace" font-size="18" font-weight="700" fill="#fffaf2">${escapeXml(label)}</text>
    ${svgText(wrap(title, 31, 2), 24, 92, { size: 26, lineHeight: 32, fill: "#21170f", family: "Georgia, serif", weight: "700" })}
    ${svgText(wrap(body, 36, 4), 24, 174, { size: 20, lineHeight: 28, fill: "#4e4037", weight: "600" })}
    <rect x="24" y="${height - 62}" width="${width - 48}" height="38" rx="10" fill="#f3eadf" stroke="#d8c7b8"/>
    <text x="42" y="${height - 37}" font-family="Consolas, monospace" font-size="15" font-weight="700" fill="#21170f">${escapeXml(receipt)}</text>
  </g>`;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readFileHash(path) {
  return sha256(await readFile(path));
}

function countTruthy(object) {
  return Object.values(object ?? {}).filter(Boolean).length;
}

function buildSvg(model) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
  <rect width="1400" height="900" fill="#f3eadf"/>
  <g stroke="#e1d2c4" stroke-width="1">
    ${Array.from({ length: 36 }, (_, index) => `<line x1="${index * 40}" y1="0" x2="${index * 40}" y2="900"/>`).join("")}
    ${Array.from({ length: 24 }, (_, index) => `<line x1="0" y1="${index * 40}" x2="1400" y2="${index * 40}"/>`).join("")}
  </g>
  <rect x="46" y="42" width="1308" height="816" rx="30" fill="#fffaf2" stroke="#21170f" stroke-width="3"/>
  <text x="84" y="91" font-family="Consolas, monospace" font-size="22" font-weight="700" fill="#744c94">PRIVATE LIVE WORKFLOW EVIDENCE</text>
  ${svgText(wrap(model.title, 46, 2), 84, 154, { size: 46, lineHeight: 52, fill: "#21170f", family: "Georgia, serif", weight: "700" })}
  <text x="84" y="232" font-family="Consolas, monospace" font-size="20" fill="#74675d">one inspectable chain: source proof -> blocked queue -> human repair -> private candidate</text>

  ${card({ x: 84, y: 286, width: 286, height: 360, label: "1 / source proof", title: "The source map is complete", body: model.sourceBody, receipt: model.sourceReceipt, color: "#744c94" })}
  ${card({ x: 398, y: 286, width: 286, height: 360, label: "2 / queue proof", title: "The publisher item is blocked", body: model.queueBody, receipt: model.queueReceipt, color: "#8e3b2f" })}
  ${card({ x: 712, y: 286, width: 286, height: 360, label: "3 / human repair", title: "The weak draft was rejected", body: model.revisionBody, receipt: model.revisionReceipt, color: "#255b42" })}
  ${card({ x: 1026, y: 286, width: 286, height: 360, label: "4 / candidate proof", title: "The candidate still cannot publish", body: model.candidateBody, receipt: model.candidateReceipt, color: "#21170f" })}

  <g transform="translate(84 700)">
    <rect width="1228" height="92" rx="18" fill="#21170f"/>
    <text x="28" y="37" font-family="Consolas, monospace" font-size="18" font-weight="700" fill="#d8794a">reader-facing test</text>
    ${svgText(wrap(model.readerTest, 104, 2), 28, 72, { size: 22, lineHeight: 30, fill: "#fffaf2", weight: "700" })}
  </g>
</svg>`;
}

async function main() {
  const slug = getArg("--slug");
  if (!slug) throw new Error("--slug is required");
  const sourceSummaryPath = resolve(getArg("--source-summary") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-source-map-summary.json`);
  const queueGenerationSummaryPath = resolve(
    getArg("--queue-generation-summary") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-publisher-queue-artifact-generation-summary.json`,
  );
  const queueCaptureSummaryPath = resolve(
    getArg("--queue-capture-summary") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-publisher-queue-artifact-summary.json`,
  );
  const revisionSummaryPath = resolve(getArg("--revision-summary") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-revision-trace-summary.json`);
  const renderedSummaryPath = resolve(getArg("--rendered-summary") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-rendered-candidate-summary.json`);
  const reviewResultPath = resolve(getArg("--quality-review") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-third-human-quality-review-result.json`);
  const currentDraftPath = getArg("--current-draft") ? resolve(getArg("--current-draft")) : "";
  const output = resolve(getArg("--output") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-workflow-evidence.png`);
  const summaryPath = resolve(getArg("--summary") ?? `${DEFAULT_OUTPUT_DIR}/${slug}-workflow-evidence-summary.json`);
  const check = hasArg("--check");

  const sourceSummary = await readJson(sourceSummaryPath);
  const queueGenerationSummary = await readJson(queueGenerationSummaryPath);
  const queueCaptureSummary = await readJson(queueCaptureSummaryPath);
  const revisionSummary = await readJson(revisionSummaryPath);
  const renderedSummary = await readJson(renderedSummaryPath);
  const reviewResult = await readJson(reviewResultPath);
  const currentDraft = currentDraftPath ? await readFile(currentDraftPath, "utf8") : "";
  const currentDraftContainsArtifact = currentDraftPath ? currentDraft.includes(basename(output)) : null;

  const sourceCount = countTruthy(sourceSummary.requiredFields);
  const sourceTotal = Object.keys(sourceSummary.requiredFields ?? {}).length;
  const queueCount = countTruthy(queueGenerationSummary.requiredFields);
  const queueTotal = Object.keys(queueGenerationSummary.requiredFields ?? {}).length;
  const rejectedRows = Array.isArray(revisionSummary.rejectedRows) ? revisionSummary.rejectedRows : [];
  const scorecard = Array.isArray(reviewResult.scorecard) ? reviewResult.scorecard : [];
  const acceptedRows = scorecard.filter((row) => row?.verdict === "accept").length;
  const rejectedQualityRows = scorecard.filter((row) => row?.verdict === "reject").length;

  const model = {
    title: renderedSummary.title ?? sourceSummary.title ?? slug,
    sourceBody: `Source visual required fields ${sourceCount}/${sourceTotal}; weak claim, source map, before/after, and transfer are all inspectable.`,
    sourceReceipt: `source ${String(sourceSummary.imageSha256 ?? "").slice(0, 10)}`,
    queueBody: `Queue required fields ${queueCount}/${queueTotal}; source URL, reader decision, proof list, image state, blocked publish state, and approval are present.`,
    queueReceipt: `queue ${String(queueGenerationSummary.artifactSha256 ?? "").slice(0, 10)}`,
    revisionBody: `Human quality rejected ${rejectedRows.join(", ")}; broad rewrite denied=${revisionSummary.broadRewriteDenied === true}.`,
    revisionReceipt: `repair ${String(revisionSummary.imageSha256 ?? "").slice(0, 10)}`,
    candidateBody: `Third review accepts ${acceptedRows}/${scorecard.length}; rendered candidate has publicCandidate=${renderedSummary.publicCandidate} and approvalRequired=${renderedSummary.approvalRequired}.`,
    candidateReceipt: "private boundary",
    readerTest:
      "Do not trust the final draft. Follow the chain: source receipt, blocked queue item, rejected rows, narrow repair, zero-reject review, and still-private candidate boundary.",
  };

  const svg = buildSvg(model);
  const image = await sharp(Buffer.from(svg)).png().toBuffer();
  const imageSha256 = sha256Upper(image);
  const evidenceFileHashes = {
    sourceSummary: await readFileHash(sourceSummaryPath),
    queueGenerationSummary: await readFileHash(queueGenerationSummaryPath),
    queueCaptureSummary: await readFileHash(queueCaptureSummaryPath),
    revisionSummary: await readFileHash(revisionSummaryPath),
    renderedSummary: await readFileHash(renderedSummaryPath),
    qualityReview: await readFileHash(reviewResultPath),
  };
  const summary = {
    schema: "vibecode-private-workflow-evidence/v1",
    slug,
    output,
    imageSha256,
    width: 1400,
    height: 900,
    currentDraftPath: currentDraftPath || null,
    currentDraftContainsArtifact,
    evidenceFiles: {
      sourceSummary: sourceSummaryPath,
      queueGenerationSummary: queueGenerationSummaryPath,
      queueCaptureSummary: queueCaptureSummaryPath,
      revisionSummary: revisionSummaryPath,
      renderedSummary: renderedSummaryPath,
      qualityReview: reviewResultPath,
    },
    evidenceFileHashes,
    gates: {
      sourceRequiredFields: `${sourceCount}/${sourceTotal}`,
      queueRequiredFields: `${queueCount}/${queueTotal}`,
      queueCaptureRequiredText: `${queueCaptureSummary.requiredTextMatches}/${queueCaptureSummary.requiredTextTotal}`,
      revisionBroadRewriteDenied: revisionSummary.broadRewriteDenied === true,
      qualityReviewAcceptedRows: `${acceptedRows}/${scorecard.length}`,
      qualityReviewRejectedRows: rejectedQualityRows,
      renderedPublicCandidate: renderedSummary.publicCandidate,
      renderedApprovalRequired: renderedSummary.approvalRequired,
    },
  };
  const summaryText = `${JSON.stringify(summary, null, 2)}\n`;

  const failures = [];
  if (sourceSummary.schema !== "vibecode-source-draft-visual/v1") failures.push("source summary schema mismatch");
  if (queueGenerationSummary.schema !== "vibecode-publisher-queue-artifact/v1") failures.push("queue generation summary schema mismatch");
  if (revisionSummary.schema !== "vibecode-private-revision-trace/v1") failures.push("revision summary schema mismatch");
  if (renderedSummary.schema !== "vibecode-private-rendered-candidate/v1") failures.push("rendered summary schema mismatch");
  if (reviewResult.schema !== "vibecode-human-quality-review/v1") failures.push("quality review schema mismatch");
  for (const [name, value] of Object.entries({
    sourceSummary,
    queueGenerationSummary,
    revisionSummary,
    renderedSummary,
    reviewResult,
  })) {
    if (value.slug !== slug) failures.push(`${name} slug mismatch`);
  }
  if (sourceCount !== sourceTotal || sourceTotal === 0) failures.push("source required fields must all pass");
  if (queueCount !== queueTotal || queueTotal === 0) failures.push("queue required fields must all pass");
  if (queueCaptureSummary.requiredTextMatches !== queueCaptureSummary.requiredTextTotal) {
    failures.push("queue capture required text must all pass");
  }
  if (revisionSummary.broadRewriteDenied !== true) failures.push("revision summary must deny broad rewrite");
  if (rejectedRows.length < 1) failures.push("revision summary must preserve rejected rows");
  if (rejectedQualityRows !== 0 || acceptedRows !== scorecard.length || scorecard.length === 0) {
    failures.push("quality review must have zero rejected rows");
  }
  if (renderedSummary.publicCandidate !== false) failures.push("rendered candidate must stay private");
  if (renderedSummary.approvalRequired !== true) failures.push("rendered candidate must require approval");
  if (currentDraftPath && !currentDraftContainsArtifact) {
    failures.push("current draft must reference the generated workflow evidence artifact");
  }

  if (check) {
    if (!existsSync(output)) failures.push(`workflow evidence image missing: ${output}`);
    if (!existsSync(summaryPath)) failures.push(`workflow evidence summary missing: ${summaryPath}`);
    if (existsSync(output)) {
      const currentImage = await readFile(output);
      const currentSha = sha256Upper(currentImage);
      if (currentSha !== imageSha256) failures.push("workflow evidence image is stale");
    }
    if (existsSync(summaryPath)) {
      const currentSummary = await readFile(summaryPath, "utf8");
      if (currentSummary !== summaryText) failures.push("workflow evidence summary is stale");
    }
  } else if (failures.length === 0) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, image);
    await writeFile(summaryPath, summaryText, "utf8");
  }

  process.stdout.write(`private_workflow_evidence_artifact=${output}\n`);
  process.stdout.write(`private_workflow_evidence_summary=${summaryPath}\n`);
  process.stdout.write(`private_workflow_evidence_sha256=${imageSha256}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("private_workflow_evidence_artifact=fail\n");
    return 1;
  }
  process.stdout.write("private_workflow_evidence_artifact=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const DEFAULT_INCIDENT_DIR = String.raw`F:\Aisaak\CompanyArtifacts\llm-wiki-completed\companies\vibecode-town\incidents`;
const DEFAULT_OUTPUT_DIR = "src/data/blog";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function runNode(args, options = {}) {
  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });
    child.on("close", (code) => resolveRun(code ?? 1));
    child.on("error", (error) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      resolveRun(1);
    });
  });
}

function extractIncidentId(text) {
  return text.match(/Incident id:\s+([0-9a-f-]{36})/i)?.[1] ?? "";
}

function extractEvidencePath(text) {
  return text.match(/Sanitized evidence JSON\s*\|\s*`([^`]+\.json)`/)?.[1] ?? "";
}

function extractLine(text, label) {
  return text.match(new RegExp(`^- ${label}:\\s+(.+)$`, "m"))?.[1]?.trim() ?? "";
}

function extractSection(text, heading) {
  const pattern = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`);
  return text.match(pattern)?.[1]?.trim() ?? "";
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function yamlEscape(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function inlineCode(value) {
  return String(value ?? "").replace(/`/g, "\\`");
}

function pickIncidentFile(files) {
  return files
    .filter((name) => /warden-blocked-(watchdog|risky)-command\.md$/.test(name))
    .sort()
    .at(-1);
}

function buildDraft({ incidentText, incidentPath, evidence, evidencePath }) {
  const incidentId = extractIncidentId(incidentText);
  const event = evidence.warden_event ?? {};
  const response = evidence.blocked_response ?? {};
  const resolution = evidence.resolution ?? {};
  const resolutionRow = resolution.row ?? {};
  const capturedAt = evidence.captured_at ?? event.created_at ?? new Date().toISOString();
  const date = formatDate(capturedAt);
  const title = "When Warden Stops a Command Before the Relay";
  const outputName = `${date}-warden-stops-command-before-relay.md`;
  const commandRaw = event.command_raw ?? extractLine(incidentText, "Exact command, event, user action, or agent action");
  const nodeName = event.node_name ?? evidence.node_name ?? "unknown";
  const reason = event.reason ?? "outside the allowed command contract";
  const resolutionStatus = resolutionRow.status ?? "missing";
  const resolvedAt = resolutionRow.resolved_at ?? "";
  const httpStatus = response.http_status ?? "unknown";
  const migrationApplication = evidence.migration_application_evidence ?? {};
  const migrationManifest = evidence.migration_manifest ?? {};
  const trigger = extractSection(incidentText, "Trigger");
  const boundary = extractSection(incidentText, "Boundary");

  const markdown = `---
title: "${yamlEscape(title)}"
pubDatetime: ${new Date(capturedAt).toISOString()}
description: "A Warden Field Log draft generated only after a verified runtime incident proved an HTTP 423 block, a persisted Warden event, migration application evidence, and dashboard resolution."
draft: true
featured: false
series: "Field Log"
lang: "en"
tags: ["engineering", "warden", "technical-contracts"]
references:
  - name: "Verified Warden runtime incident"
    url: "${yamlEscape(incidentPath)}"
    guru: "first-party-evidence"
  - name: "Sanitized Warden runtime evidence"
    url: "${yamlEscape(evidencePath)}"
    guru: "runtime-evidence"
---

# ${title}

The useful part of Warden is not that it says no.

The useful part is where the no happens: before a non-contract command crosses from product intent into relay behavior.

## Broken System

An authenticated product path attempted a watchdog command against node \`${inlineCode(nodeName)}\`.

\`\`\`txt
${inlineCode(commandRaw)}
\`\`\`

The request reached the watchdog bridge, but the command did not match the allowed command contract.

${trigger || "The incident record contains the product-path trigger and command details."}

## Evidence

This draft is generated from a verified incident only. The gate that allowed it was:

\`\`\`txt
npm run verify:warden-field-log
\`\`\`

Runtime evidence:

\`\`\`txt
incident_id=${incidentId}
http_status=${httpStatus}
warden_event_status=${event.status ?? "missing"}
resolution_status=${resolutionStatus}
resolution_transport=${resolution.transport ?? "missing"}
resolved_at=${resolvedAt || "missing"}
evidence_json=${evidencePath}
migration_application_source=${migrationApplication.source ?? "missing"}
migration_application_status=${migrationApplication.status ?? "missing"}
migration_bundle_sha256=${migrationManifest.body?.bundle_sha256 ?? "missing"}
\`\`\`

## Bad Default

The weak version of this system would let a dashboard or agent request pass through because the caller was authenticated.

That is not a contract. It is trust in the caller's intent.

For agentic systems, intent is not enough. The useful boundary is the one that evaluates the command shape before relay forwarding.

## Control Surface

Warden treated the watchdog command as a policy decision, not as a normal relay command.

The product path returned HTTP \`${httpStatus}\`, persisted a Warden event, and required dashboard/API resolution before the incident could become publication evidence.

\`\`\`txt
reason=${inlineCode(reason)}
event_id=${incidentId}
resolution=${resolutionStatus}
transport=${resolution.transport ?? "missing"}
\`\`\`

## Result

The command stopped at the product boundary.

The evidence also preserves the migration application proof, so the Field Log is not relying on a local mock table or an optimistic schema assumption.

## Boundary

${boundary || "This proves the watchdog bridge path for this event. It does not prove broad shell-command classification, autonomous recovery, or every possible dispatch path."}

Do not expand this into a claim that Warden controls every agent action. This incident proves one concrete product path: non-contract watchdog commands can fail closed before relay forwarding.

## Product Boundary

The product question is not whether an AI agent can act.

The product question is whether the system can name the contract, stop outside-contract behavior, and leave an audit trail that a senior engineer can inspect later.
`;

  return { outputName, markdown };
}

async function main() {
  if (hasFlag("--help")) {
    process.stdout.write("Usage: npm run draft:warden-field-log\n");
    process.stdout.write("Options: --incident-dir <path> --output-dir <path> --dry-run\n");
    return 0;
  }

  const incidentDir = resolve(getArg("--incident-dir") ?? process.env.WARDEN_INCIDENT_DIR ?? DEFAULT_INCIDENT_DIR);
  const gateCode = await runNode([
    resolve("scripts/verify-warden-field-log-ready.mjs"),
    "--incident-dir",
    incidentDir,
  ]);
  if (gateCode !== 0) {
    process.stderr.write("Warden Field Log draft generation blocked until verify:warden-field-log passes.\n");
    return gateCode;
  }

  const incidentName = pickIncidentFile(await readdir(incidentDir));
  if (!incidentName) {
    process.stderr.write(`No Warden incident file found in ${incidentDir}\n`);
    return 1;
  }

  const incidentPath = resolve(incidentDir, incidentName);
  const incidentText = await readFile(incidentPath, "utf8");
  const evidencePath = extractEvidencePath(incidentText);
  if (!evidencePath) {
    process.stderr.write("Incident does not reference a sanitized evidence JSON file.\n");
    return 1;
  }

  const evidence = JSON.parse(await readFile(resolve(evidencePath), "utf8"));
  const { outputName, markdown } = buildDraft({
    incidentText,
    incidentPath,
    evidence,
    evidencePath: resolve(evidencePath),
  });

  if (hasFlag("--dry-run")) {
    process.stdout.write(markdown);
    return 0;
  }

  const outputDir = resolve(getArg("--output-dir") ?? process.env.WARDEN_FIELD_LOG_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR);
  await mkdir(outputDir, { recursive: true });
  const outputPath = resolve(outputDir, outputName);
  await writeFile(outputPath, markdown, "utf8");
  process.stdout.write(`warden_field_log_draft=${outputPath}\n`);
  process.stdout.write(`warden_field_log_source_incident=${incidentPath}\n`);
  process.stdout.write(`warden_field_log_source_evidence=${resolve(evidencePath)}\n`);
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

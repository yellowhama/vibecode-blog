import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_OUTPUT_DIR = String.raw`F:\Aisaak\CompanyArtifacts\llm-wiki-completed\companies\vibecode-town\incidents`;

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function slugDate(dateLike) {
  const date = dateLike ? new Date(dateLike) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function requireString(name, value) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} is required in Warden evidence.`);
  }
  return value.trim();
}

function escapeMarkdown(value) {
  return String(value ?? "").replace(/\|/g, "\\|");
}

async function readEvidence() {
  const evidenceJson = process.env.WARDEN_INCIDENT_EVIDENCE_JSON;
  if (evidenceJson) return { evidence: JSON.parse(evidenceJson), sourcePath: null };

  const evidencePath =
    getArg("--evidence") ??
    process.env.WARDEN_INCIDENT_EVIDENCE_FILE ??
    process.env.WARDEN_VERIFY_EVIDENCE_FILE;

  if (!evidencePath) {
    throw new Error("Provide --evidence, WARDEN_INCIDENT_EVIDENCE_FILE, WARDEN_VERIFY_EVIDENCE_FILE, or WARDEN_INCIDENT_EVIDENCE_JSON.");
  }

  const sourcePath = resolve(evidencePath);
  return { evidence: JSON.parse(await readFile(sourcePath, "utf8")), sourcePath };
}

function buildIncident(evidence, sourcePath) {
  const event = evidence.warden_event ?? {};
  const response = evidence.blocked_response ?? {};
  const eventId = requireString("warden_event.id", event.id);
  const nodeName = requireString("warden_event.node_name", event.node_name);
  const actionType = requireString("warden_event.action_type", event.action_type);
  const commandRaw = requireString("warden_event.command_raw", event.command_raw);
  const reason = requireString("warden_event.reason", event.reason);
  const status = requireString("warden_event.status", event.status);
  const capturedAt = evidence.captured_at ?? event.created_at ?? new Date().toISOString();
  const date = slugDate(capturedAt);
  const endpoint = requireString("endpoint", evidence.endpoint);
  const httpStatus = response.http_status ?? "unknown";
  const resolvedAt = evidence.resolution?.row?.resolved_at ?? event.resolved_at ?? "";
  const resolutionStatus = evidence.resolution?.row?.status ?? event.status;
  const resolutionTransport = evidence.resolution?.transport ?? "";
  const migrationManifest = evidence.migration_manifest ?? null;
  const migrationManifestPath = migrationManifest?.path ?? "";
  const migrationBundleHash = migrationManifest?.body?.bundle_sha256 ?? "";
  const migrationEvidenceQueryPath = migrationManifest?.body?.evidence_query?.path ?? "";
  const migrationEvidenceQueryHash = migrationManifest?.body?.evidence_query?.sha256 ?? "";
  const migrationApplication = evidence.migration_application_evidence ?? null;
  const migrationApplicationSource = migrationApplication?.source ?? "";
  const migrationApplicationStatus = migrationApplication?.status ?? "";
  const migrationApplicationVerifier = migrationApplication?.verifier ?? "";
  const migrationApplicationFile = migrationApplication?.file ?? "";
  const migrationApplicationHash = migrationApplication?.sha256 ?? "";
  const outputName = `${date}-warden-blocked-watchdog-command.md`;

  const markdown = `# ${date} Warden Blocked Watchdog Command

## Metadata
- Incident id: ${eventId}
- Date: ${date}
- Captured by: Warden product-path verifier
- System: MUSU Pro watchdog bridge
- Related repo/path: \`F:\\Aisaak\\Projects\\musu-pro\\src\\app\\api\\bridge\\watchdog\\route.ts\`
- Related product: MUSU Pro / Vibecode Town Field Log
- Severity: Medium
- Status: Content-ready

## Trigger
- What happened: A non-contract watchdog command reached the MUSU watchdog bridge API.
- Who or what initiated it: Authenticated product-path verification flow.
- Exact command, event, user action, or agent action: \`${commandRaw}\`

## Expected Behavior
- Contract: Watchdog commands must match the explicit allowlist before relay forwarding.
- Boundary: Unknown commands must create a Warden event and must not reach the relay.
- Verification method: Authenticated \`POST /api/bridge/watchdog?node=<node>&cmd=<non-contract-command>\`, followed by Supabase row verification.

## Actual Behavior
- What happened instead: Warden blocked the command and recorded a \`${status}\` event.
- Error/log/screenshot/diff: HTTP ${httpStatus}; event id \`${eventId}\`.
- Reproduction notes: Call \`${endpoint}\` with an authenticated dashboard session for node \`${nodeName}\`.

## Evidence
| Artifact | Location | Notes |
| :--- | :--- | :--- |
| API response | \`${endpoint}\` | HTTP ${httpStatus}; Warden blocked command. |
| Warden event row | \`warden_events.id = ${eventId}\` | \`${actionType}\`; status \`${status}\`. |
| Command output | verifier console output | \`row_command_raw=${escapeMarkdown(commandRaw)}\` |
| Sanitized evidence JSON | ${sourcePath ? `\`${sourcePath}\`` : "`WARDEN_INCIDENT_EVIDENCE_JSON`"} | Raw product-path response, Warden row, and resolution row. |
| Warden migration manifest | ${migrationManifestPath ? `\`${migrationManifestPath}\`` : "`missing`"} | Bundle SHA-256: \`${migrationBundleHash || "missing"}\`. |
| Warden post-apply evidence query | ${migrationEvidenceQueryPath ? `\`${migrationEvidenceQueryPath}\`` : "`missing`"} | Query SHA-256: \`${migrationEvidenceQueryHash || "missing"}\`. |
| Warden migration application evidence | ${migrationApplicationFile ? `\`${migrationApplicationFile}\`` : "`captured in verifier output`"} | Source: \`${migrationApplicationSource || "missing"}\`; status: \`${migrationApplicationStatus || "missing"}\`; verifier: \`${migrationApplicationVerifier || "missing"}\`; SHA-256: \`${migrationApplicationHash || "not-file-backed"}\`. |
| Config | \`docs/migrations/019_warden_events.sql\` | Defines \`warden_events\` persistence. |
| Product path | \`src/app/api/bridge/watchdog/route.ts\` | Non-contract commands fail closed before relay. |

## Impact
- User or operator impact: The product creates a human-reviewable Warden artifact instead of silently forwarding an unknown command.
- Product risk: Without this boundary, an unexpected watchdog command could cross from dashboard/API intent into relay behavior.
- Content value: This is first-party product evidence for a Field Log.
- Reader pressure: Senior engineers need to know whether AI-agent control surfaces fail closed when the command is outside contract.

## Boundary
- What this proves: The watchdog product path can block non-contract commands before relay forwarding and persist a Warden event.
- What this does not prove: It does not prove broad shell-command classification, autonomous recovery, or all agent dispatch paths.
- Product claim that must not be made: Do not claim Warden controls every possible agent action from this single watchdog-path artifact.

## Routing
- Content route: Field Log
- MUSU backlog candidate: Expand command classification beyond watchdog allowlist and capture dashboard UI resolution evidence.
- Required owner: MUSU Pro owner for product proof; Vibecode editor for Field Log.
- Next action: Resolve the event through dashboard UI if not already resolved, then draft using \`companies/vibecode-town/plans/warden-field-log-plan.md\`.

## Closure
- Resolution: ${resolvedAt ? `${resolutionStatus} at ${resolvedAt}` : "Blocked event captured; dashboard resolution evidence still preferred."}
- Resolution transport: ${resolutionTransport || "missing"}
- Verification command: \`npm run verify:warden:product\`
- Follow-up: Attach sanitized evidence JSON plus dashboard API/UI resolution evidence before publishing.
- Linked post/brief:

## Raw Evidence Summary
\`\`\`json
${JSON.stringify(
    {
      captured_at: evidence.captured_at,
      event_id: eventId,
      node_name: nodeName,
      action_type: actionType,
      command_raw: commandRaw,
      reason,
      status,
      http_status: httpStatus,
      resolved_at: resolvedAt || null,
      resolution_transport: resolutionTransport || null,
      migration_manifest_path: migrationManifestPath || null,
      migration_bundle_sha256: migrationBundleHash || null,
      migration_evidence_query_path: migrationEvidenceQueryPath || null,
      migration_evidence_query_sha256: migrationEvidenceQueryHash || null,
      migration_application_source: migrationApplicationSource || null,
      migration_application_status: migrationApplicationStatus || null,
      migration_application_verifier: migrationApplicationVerifier || null,
      migration_application_file_sha256: migrationApplicationHash || null,
    },
    null,
    2
  )}
\`\`\`
`;

  return { outputName, markdown };
}

async function main() {
  if (hasFlag("--help")) {
    process.stdout.write("Usage: WARDEN_INCIDENT_EVIDENCE_FILE=<evidence.json> npm run incident:warden\n");
    process.stdout.write("Options: --evidence <path> --output-dir <path> --dry-run\n");
    return 0;
  }

  const { evidence, sourcePath } = await readEvidence();
  const { outputName, markdown } = buildIncident(evidence, sourcePath);

  if (hasFlag("--dry-run")) {
    process.stdout.write(markdown);
    return 0;
  }

  const outputDir = getArg("--output-dir") ?? process.env.WARDEN_INCIDENT_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
  const outputPath = resolve(outputDir, outputName);
  await mkdir(resolve(outputDir), { recursive: true });
  await writeFile(outputPath, markdown, "utf8");
  process.stdout.write(`incident_file=${outputPath}\n`);
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

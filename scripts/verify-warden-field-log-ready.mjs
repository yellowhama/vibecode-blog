import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";

const DEFAULT_INCIDENT_DIR = String.raw`F:\Aisaak\CompanyArtifacts\llm-wiki-completed\companies\vibecode-town\incidents`;

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function hasAll(text, patterns) {
  return patterns.every((pattern) => text.includes(pattern));
}

function hasResolvedEvidence(text) {
  return (
    /Resolution:\s+(approved|denied)\s+at\s+\d{4}-\d{2}-\d{2}T/.test(text) ||
    /"resolved_at":\s*"(?!null)[^"]+"/.test(text)
  );
}

function hasDashboardResolutionEvidence(text) {
  return (
    text.includes("Resolution transport: dashboard_api") ||
    text.includes('"resolution_transport": "dashboard_api"') ||
    text.includes("Dashboard UI") ||
    text.includes("dashboard screenshot")
  );
}

function extractIncidentId(text) {
  return text.match(/Incident id:\s+([0-9a-f-]{36})/i)?.[1] ?? null;
}

function extractEvidencePath(text) {
  const match = text.match(/Sanitized evidence JSON\s*\|\s*`([^`]+\.json)`/);
  return match?.[1] ?? null;
}

function hasMigrationManifest(evidence) {
  const manifest = evidence.migration_manifest;
  const body = manifest?.body;
  const sha256Pattern = /^[a-f0-9]{64}$/;
  if (!manifest?.path || typeof body?.bundle_sha256 !== "string" || !sha256Pattern.test(body.bundle_sha256)) {
    return false;
  }

  if (
    body.evidence_query?.path !== "docs/migrations/verify_warden_events.sql" ||
    typeof body.evidence_query?.sha256 !== "string" ||
    !sha256Pattern.test(body.evidence_query.sha256)
  ) {
    return false;
  }

  const applyOrder = Array.isArray(body.apply_order)
    ? body.apply_order
    : [];
  const paths = applyOrder.map((item) => item?.path);
  if (applyOrder.some((item) => typeof item?.sha256 !== "string" || !sha256Pattern.test(item.sha256))) {
    return false;
  }

  return (
    paths.includes("docs/migrations/019_warden_events.sql") &&
    paths.includes("docs/migrations/020_warden_event_integrity.sql")
  );
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function scoreMigrationApplicationEvidence(evidence) {
  const application = evidence.migration_application_evidence;
  const sha256Pattern = /^[a-f0-9]{64}$/;
  const failures = [];
  if (application?.status !== "pass") {
    return ["sanitized evidence JSON migration application evidence status is not pass"];
  }

  if (application.source === "sql_editor_export") {
    if (application.verifier !== "npm run verify:warden:sql-evidence") {
      failures.push("migration application evidence verifier is not npm run verify:warden:sql-evidence");
    }
    if (typeof application.file !== "string" || application.file.trim() === "") {
      failures.push("migration application evidence SQL Editor export file is missing");
    }
    if (typeof application.sha256 !== "string" || !sha256Pattern.test(application.sha256)) {
      failures.push("migration application evidence SQL Editor export SHA-256 is missing or invalid");
    }

    if (failures.length === 0) {
      try {
        const file = await readFile(resolve(application.file));
        if (sha256(file) !== application.sha256) {
          failures.push("migration application evidence SQL Editor export SHA-256 does not match file");
        }
      } catch (error) {
        failures.push(`migration application evidence SQL Editor export is not readable: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return failures;
  }

  if (application.source === "guarded_direct_apply") {
    if (application.verifier !== "npm run apply:warden:migrations") {
      failures.push("migration application evidence verifier is not npm run apply:warden:migrations");
    }
    if (typeof application.file !== "string" || application.file.trim() === "") {
      failures.push("migration application evidence direct apply output file is missing");
    }
    if (typeof application.sha256 !== "string" || !sha256Pattern.test(application.sha256)) {
      failures.push("migration application evidence direct apply output SHA-256 is missing or invalid");
    }

    if (failures.length === 0) {
      try {
        const file = await readFile(resolve(application.file));
        if (sha256(file) !== application.sha256) {
          failures.push("migration application evidence direct apply output SHA-256 does not match file");
        }

        const rows = JSON.parse(file.toString("utf8"));
        const rowFailures = Array.isArray(rows)
          ? rows.filter((row) => row?.status !== "pass")
          : [];
        const summary = Array.isArray(rows)
          ? rows.find((row) => row?.row_type === "summary")
          : null;
        if (!Array.isArray(rows) || !summary || summary.status !== "pass" || rowFailures.length > 0) {
          failures.push("migration application evidence direct apply output does not contain all-pass rows");
        }
      } catch (error) {
        failures.push(`migration application evidence direct apply output is not readable: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return failures;
  }

  return ["migration application evidence source is missing or unsupported"];
}

async function scoreEvidenceFile(text) {
  const failures = [];
  const evidencePath = extractEvidencePath(text);
  if (!evidencePath) {
    return ["missing sanitized evidence JSON file reference"];
  }

  let evidence;
  try {
    evidence = JSON.parse(await readFile(resolve(evidencePath), "utf8"));
  } catch (error) {
    return [`sanitized evidence JSON is not readable: ${error instanceof Error ? error.message : String(error)}`];
  }

  const incidentId = extractIncidentId(text);
  const event = evidence.warden_event ?? {};
  const response = evidence.blocked_response ?? {};
  const resolution = evidence.resolution ?? {};
  const resolutionRow = resolution.row ?? {};

  if (!incidentId || event.id !== incidentId) {
    failures.push("sanitized evidence JSON event id does not match incident id");
  }

  if (response.http_status !== 423) {
    failures.push("sanitized evidence JSON does not prove HTTP 423 block");
  }

  if (event.action_type !== "watchdog_command") {
    failures.push("sanitized evidence JSON action_type is not watchdog_command");
  }

  if (event.status !== "blocked") {
    failures.push("sanitized evidence JSON initial Warden row is not blocked");
  }

  if (resolution.transport !== "dashboard_api") {
    failures.push("sanitized evidence JSON resolution transport is not dashboard_api");
  }

  if (!["approved", "denied"].includes(resolutionRow.status) || !resolutionRow.resolved_at) {
    failures.push("sanitized evidence JSON does not contain approved/denied resolved row");
  }

  if (!hasMigrationManifest(evidence)) {
    failures.push("sanitized evidence JSON does not include Warden migration manifest for 019 and 020");
  }

  failures.push(...await scoreMigrationApplicationEvidence(evidence));

  return failures;
}

async function scoreIncident(file, text) {
  const failures = [];

  if (!text.includes("Status: Content-ready")) {
    failures.push("status is not Content-ready");
  }

  if (!hasAll(text, [
    "Warden event row",
    "Warden migration application evidence",
    "Verification command: `npm run verify:warden:product`",
    "What this proves:",
    "What this does not prove:",
    "Product claim that must not be made:",
  ])) {
    failures.push("missing required Field Log boundary/evidence sections");
  }

  if (!hasAll(text, [
    "watchdog_command",
    "warden_events.id",
    "HTTP 423",
    "Non-contract commands fail closed before relay",
  ])) {
    failures.push("missing Warden product-path proof details");
  }

  if (!hasResolvedEvidence(text)) {
    failures.push("missing resolved_at or approved/denied dashboard resolution evidence");
  }

  if (!hasDashboardResolutionEvidence(text)) {
    failures.push("missing dashboard API/UI resolution evidence");
  }

  if (text.includes("dashboard resolution evidence still preferred")) {
    failures.push("incident still says dashboard resolution evidence is preferred/missing");
  }

  failures.push(...await scoreEvidenceFile(text));

  return { file, failures };
}

async function main() {
  const incidentDir = resolve(getArg("--incident-dir") ?? process.env.WARDEN_INCIDENT_DIR ?? DEFAULT_INCIDENT_DIR);
  const entries = await readdir(incidentDir, { withFileTypes: true });
  const incidentFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /warden-blocked-(watchdog|risky)-command\.md$/.test(name));

  if (incidentFiles.length === 0) {
    process.stderr.write(`Warden Field Log is not ready: no Warden runtime incident found in ${incidentDir}\n`);
    process.exit(1);
  }

  const reports = [];
  for (const file of incidentFiles) {
    const text = await readFile(join(incidentDir, file), "utf8");
    reports.push(await scoreIncident(file, text));
  }

  const passing = reports.find((report) => report.failures.length === 0);
  if (passing) {
    process.stdout.write(`Warden Field Log gate passed: ${passing.file}\n`);
    return 0;
  }

  process.stderr.write("Warden Field Log is not ready.\n");
  for (const report of reports) {
    process.stderr.write(`- ${report.file}\n`);
    for (const failure of report.failures) {
      process.stderr.write(`  - ${failure}\n`);
    }
  }
  process.exit(1);
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

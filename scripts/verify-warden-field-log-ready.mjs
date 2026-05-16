import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const DEFAULT_INCIDENT_DIR = String.raw`C:\Users\empty\llm-wiki\companies\vibecode-town\incidents`;

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

function scoreIncident(file, text) {
  const failures = [];

  if (!text.includes("Status: Content-ready")) {
    failures.push("status is not Content-ready");
  }

  if (!hasAll(text, [
    "Warden event row",
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
    reports.push(scoreIncident(file, text));
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

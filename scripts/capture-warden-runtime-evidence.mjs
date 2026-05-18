import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

const DEFAULT_MUSU_REPO = String.raw`F:\Aisaak\Projects\musu-pro`;
const DEFAULT_EVIDENCE_DIR = String.raw`F:\Aisaak\CompanyArtifacts\llm-wiki-completed\companies\vibecode-town\incidents\evidence`;
const DEFAULT_ARCHIVE_DIR = String.raw`F:\Aisaak\CompanyArtifacts\runtime-evidence`;
const DEFAULT_SQL_EVIDENCE_DIR = String.raw`F:\Aisaak\CompanyArtifacts\runtime-evidence\sql-editor-results`;
const SQL_EVIDENCE_REFERENCE_FILE_NAMES = new Set([
  "EXPECTED_RESULT_SHAPE.md",
  "README.md",
  "SAMPLE_RESULT_PASS.csv",
]);
const SAMPLE_SQL_EVIDENCE_TEXT = [
  "row_type,check_name,status",
  "summary,all Warden migration checks pass,pass",
  "check,owner_select policy exists,pass",
  "check,required columns exist,pass",
  "check,status/resolution consistency constraint exists,pass",
  "check,warden_events RLS enabled,pass",
  "check,warden_events table exists,pass",
  "check,warden_events_node_created index exists,pass",
  "check,warden_events_user_status_created index exists,pass",
].join("\n");

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function npmCommand() {
  return "npm";
}

function parseEnv(text) {
  const vars = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    vars[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return vars;
}

async function loadEnvFiles(paths) {
  for (const path of paths) {
    try {
      const vars = parseEnv(await readFile(resolve(path), "utf8"));
      for (const [name, value] of Object.entries(vars)) {
        if (value.trim() && process.env[name] === undefined) {
          process.env[name] = value;
        }
      }
    } catch {
      // Optional local env files are intentionally ignored when absent.
    }
  }
}

function envStatus(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function getDatabaseUrl() {
  return process.env.WARDEN_DATABASE_URL
    ?? process.env.SUPABASE_DB_URL
    ?? process.env.DATABASE_URL
    ?? "";
}

function isValidPostgresUrl(value) {
  if (!value.trim()) return false;
  try {
    const url = new URL(value);
    const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
    return (url.protocol === "postgres:" || url.protocol === "postgresql:")
      && Boolean(url.hostname)
      && Boolean(url.username)
      && Boolean(database);
  } catch {
    return false;
  }
}

function getSqlEvidenceDir() {
  return resolve(process.env.WARDEN_SQL_EVIDENCE_DIR ?? DEFAULT_SQL_EVIDENCE_DIR);
}

function isPathInside(filePath, directoryPath) {
  const relationship = relative(directoryPath, filePath);
  return Boolean(relationship) && !relationship.startsWith("..") && !isAbsolute(relationship);
}

function normalizeEvidenceText(text) {
  return text.trim().replace(/\r\n/g, "\n");
}

async function validateSqlEditorEvidencePath(evidenceFile) {
  const evidenceDir = getSqlEvidenceDir();
  const evidencePath = resolve(evidenceFile);

  if (!isPathInside(evidencePath, evidenceDir)) {
    process.stderr.write(`WARDEN_SQL_EVIDENCE_FILE must be inside WARDEN_SQL_EVIDENCE_DIR: ${evidenceDir}\n`);
    process.stderr.write("sql_evidence_file_status=outside_intake_dir\n");
    return null;
  }

  if (SQL_EVIDENCE_REFERENCE_FILE_NAMES.has(basename(evidencePath))) {
    process.stderr.write(`WARDEN_SQL_EVIDENCE_FILE cannot be a guide or sample file: ${basename(evidencePath)}\n`);
    process.stderr.write("sql_evidence_file_status=reference_file\n");
    return null;
  }

  if (!existsSync(evidencePath)) {
    process.stderr.write(`WARDEN_SQL_EVIDENCE_FILE not found: ${evidencePath}\n`);
    return null;
  }

  const text = await readFile(evidencePath, "utf8");
  if (normalizeEvidenceText(text) === SAMPLE_SQL_EVIDENCE_TEXT) {
    process.stderr.write("WARDEN_SQL_EVIDENCE_FILE cannot be a renamed copy of SAMPLE_RESULT_PASS.csv.\n");
    process.stderr.write("sql_evidence_file_status=sample_copy\n");
    return null;
  }

  return evidencePath;
}

function run(command, args, options = {}) {
  return new Promise((resolveRun) => {
    const useShell = process.platform === "win32";
    const child = spawn(useShell ? [command, ...args].join(" ") : command, useShell ? [] : args, {
      stdio: "inherit",
      shell: useShell,
      ...options,
    });
    child.on("close", (code) => resolveRun(code ?? 1));
    child.on("error", (error) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      resolveRun(1);
    });
  });
}

function printHelp() {
  process.stdout.write(`Usage:
  WARDEN_VERIFY_NODE=<registered-node-name> \\
  WARDEN_VERIFY_COOKIE_FILE=<cookie-file> \\
  npm run capture:warden-runtime

Options:
  --musu-repo <path>   MUSU Pro repo path. Default: ${DEFAULT_MUSU_REPO}
  --evidence <path>    Evidence JSON output path. Default: llm-wiki incidents/evidence timestamp file.
  --preflight          Check repo/env/app/database readiness without creating evidence or incident files.
  --apply-migrations   Run MUSU guarded migration apply before runtime checks. Requires WARDEN_APPLY_MIGRATIONS=1 and a PostgreSQL URL.
  --help              Show this help.

Required environment:
  WARDEN_VERIFY_NODE
  WARDEN_VERIFY_COOKIE or WARDEN_VERIFY_COOKIE_FILE

Optional environment forwarded to MUSU verifier:
  WARDEN_VERIFY_APP_URL
  WARDEN_VERIFY_COMMAND
  WARDEN_VERIFY_DECISION
  WARDEN_VERIFY_USER_ID
  WARDEN_SQL_EVIDENCE_FILE
  WARDEN_SQL_EVIDENCE_DIR
  WARDEN_EVIDENCE_ARCHIVE_DIR

Migration application evidence:
  Use either --apply-migrations for guarded direct apply, or WARDEN_SQL_EVIDENCE_FILE for a saved Supabase SQL Editor all-pass export inside WARDEN_SQL_EVIDENCE_DIR.
`);
}

async function checkAppUrl(appUrl) {
  try {
    const response = await fetch(appUrl, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    process.stdout.write(`app_url_status=${response.status}\n`);
    return true;
  } catch (error) {
    process.stderr.write(`app_url_unreachable=${appUrl}\n`);
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return false;
  }
}

async function getCookieHeader() {
  if (process.env.WARDEN_VERIFY_COOKIE) {
    return process.env.WARDEN_VERIFY_COOKIE;
  }
  if (process.env.WARDEN_VERIFY_COOKIE_FILE) {
    return (await readFile(resolve(process.env.WARDEN_VERIFY_COOKIE_FILE), "utf8")).trim();
  }
  return null;
}

async function checkDashboardSession(appUrl) {
  const cookie = await getCookieHeader();
  if (!cookie) {
    process.stderr.write("dashboard_session=missing_cookie\n");
    return false;
  }

  const endpoint = new URL("/api/dashboard/warden", appUrl);
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Cookie: cookie },
      signal: AbortSignal.timeout(5000),
    });
    process.stdout.write(`dashboard_warden_status=${response.status}\n`);
    if (response.status === 200) {
      process.stdout.write("dashboard_session=authenticated\n");
      return true;
    }
    if (response.status === 503) {
      process.stderr.write("dashboard_session=authenticated_but_warden_store_unavailable\n");
      return false;
    }
    process.stderr.write("dashboard_session=not_authenticated_or_unavailable\n");
    return false;
  } catch (error) {
    process.stderr.write(`dashboard_session_check_failed=${error instanceof Error ? error.message : String(error)}\n`);
    return false;
  }
}

async function validateInputs(musuRepo) {
  let ok = true;
  const packagePath = resolve(musuRepo, "package.json");
  if (!existsSync(packagePath)) {
    process.stderr.write(`MUSU repo package.json not found: ${packagePath}\n`);
    ok = false;
  } else {
    process.stdout.write(`musu_repo=${musuRepo}\n`);
  }

  if (!process.env.WARDEN_VERIFY_NODE) {
    process.stderr.write("WARDEN_VERIFY_NODE is required.\n");
    ok = false;
  } else {
    process.stdout.write(`warden_node=${process.env.WARDEN_VERIFY_NODE}\n`);
  }

  if (process.env.WARDEN_VERIFY_COOKIE_FILE) {
    const cookiePath = resolve(process.env.WARDEN_VERIFY_COOKIE_FILE);
    if (!existsSync(cookiePath)) {
      process.stderr.write(`WARDEN_VERIFY_COOKIE_FILE not found: ${cookiePath}\n`);
      ok = false;
    } else {
      const cookieText = await readFile(cookiePath, "utf8");
      if (!cookieText.trim()) {
        process.stderr.write(`WARDEN_VERIFY_COOKIE_FILE is empty: ${cookiePath}\n`);
        ok = false;
      } else {
        process.stdout.write(`cookie_file=${cookiePath}\n`);
      }
    }
  } else if (process.env.WARDEN_VERIFY_COOKIE) {
    process.stdout.write("cookie=provided_inline\n");
  } else {
    process.stderr.write("WARDEN_VERIFY_COOKIE or WARDEN_VERIFY_COOKIE_FILE is required.\n");
    process.stderr.write("Use an authenticated MUSU dashboard session for the user that owns WARDEN_VERIFY_NODE.\n");
    ok = false;
  }

  if (!hasFlag("--apply-migrations") && !envStatus("WARDEN_SQL_EVIDENCE_FILE")) {
    process.stderr.write("Migration application evidence is required before Warden runtime capture.\n");
    process.stderr.write("Set WARDEN_SQL_EVIDENCE_FILE to a saved Supabase SQL Editor all-pass export, or rerun with --apply-migrations.\n");
    ok = false;
  } else if (envStatus("WARDEN_SQL_EVIDENCE_FILE")) {
    const sqlEvidencePath = await validateSqlEditorEvidencePath(process.env.WARDEN_SQL_EVIDENCE_FILE);
    if (!sqlEvidencePath) {
      ok = false;
    }
  }

  if (hasFlag("--apply-migrations")) {
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl.trim()) {
      process.stderr.write("WARDEN_DATABASE_URL, SUPABASE_DB_URL, or DATABASE_URL is required when --apply-migrations is set.\n");
      ok = false;
    } else if (!isValidPostgresUrl(databaseUrl)) {
      process.stderr.write("WARDEN_DATABASE_URL, SUPABASE_DB_URL, or DATABASE_URL must be a valid PostgreSQL URL when --apply-migrations is set.\n");
      ok = false;
    }

    if (process.env.WARDEN_APPLY_MIGRATIONS !== "1") {
      process.stderr.write("WARDEN_APPLY_MIGRATIONS=1 is required when --apply-migrations is set.\n");
      ok = false;
    }
  }

  return ok;
}

async function prepareOrApplyMigrationPacket(musuRepo, directApplyEvidenceOut = "") {
  const scriptName = hasFlag("--apply-migrations")
    ? "apply:warden:migrations"
    : "prepare:warden:migrations";

  const args = ["run", scriptName];
  if (hasFlag("--apply-migrations") && directApplyEvidenceOut) {
    args.push("--", "--evidence-out", directApplyEvidenceOut);
  }

  const migrationPacketCode = await run(npmCommand(), args, {
    cwd: musuRepo,
    env: process.env,
  });
  if (migrationPacketCode !== 0) {
    process.stderr.write("Warden migration packet preparation or apply failed. Stop before runtime checks.\n");
    return migrationPacketCode;
  }

  return 0;
}

async function verifySqlEditorEvidenceIfProvided(musuRepo) {
  const evidenceFile = process.env.WARDEN_SQL_EVIDENCE_FILE;
  if (!evidenceFile) {
    return 0;
  }

  const evidencePath = await validateSqlEditorEvidencePath(evidenceFile);
  if (!evidencePath) {
    return 1;
  }

  const code = await run(npmCommand(), ["run", "verify:warden:sql-evidence", "--", evidencePath], {
    cwd: musuRepo,
    env: process.env,
  });
  if (code !== 0) {
    process.stderr.write("Warden SQL Editor evidence verification failed. Stop before runtime checks.\n");
  }
  return code;
}

async function sha256File(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function attachMigrationApplicationEvidence(evidenceFile, directApplyEvidenceOut = "") {
  const target = resolve(evidenceFile);
  const evidence = JSON.parse(await readFile(target, "utf8"));
  const sqlEvidenceFile = process.env.WARDEN_SQL_EVIDENCE_FILE
    ? resolve(process.env.WARDEN_SQL_EVIDENCE_FILE)
    : "";
  const directApplyEvidenceFile = directApplyEvidenceOut
    ? resolve(directApplyEvidenceOut)
    : "";

  if (sqlEvidenceFile) {
    evidence.migration_application_evidence = {
      source: "sql_editor_export",
      status: "pass",
      verifier: "npm run verify:warden:sql-evidence",
      file: sqlEvidenceFile,
      sha256: await sha256File(sqlEvidenceFile),
    };
  } else if (hasFlag("--apply-migrations")) {
    evidence.migration_application_evidence = {
      source: "guarded_direct_apply",
      status: "pass",
      verifier: "npm run apply:warden:migrations",
      file: directApplyEvidenceFile,
      sha256: await sha256File(directApplyEvidenceFile),
    };
  }

  await writeFile(target, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
}

async function archiveEvidenceFiles(evidenceFile, directApplyEvidenceOut = "") {
  const archiveDir = resolve(process.env.WARDEN_EVIDENCE_ARCHIVE_DIR ?? DEFAULT_ARCHIVE_DIR);
  await mkdir(archiveDir, { recursive: true });

  const evidenceTarget = resolve(archiveDir, basename(evidenceFile));
  await copyFile(resolve(evidenceFile), evidenceTarget);
  process.stdout.write(`evidence_archive_file=${evidenceTarget}\n`);

  if (process.env.WARDEN_SQL_EVIDENCE_FILE) {
    const sqlEvidenceSource = resolve(process.env.WARDEN_SQL_EVIDENCE_FILE);
    const sqlEvidenceTarget = resolve(archiveDir, basename(sqlEvidenceSource));
    await copyFile(sqlEvidenceSource, sqlEvidenceTarget);
    process.stdout.write(`sql_evidence_archive_file=${sqlEvidenceTarget}\n`);
  }

  if (directApplyEvidenceOut) {
    const directApplySource = resolve(directApplyEvidenceOut);
    const directApplyTarget = resolve(archiveDir, basename(directApplySource));
    await copyFile(directApplySource, directApplyTarget);
    process.stdout.write(`direct_apply_evidence_archive_file=${directApplyTarget}\n`);
  }
}

async function main() {
  if (hasFlag("--help")) {
    printHelp();
    return 0;
  }

  await loadEnvFiles([
    ".env.warden-runtime.local",
    ".env.local",
  ]);

  const musuRepo = resolve(getArg("--musu-repo") ?? process.env.MUSU_REPO_PATH ?? DEFAULT_MUSU_REPO);
  await loadEnvFiles([
    resolve(musuRepo, ".env.warden-runtime.local"),
    resolve(musuRepo, ".env.local"),
  ]);

  const inputsOk = await validateInputs(musuRepo);
  if (!inputsOk) {
    return 1;
  }

  if (hasFlag("--preflight")) {
    const appUrl = (process.env.WARDEN_VERIFY_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const migrationPacketOk = (await prepareOrApplyMigrationPacket(musuRepo)) === 0;
    if (!migrationPacketOk) {
      process.stderr.write("warden_capture_preflight=fail\n");
      return 1;
    }
    const sqlEvidenceOk = (await verifySqlEditorEvidenceIfProvided(musuRepo)) === 0;
    if (!sqlEvidenceOk) {
      process.stderr.write("warden_capture_preflight=fail\n");
      return 1;
    }

    const appOk = await checkAppUrl(appUrl);
    const dashboardOk = await checkDashboardSession(appUrl);
    const preflightEnv = {
      ...process.env,
      WARDEN_VERIFY_CHECK_INTEGRITY: process.env.WARDEN_VERIFY_CHECK_INTEGRITY ?? "1",
    };
    const migrationCode = await run(npmCommand(), ["run", "verify:warden"], {
      cwd: musuRepo,
      env: preflightEnv,
    });
    if (appOk && dashboardOk && migrationCode === 0) {
      process.stdout.write("warden_capture_preflight=pass\n");
      return 0;
    }
    process.stderr.write("warden_capture_preflight=fail\n");
    return 1;
  }

  const evidenceFile = resolve(
    getArg("--evidence") ??
      process.env.WARDEN_VERIFY_EVIDENCE_FILE ??
      resolve(DEFAULT_EVIDENCE_DIR, `warden-product-path-${timestampSlug()}.json`)
  );
  const directApplyEvidenceFile = hasFlag("--apply-migrations")
    ? evidenceFile.replace(/\.json$/i, ".migration-apply.json")
    : "";

  await mkdir(dirname(evidenceFile), { recursive: true });

  const verifierEnv = {
    ...process.env,
    WARDEN_VERIFY_EVIDENCE_FILE: evidenceFile,
    WARDEN_VERIFY_RESOLVE_EVENT: process.env.WARDEN_VERIFY_RESOLVE_EVENT ?? "1",
    WARDEN_VERIFY_RESOLVE_VIA_DASHBOARD: process.env.WARDEN_VERIFY_RESOLVE_VIA_DASHBOARD ?? "1",
    WARDEN_VERIFY_DECISION: process.env.WARDEN_VERIFY_DECISION ?? "denied",
  };

  process.stdout.write(`evidence_file=${evidenceFile}\n`);
  process.stdout.write(`musu_repo=${musuRepo}\n`);

  const migrationPacketCode = await prepareOrApplyMigrationPacket(musuRepo, directApplyEvidenceFile);
  if (migrationPacketCode !== 0) {
    return migrationPacketCode;
  }

  const sqlEvidenceCode = await verifySqlEditorEvidenceIfProvided(musuRepo);
  if (sqlEvidenceCode !== 0) {
    return sqlEvidenceCode;
  }

  const verifyCode = await run(npmCommand(), ["run", "verify:warden:product"], {
    cwd: musuRepo,
    env: {
      ...verifierEnv,
      WARDEN_VERIFY_MIGRATION_MANIFEST_FILE: resolve(musuRepo, "warden-migrations.manifest.json"),
    },
  });

  if (verifyCode !== 0) {
    process.stderr.write("Warden product-path evidence capture failed. Stop before incident generation.\n");
    return verifyCode;
  }

  await attachMigrationApplicationEvidence(evidenceFile, directApplyEvidenceFile);
  await archiveEvidenceFiles(evidenceFile, directApplyEvidenceFile);

  const incidentCode = await run(npmCommand(), ["run", "incident:warden"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      WARDEN_INCIDENT_EVIDENCE_FILE: evidenceFile,
    },
  });

  if (incidentCode !== 0) {
    process.stderr.write("Warden incident generation failed. Field Log gate was not run.\n");
    return incidentCode;
  }

  return await run(npmCommand(), ["run", "verify:warden-field-log"], {
    cwd: process.cwd(),
    env: process.env,
  });
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

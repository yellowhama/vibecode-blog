import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

const DEFAULT_MUSU_REPO = String.raw`F:\Aisaak\Projects\musu-pro`;
const DEFAULT_REPORT_PATH = String.raw`C:\Users\empty\llm-wiki\companies\vibecode-town\plans\warden-runtime-readiness-latest.md`;
const statusRecords = [];
const envFileRecords = [];
const envSources = new Map();

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

function printStatus(name, pass, detail = "") {
  const value = pass ? "pass" : "fail";
  statusRecords.push({ name, value, detail });
  process.stdout.write(`${name}=${value}${detail ? ` ${detail}` : ""}\n`);
}

function shouldWriteReport() {
  return hasFlag("--write-report") || process.argv.includes("--report");
}

function reportPath() {
  return resolve(getArg("--report") ?? DEFAULT_REPORT_PATH);
}

function statusTableRows() {
  return statusRecords
    .map((record) => `| \`${record.name}\` | ${record.value} | ${record.detail || ""} |`)
    .join("\n");
}

function envFileTableRows() {
  if (envFileRecords.length === 0) {
    return "| _none_ | not_checked | 0 | 0 |";
  }

  return envFileRecords
    .map((record) => `| \`${record.path}\` | ${record.status} | ${record.applied} | ${record.blank} |`)
    .join("\n");
}

function envSource(name) {
  if (!envStatus(name)) return "missing";
  return envSources.get(name) ?? "process_env";
}

function databaseUrlSource() {
  for (const name of ["WARDEN_DATABASE_URL", "SUPABASE_DB_URL", "DATABASE_URL"]) {
    if (envStatus(name)) {
      return `${name} from ${envSource(name)}`;
    }
  }
  return "missing";
}

function inputTableRows() {
  const cookieSource = envStatus("WARDEN_VERIFY_COOKIE_FILE")
    ? `WARDEN_VERIFY_COOKIE_FILE from ${envSource("WARDEN_VERIFY_COOKIE_FILE")}`
    : envStatus("WARDEN_VERIFY_COOKIE")
      ? `WARDEN_VERIFY_COOKIE from ${envSource("WARDEN_VERIFY_COOKIE")}`
      : "missing";

  return [
    [
      "database_url",
      envStatus("WARDEN_DATABASE_URL") || envStatus("SUPABASE_DB_URL") || envStatus("DATABASE_URL")
        ? "present"
        : "missing",
      databaseUrlSource(),
    ],
    [
      "WARDEN_APPLY_MIGRATIONS",
      process.env.WARDEN_APPLY_MIGRATIONS === "1" ? "present" : "missing",
      envSource("WARDEN_APPLY_MIGRATIONS"),
    ],
    ["WARDEN_VERIFY_NODE", envStatus("WARDEN_VERIFY_NODE") ? "present" : "missing", envSource("WARDEN_VERIFY_NODE")],
    [
      "dashboard_cookie",
      envStatus("WARDEN_VERIFY_COOKIE_FILE") || envStatus("WARDEN_VERIFY_COOKIE") ? "present" : "missing",
      cookieSource,
    ],
    [
      "WARDEN_SQL_EVIDENCE_FILE",
      envStatus("WARDEN_SQL_EVIDENCE_FILE")
        ? (existsSync(resolve(process.env.WARDEN_SQL_EVIDENCE_FILE)) ? "present" : "missing_file")
        : "optional",
      envStatus("WARDEN_SQL_EVIDENCE_FILE") ? envSource("WARDEN_SQL_EVIDENCE_FILE") : "optional",
    ],
  ]
    .map(([name, state, source]) => `| \`${name}\` | ${state} | ${source} |`)
    .join("\n");
}

async function writeReadinessReport({
  diagnosticDate,
  musuRepo,
  loadedEnvFiles,
  mode,
  nextStep,
  exitCode,
}) {
  if (!shouldWriteReport()) return;

  const destination = reportPath();
  await mkdir(dirname(destination), { recursive: true });
  const verdict = exitCode === 0 ? "ready" : "blocked";
  const body = `# Warden Runtime Readiness Latest

## Verdict
${verdict}

## Diagnostic
| Field | Value |
| :--- | :--- |
| Diagnostic date | ${diagnosticDate} |
| Mode | ${mode} |
| MUSU repo | \`${musuRepo}\` |
| Loaded env files | ${loadedEnvFiles} |
| Exit code | ${exitCode} |

## Env Files
| Path | Status | Applied non-empty keys | Blank keys |
| :--- | :--- | ---: | ---: |
${envFileTableRows()}

## Required Runtime Inputs
| Input | State | Source |
| :--- | :--- | :--- |
${inputTableRows()}

## Statuses
| Check | Status | Detail |
| :--- | :--- | :--- |
${statusTableRows()}

## Next Step
${nextStep || "Run the Warden runtime capture sequence."}

## Secret Handling
This report is intentionally secret-free. It records only pass/fail readiness, not database URLs, cookies, Supabase keys, browser storage, or request headers.

## Capture Gate
Do not draft the Warden Field Log until:

\`\`\`txt
cd F:\\Aisaak\\Projects\\vibecode-town
npm run verify:warden-field-log
\`\`\`

passes against a generated Warden runtime incident and sanitized raw evidence JSON.
`;
  await writeFile(destination, body, "utf8");
  process.stdout.write(`readiness_report=${destination}\n`);
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
  let loaded = 0;
  for (const path of paths) {
    const resolvedPath = resolve(path);
    try {
      const vars = parseEnv(await readFile(resolvedPath, "utf8"));
      let applied = 0;
      let blank = 0;
      for (const [name, value] of Object.entries(vars)) {
        if (value.trim() && process.env[name] === undefined) {
          process.env[name] = value;
          envSources.set(name, resolvedPath);
          applied += 1;
        } else if (!value.trim()) {
          blank += 1;
        }
      }
      envFileRecords.push({ path: resolvedPath, status: "loaded", applied, blank });
      loaded += 1;
    } catch {
      envFileRecords.push({ path: resolvedPath, status: "absent", applied: 0, blank: 0 });
      // Optional local env files are intentionally ignored when absent.
    }
  }
  return loaded;
}

function envStatus(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
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

async function cookieFileStatus(path) {
  const cookiePath = resolve(path);
  if (!existsSync(cookiePath)) {
    return { ok: false, detail: "source=file path_exists=false" };
  }

  try {
    const text = await readFile(cookiePath, "utf8");
    return {
      ok: text.trim().length > 0,
      detail: `source=file path_exists=true non_empty=${text.trim().length > 0}`,
    };
  } catch {
    return { ok: false, detail: "source=file path_exists=true readable=false" };
  }
}

async function fileStatus(path, label) {
  const targetPath = resolve(path);
  if (!existsSync(targetPath)) {
    return { ok: false, detail: `${label}=file path_exists=false` };
  }

  try {
    const text = await readFile(targetPath, "utf8");
    return {
      ok: text.trim().length > 0,
      detail: `${label}=file path_exists=true non_empty=${text.trim().length > 0}`,
      path: targetPath,
    };
  } catch {
    return { ok: false, detail: `${label}=file path_exists=true readable=false` };
  }
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

async function readPackageJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

function hasScript(packageJson, scriptName) {
  return typeof packageJson?.scripts?.[scriptName] === "string";
}

async function verifySqlEvidenceIfProvided(musuRepo, musuPackage) {
  if (!envStatus("WARDEN_SQL_EVIDENCE_FILE")) {
    printStatus("warden_sql_evidence_file", true, "source=not_provided optional=true");
    return true;
  }

  const status = await fileStatus(process.env.WARDEN_SQL_EVIDENCE_FILE, "source");
  printStatus("warden_sql_evidence_file", status.ok, status.detail);
  if (!status.ok) {
    return false;
  }

  if (!hasScript(musuPackage, "verify:warden:sql-evidence")) {
    return false;
  }

  process.stdout.write("running_sql_evidence_verify=1\n");
  const verifyCode = await run(npmCommand(), ["run", "--silent", "verify:warden:sql-evidence", "--", status.path], {
    cwd: musuRepo,
    env: process.env,
  });
  printStatus("warden_sql_evidence_verify", verifyCode === 0);
  return verifyCode === 0;
}

async function main() {
  const skipEnvFiles = hasFlag("--skip-env-files");
  const localEnvFilesLoaded = skipEnvFiles
    ? 0
    : await loadEnvFiles([
      ".env.warden-runtime.local",
      ".env.local",
    ]);
  const musuRepo = resolve(getArg("--musu-repo") ?? process.env.MUSU_REPO_PATH ?? DEFAULT_MUSU_REPO);
  const musuEnvFilesLoaded = skipEnvFiles
    ? 0
    : await loadEnvFiles([
      resolve(musuRepo, ".env.warden-runtime.local"),
      resolve(musuRepo, ".env.local"),
    ]);
  const loadedEnvFiles = localEnvFilesLoaded + musuEnvFilesLoaded;
  const musuPackagePath = resolve(musuRepo, "package.json");
  const vibecodePackagePath = resolve("package.json");
  const musuPackage = await readPackageJson(musuPackagePath);
  const vibecodePackage = await readPackageJson(vibecodePackagePath);

  const diagnosticDate = new Date().toISOString();
  process.stdout.write(`diagnostic_date=${diagnosticDate}\n`);
  process.stdout.write(`musu_repo=${musuRepo}\n`);
  process.stdout.write(`local_env_files_loaded=${loadedEnvFiles}\n`);

  printStatus("musu_repo_exists", existsSync(musuPackagePath));
  printStatus("musu_prepare_script", hasScript(musuPackage, "prepare:warden:migrations"));
  printStatus("musu_apply_script", hasScript(musuPackage, "apply:warden:migrations"));
  printStatus("musu_runtime_verify_script", hasScript(musuPackage, "verify:warden"));
  printStatus("musu_product_verify_script", hasScript(musuPackage, "verify:warden:product"));
  printStatus("musu_sql_evidence_verify_script", hasScript(musuPackage, "verify:warden:sql-evidence"));
  printStatus("vibecode_capture_script", hasScript(vibecodePackage, "capture:warden-runtime"));
  printStatus("vibecode_field_log_gate", hasScript(vibecodePackage, "verify:warden-field-log"));

  const databaseUrl = getDatabaseUrl();
  const hasDatabaseUrl = databaseUrl.trim().length > 0;
  const validDatabaseUrl = isValidPostgresUrl(databaseUrl);
  printStatus("database_url_available", hasDatabaseUrl);
  printStatus("database_url_valid", validDatabaseUrl);
  printStatus("warden_apply_armed", process.env.WARDEN_APPLY_MIGRATIONS === "1");
  printStatus("warden_node_available", envStatus("WARDEN_VERIFY_NODE"));

  let hasCookie = envStatus("WARDEN_VERIFY_COOKIE");
  if (envStatus("WARDEN_VERIFY_COOKIE_FILE")) {
    const status = await cookieFileStatus(process.env.WARDEN_VERIFY_COOKIE_FILE);
    hasCookie = status.ok;
    printStatus("warden_cookie_available", status.ok, status.detail);
  } else {
    printStatus("warden_cookie_available", hasCookie, hasCookie ? "source=inline" : "");
  }

  if (!existsSync(musuPackagePath)) {
    process.stderr.write("Cannot run MUSU diagnostics because package.json is missing.\n");
    return 1;
  }

  const sqlEvidenceReady = await verifySqlEvidenceIfProvided(musuRepo, musuPackage);
  const hasSqlEvidenceInput = envStatus("WARDEN_SQL_EVIDENCE_FILE");
  const directApplyInputsReady = validDatabaseUrl && process.env.WARDEN_APPLY_MIGRATIONS === "1";
  const sqlEditorApplyEvidenceReady = hasSqlEvidenceInput && sqlEvidenceReady;
  const migrationApplicationEvidenceReady = directApplyInputsReady || sqlEditorApplyEvidenceReady;
  printStatus("direct_migration_apply_inputs_ready", directApplyInputsReady);
  printStatus("sql_editor_migration_evidence_ready", sqlEditorApplyEvidenceReady);
  printStatus("migration_application_evidence_ready", migrationApplicationEvidenceReady);

  const inputsReady = migrationApplicationEvidenceReady
    && envStatus("WARDEN_VERIFY_NODE")
    && hasCookie;

  printStatus("warden_runtime_inputs_ready", inputsReady);
  if (hasFlag("--inputs-only")) {
    const nextStep = inputsReady
      ? "Run npm run diagnose:warden-runtime, then run capture with either --apply-migrations for guarded direct apply or WARDEN_SQL_EVIDENCE_FILE for SQL Editor apply."
      : "Provide either WARDEN_DATABASE_URL plus WARDEN_APPLY_MIGRATIONS=1, or a valid WARDEN_SQL_EVIDENCE_FILE from Supabase SQL Editor apply; also provide WARDEN_VERIFY_NODE and a non-empty dashboard cookie before running full diagnostics.";
    if (!inputsReady) {
      process.stdout.write(`next_step=${nextStep}\n`);
    }
    await writeReadinessReport({
      diagnosticDate,
      musuRepo,
      loadedEnvFiles,
      mode: "inputs-only",
      nextStep,
      exitCode: inputsReady ? 0 : 1,
    });
    return inputsReady ? 0 : 1;
  }

  process.stdout.write("running_migration_packet_dry_run=1\n");
  const packetCode = await run(npmCommand(), ["run", "--silent", "apply:warden:migrations", "--", "--dry-run"], {
    cwd: musuRepo,
    env: process.env,
  });
  printStatus("migration_packet_dry_run", packetCode === 0);

  process.stdout.write("running_warden_runtime_verify=1\n");
  const runtimeCode = await run(npmCommand(), ["run", "--silent", "verify:warden"], {
    cwd: musuRepo,
    env: process.env,
  });
  printStatus("warden_runtime_verify", runtimeCode === 0);

  process.stdout.write("running_field_log_gate=1\n");
  const fieldLogCode = await run(npmCommand(), ["run", "--silent", "verify:warden-field-log"], {
    cwd: process.cwd(),
    env: process.env,
  });
  printStatus("warden_field_log_gate", fieldLogCode === 0);

  const guardedApplyReady = hasDatabaseUrl
    && validDatabaseUrl
    && process.env.WARDEN_APPLY_MIGRATIONS === "1"
    && packetCode === 0;

  const captureReady = envStatus("WARDEN_VERIFY_NODE")
    && hasCookie
    && packetCode === 0
    && (guardedApplyReady || sqlEditorApplyEvidenceReady)
    && runtimeCode === 0;

  printStatus("guarded_migration_apply_ready", guardedApplyReady);
  printStatus("sql_editor_migration_apply_ready", sqlEditorApplyEvidenceReady);
  printStatus("warden_runtime_capture_ready", captureReady);
  printStatus("warden_field_log_currently_ready", fieldLogCode === 0);
  const nextStep = captureReady
    ? "Run npm run capture:warden-runtime with the same migration evidence mode, then draft the Field Log only after the gate passes."
    : "Provide either WARDEN_DATABASE_URL plus WARDEN_APPLY_MIGRATIONS=1, or WARDEN_SQL_EVIDENCE_FILE from SQL Editor apply; also provide WARDEN_VERIFY_NODE and dashboard cookie, then run npm run capture:warden-runtime -- --preflight.";
  if (!captureReady) {
    process.stdout.write(`next_step=${nextStep}\n`);
  }

  await writeReadinessReport({
    diagnosticDate,
    musuRepo,
    loadedEnvFiles,
    mode: "full",
    nextStep,
    exitCode: captureReady ? 0 : 1,
  });

  return captureReady ? 0 : 1;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

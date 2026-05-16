import { existsSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

const DEFAULT_MUSU_REPO = String.raw`F:\Aisaak\Projects\musu-pro`;

function baseEnv(extra = {}) {
  const env = { ...process.env };
  for (const name of Object.keys(env)) {
    if (
      name.startsWith("WARDEN_") ||
      name === "DATABASE_URL" ||
      name === "SUPABASE_DB_URL" ||
      name === "MUSU_REPO_PATH"
    ) {
      delete env[name];
    }
  }
  return {
    ...env,
    MUSU_REPO_PATH: resolve(process.env.MUSU_REPO_PATH ?? DEFAULT_MUSU_REPO),
    ...extra,
  };
}

function runDiagnose(env) {
  return new Promise((resolveRun) => {
    const child = spawn(
      process.execPath,
      [resolve("scripts/diagnose-warden-runtime-capture.mjs"), "--inputs-only", "--skip-env-files"],
      {
        cwd: process.cwd(),
        env,
        stdio: "pipe",
        shell: false,
      },
    );

    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.on("close", (code) => resolveRun({ code: code ?? 1, output }));
    child.on("error", (error) => resolveRun({ code: 1, output: String(error) }));
  });
}

function assertOutput(result, label, expectedCode, expectedLines) {
  if (result.code !== expectedCode) {
    throw new Error(`${label} expected exit ${expectedCode}, got ${result.code}.\n${result.output}`);
  }

  for (const line of expectedLines) {
    if (!result.output.includes(line)) {
      throw new Error(`${label} missing output: ${line}\n${result.output}`);
    }
  }

  process.stdout.write(`${label}=pass\n`);
}

const musuRepo = resolve(process.env.MUSU_REPO_PATH ?? DEFAULT_MUSU_REPO);
if (!existsSync(resolve(musuRepo, "package.json"))) {
  throw new Error(`MUSU repo package.json not found: ${musuRepo}`);
}

const root = await mkdtemp(join(tmpdir(), "vibecode-warden-diagnose-"));
const sqlEvidence = join(root, "warden-sql-evidence.csv");
await writeFile(
  sqlEvidence,
  [
    "row_type,check_name,status",
    "summary,all Warden migration checks pass,pass",
    "check,owner_select policy exists,pass",
    "check,required columns exist,pass",
    "check,status/resolution consistency constraint exists,pass",
    "check,warden_events RLS enabled,pass",
    "check,warden_events table exists,pass",
    "check,warden_events_node_created index exists,pass",
    "check,warden_events_user_status_created index exists,pass",
  ].join("\n"),
  "utf8",
);

const sqlEditorResult = await runDiagnose(baseEnv({
  WARDEN_SQL_EVIDENCE_FILE: sqlEvidence,
  WARDEN_VERIFY_NODE: "diagnose-node",
  WARDEN_VERIFY_COOKIE: "session=diagnose",
}));
assertOutput(sqlEditorResult, "warden_runtime_diagnose_sql_editor_mode_self_test", 0, [
  "database_url_available=fail",
  "warden_apply_armed=fail",
  "warden_sql_evidence_verify=pass",
  "direct_migration_apply_inputs_ready=fail",
  "sql_editor_migration_evidence_ready=pass",
  "migration_application_evidence_ready=pass",
  "warden_runtime_inputs_ready=pass",
]);

const directApplyResult = await runDiagnose(baseEnv({
  WARDEN_DATABASE_URL: "postgresql://user:pass@localhost:5432/postgres",
  WARDEN_APPLY_MIGRATIONS: "1",
  WARDEN_VERIFY_NODE: "diagnose-node",
  WARDEN_VERIFY_COOKIE: "session=diagnose",
}));
assertOutput(directApplyResult, "warden_runtime_diagnose_direct_apply_mode_self_test", 0, [
  "database_url_available=pass",
  "database_url_valid=pass",
  "warden_apply_armed=pass",
  "direct_migration_apply_inputs_ready=pass",
  "sql_editor_migration_evidence_ready=fail",
  "migration_application_evidence_ready=pass",
  "warden_runtime_inputs_ready=pass",
]);

const missingEvidenceResult = await runDiagnose(baseEnv({
  WARDEN_VERIFY_NODE: "diagnose-node",
  WARDEN_VERIFY_COOKIE: "session=diagnose",
}));
assertOutput(missingEvidenceResult, "warden_runtime_diagnose_missing_migration_evidence_self_test", 1, [
  "direct_migration_apply_inputs_ready=fail",
  "sql_editor_migration_evidence_ready=fail",
  "migration_application_evidence_ready=fail",
  "warden_runtime_inputs_ready=fail",
]);

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

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

function runCapture(args, env) {
  return new Promise((resolveRun) => {
    const child = spawn(
      process.execPath,
      [resolve("scripts/capture-warden-runtime-evidence.mjs"), ...args],
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

const missingMigrationEvidence = await runCapture(["--preflight"], baseEnv({
  WARDEN_VERIFY_NODE: "capture-node",
  WARDEN_VERIFY_COOKIE: "session=capture",
}));

assertOutput(missingMigrationEvidence, "warden_runtime_capture_missing_migration_evidence_self_test", 1, [
  "Migration application evidence is required before Warden runtime capture.",
  "Set WARDEN_SQL_EVIDENCE_FILE to a saved Supabase SQL Editor all-pass export, or rerun with --apply-migrations.",
]);

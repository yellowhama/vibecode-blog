import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const DEFAULT_MUSU_REPO = String.raw`F:\Aisaak\Projects\musu-pro`;

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function npmCommand() {
  return "npm";
}

function printStatus(name, pass, detail = "") {
  const value = pass ? "pass" : "fail";
  process.stdout.write(`${name}=${value}${detail ? ` ${detail}` : ""}\n`);
}

function envStatus(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
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

async function main() {
  const musuRepo = resolve(getArg("--musu-repo") ?? process.env.MUSU_REPO_PATH ?? DEFAULT_MUSU_REPO);
  const musuPackagePath = resolve(musuRepo, "package.json");
  const vibecodePackagePath = resolve("package.json");
  const musuPackage = await readPackageJson(musuPackagePath);
  const vibecodePackage = await readPackageJson(vibecodePackagePath);

  process.stdout.write(`diagnostic_date=${new Date().toISOString()}\n`);
  process.stdout.write(`musu_repo=${musuRepo}\n`);

  printStatus("musu_repo_exists", existsSync(musuPackagePath));
  printStatus("musu_prepare_script", hasScript(musuPackage, "prepare:warden:migrations"));
  printStatus("musu_apply_script", hasScript(musuPackage, "apply:warden:migrations"));
  printStatus("musu_runtime_verify_script", hasScript(musuPackage, "verify:warden"));
  printStatus("musu_product_verify_script", hasScript(musuPackage, "verify:warden:product"));
  printStatus("vibecode_capture_script", hasScript(vibecodePackage, "capture:warden-runtime"));
  printStatus("vibecode_field_log_gate", hasScript(vibecodePackage, "verify:warden-field-log"));

  const hasDatabaseUrl = envStatus("WARDEN_DATABASE_URL") || envStatus("SUPABASE_DB_URL") || envStatus("DATABASE_URL");
  printStatus("database_url_available", hasDatabaseUrl);
  printStatus("warden_apply_armed", process.env.WARDEN_APPLY_MIGRATIONS === "1");
  printStatus("warden_node_available", envStatus("WARDEN_VERIFY_NODE"));

  if (envStatus("WARDEN_VERIFY_COOKIE_FILE")) {
    const cookiePath = resolve(process.env.WARDEN_VERIFY_COOKIE_FILE);
    printStatus("warden_cookie_available", existsSync(cookiePath), `source=file path_exists=${existsSync(cookiePath)}`);
  } else {
    printStatus("warden_cookie_available", envStatus("WARDEN_VERIFY_COOKIE"), envStatus("WARDEN_VERIFY_COOKIE") ? "source=inline" : "");
  }

  if (!existsSync(musuPackagePath)) {
    process.stderr.write("Cannot run MUSU diagnostics because package.json is missing.\n");
    return 1;
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
    && process.env.WARDEN_APPLY_MIGRATIONS === "1"
    && packetCode === 0;

  const captureReady = envStatus("WARDEN_VERIFY_NODE")
    && (envStatus("WARDEN_VERIFY_COOKIE") || envStatus("WARDEN_VERIFY_COOKIE_FILE"))
    && packetCode === 0
    && runtimeCode === 0;

  printStatus("guarded_migration_apply_ready", guardedApplyReady);
  printStatus("warden_runtime_capture_ready", captureReady);
  printStatus("warden_field_log_currently_ready", fieldLogCode === 0);
  if (!captureReady) {
    process.stdout.write("next_step=Provide WARDEN_DATABASE_URL, WARDEN_APPLY_MIGRATIONS=1, WARDEN_VERIFY_NODE, and dashboard cookie; then run npm run capture:warden-runtime -- --preflight --apply-migrations.\n");
  }

  return captureReady ? 0 : 1;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

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

function hasFlag(name) {
  return process.argv.includes(name);
}

function npmCommand() {
  return "npm";
}

function printStatus(name, pass, detail = "") {
  const value = pass ? "pass" : "fail";
  process.stdout.write(`${name}=${value}${detail ? ` ${detail}` : ""}\n`);
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
    try {
      const vars = parseEnv(await readFile(resolve(path), "utf8"));
      for (const [name, value] of Object.entries(vars)) {
        if (value.trim() && process.env[name] === undefined) {
          process.env[name] = value;
        }
      }
      loaded += 1;
    } catch {
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
  const localEnvFilesLoaded = await loadEnvFiles([
    ".env.warden-runtime.local",
    ".env.local",
  ]);
  const musuRepo = resolve(getArg("--musu-repo") ?? process.env.MUSU_REPO_PATH ?? DEFAULT_MUSU_REPO);
  const musuEnvFilesLoaded = await loadEnvFiles([
    resolve(musuRepo, ".env.warden-runtime.local"),
    resolve(musuRepo, ".env.local"),
  ]);
  const loadedEnvFiles = localEnvFilesLoaded + musuEnvFilesLoaded;
  const musuPackagePath = resolve(musuRepo, "package.json");
  const vibecodePackagePath = resolve("package.json");
  const musuPackage = await readPackageJson(musuPackagePath);
  const vibecodePackage = await readPackageJson(vibecodePackagePath);

  process.stdout.write(`diagnostic_date=${new Date().toISOString()}\n`);
  process.stdout.write(`musu_repo=${musuRepo}\n`);
  process.stdout.write(`local_env_files_loaded=${loadedEnvFiles}\n`);

  printStatus("musu_repo_exists", existsSync(musuPackagePath));
  printStatus("musu_prepare_script", hasScript(musuPackage, "prepare:warden:migrations"));
  printStatus("musu_apply_script", hasScript(musuPackage, "apply:warden:migrations"));
  printStatus("musu_runtime_verify_script", hasScript(musuPackage, "verify:warden"));
  printStatus("musu_product_verify_script", hasScript(musuPackage, "verify:warden:product"));
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

  const inputsReady = validDatabaseUrl
    && process.env.WARDEN_APPLY_MIGRATIONS === "1"
    && envStatus("WARDEN_VERIFY_NODE")
    && hasCookie;

  printStatus("warden_runtime_inputs_ready", inputsReady);
  if (hasFlag("--inputs-only")) {
    if (!inputsReady) {
      process.stdout.write("next_step=Fill WARDEN_DATABASE_URL, WARDEN_APPLY_MIGRATIONS=1, WARDEN_VERIFY_NODE, and a non-empty dashboard cookie before running full diagnostics.\n");
    }
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

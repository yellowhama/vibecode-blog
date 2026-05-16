import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

const DEFAULT_MUSU_REPO = String.raw`F:\Aisaak\Projects\musu-pro`;
const DEFAULT_EVIDENCE_DIR = String.raw`C:\Users\empty\llm-wiki\companies\vibecode-town\incidents\evidence`;

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

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, "-");
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
  --help              Show this help.

Required environment:
  WARDEN_VERIFY_NODE
  WARDEN_VERIFY_COOKIE or WARDEN_VERIFY_COOKIE_FILE

Optional environment forwarded to MUSU verifier:
  WARDEN_VERIFY_APP_URL
  WARDEN_VERIFY_COMMAND
  WARDEN_VERIFY_DECISION
  WARDEN_VERIFY_USER_ID
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
      process.stdout.write(`cookie_file=${cookiePath}\n`);
    }
  } else if (process.env.WARDEN_VERIFY_COOKIE) {
    process.stdout.write("cookie=provided_inline\n");
  } else {
    process.stderr.write("WARDEN_VERIFY_COOKIE or WARDEN_VERIFY_COOKIE_FILE is required.\n");
    process.stderr.write("Use an authenticated MUSU dashboard session for the user that owns WARDEN_VERIFY_NODE.\n");
    ok = false;
  }

  return ok;
}

async function main() {
  if (hasFlag("--help")) {
    printHelp();
    return 0;
  }

  const musuRepo = resolve(getArg("--musu-repo") ?? process.env.MUSU_REPO_PATH ?? DEFAULT_MUSU_REPO);
  const inputsOk = await validateInputs(musuRepo);
  if (!inputsOk) {
    return 1;
  }

  if (hasFlag("--preflight")) {
    const appUrl = (process.env.WARDEN_VERIFY_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const appOk = await checkAppUrl(appUrl);
    const preflightEnv = {
      ...process.env,
      WARDEN_VERIFY_CHECK_INTEGRITY: process.env.WARDEN_VERIFY_CHECK_INTEGRITY ?? "1",
    };
    const migrationCode = await run(npmCommand(), ["run", "verify:warden"], {
      cwd: musuRepo,
      env: preflightEnv,
    });
    if (appOk && migrationCode === 0) {
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

  const verifyCode = await run(npmCommand(), ["run", "verify:warden:product"], {
    cwd: musuRepo,
    env: verifierEnv,
  });

  if (verifyCode !== 0) {
    process.stderr.write("Warden product-path evidence capture failed. Stop before incident generation.\n");
    return verifyCode;
  }

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

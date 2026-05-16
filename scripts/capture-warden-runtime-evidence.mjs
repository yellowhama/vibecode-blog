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
  --help              Show this help.

Required environment:
  WARDEN_VERIFY_NODE
  WARDEN_VERIFY_COOKIE or WARDEN_VERIFY_COOKIE_FILE

Optional environment forwarded to MUSU verifier:
  WARDEN_VERIFY_APP_URL
  WARDEN_VERIFY_COMMAND
  WARDEN_VERIFY_DECISION
`);
}

async function main() {
  if (hasFlag("--help")) {
    printHelp();
    return 0;
  }

  const musuRepo = resolve(getArg("--musu-repo") ?? process.env.MUSU_REPO_PATH ?? DEFAULT_MUSU_REPO);
  const packagePath = resolve(musuRepo, "package.json");
  if (!existsSync(packagePath)) {
    process.stderr.write(`MUSU repo package.json not found: ${packagePath}\n`);
    return 1;
  }

  if (!process.env.WARDEN_VERIFY_NODE) {
    process.stderr.write("WARDEN_VERIFY_NODE is required.\n");
    return 1;
  }

  if (!process.env.WARDEN_VERIFY_COOKIE && !process.env.WARDEN_VERIFY_COOKIE_FILE) {
    process.stderr.write("WARDEN_VERIFY_COOKIE or WARDEN_VERIFY_COOKIE_FILE is required.\n");
    process.stderr.write("Use an authenticated MUSU dashboard session for the user that owns WARDEN_VERIFY_NODE.\n");
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

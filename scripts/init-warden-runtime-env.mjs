import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const envPath = resolve(".env.warden-runtime.local");
const examplePath = resolve(".env.warden-runtime.example");

function hasFlag(name) {
  return process.argv.includes(name);
}

async function main() {
  if (existsSync(envPath) && !hasFlag("--force")) {
    process.stderr.write(`${envPath} already exists. Re-run with --force to overwrite.\n`);
    return 1;
  }

  const template = await readFile(examplePath, "utf8");
  await writeFile(envPath, template, "utf8");
  process.stdout.write(`warden_runtime_env_template=${envPath}\n`);
  process.stdout.write("next_step=Fill WARDEN_DATABASE_URL, WARDEN_APPLY_MIGRATIONS=1, WARDEN_VERIFY_NODE, and WARDEN_VERIFY_COOKIE_FILE, then run npm run diagnose:warden-runtime.\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

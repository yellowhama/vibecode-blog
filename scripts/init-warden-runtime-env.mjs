import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const envPath = resolve(".env.warden-runtime.local");

function hasFlag(name) {
  return process.argv.includes(name);
}

const template = `# Warden runtime capture inputs.
# This file is ignored by git. Fill values locally; do not commit secrets.

# Supabase Postgres connection string for applying migrations 019/020.
# Example shape: postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
WARDEN_DATABASE_URL=

# Required guard for database DDL. Keep empty until you are ready to apply.
WARDEN_APPLY_MIGRATIONS=

# Registered MUSU node owned by the authenticated dashboard user.
WARDEN_VERIFY_NODE=

# MUSU app URL. Use localhost only when the MUSU Next.js app is running there.
WARDEN_VERIFY_APP_URL=http://localhost:3000

# Preferred: path to a local file containing the authenticated dashboard Cookie header.
WARDEN_VERIFY_COOKIE_FILE=

# Alternative: inline authenticated dashboard Cookie header.
# WARDEN_VERIFY_COOKIE=

# Optional safe command to use for the product-path block test.
# Leave empty to use the verifier default non-contract command.
WARDEN_VERIFY_COMMAND=

# Default Warden decision after the blocked event is created.
WARDEN_VERIFY_DECISION=denied
`;

async function main() {
  if (existsSync(envPath) && !hasFlag("--force")) {
    process.stderr.write(`${envPath} already exists. Re-run with --force to overwrite.\n`);
    return 1;
  }

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

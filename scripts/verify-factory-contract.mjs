import { readFile } from "node:fs/promises";

const TEMPLATE_FILE = "factory/templates.md";
const ENGINE_FILE = "factory/vibe_engine.py";

const TEMPLATE_FORBIDDEN_PATTERNS = [
  { pattern: /\bCastaway\b/i, message: "Field Log voice must not use Castaway framing" },
  { pattern: /\bThe Drift\b/i, message: "Field Log template must not use drift framing" },
  { pattern: /\bAI ocean\b/i, message: "Field Log template must not use AI ocean framing" },
];

const ENGINE_FORBIDDEN_PATTERNS = [
  { pattern: /draft:\s*false/, message: "factory draft generator must not create public posts by default" },
  { pattern: /references:\s*\[\]/, message: "factory draft generator must not create empty references arrays" },
];

async function main() {
  const failures = [];
  const templateText = await readFile(TEMPLATE_FILE, "utf8");
  const engineText = await readFile(ENGINE_FILE, "utf8");

  for (const rule of TEMPLATE_FORBIDDEN_PATTERNS) {
    if (rule.pattern.test(templateText)) {
      failures.push(`${TEMPLATE_FILE}: ${rule.message}`);
    }
  }

  for (const rule of ENGINE_FORBIDDEN_PATTERNS) {
    if (rule.pattern.test(engineText)) {
      failures.push(`${ENGINE_FILE}: ${rule.message}`);
    }
  }

  if (!/draft:\s*true/.test(engineText)) {
    failures.push(`${ENGINE_FILE}: factory draft generator should mark generated drafts as draft: true`);
  }

  process.stdout.write("factory_contract_files_checked=2\n");
  if (failures.length > 0) {
    process.stderr.write("Factory contract gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("factory_contract_gate=fail\n");
    return 1;
  }

  process.stdout.write("factory_contract_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

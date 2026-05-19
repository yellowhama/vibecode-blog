import { readFile } from "node:fs/promises";

const FILES = [
  "vercel.json",
  "astro.config.ts",
  "src/config.ts",
  "public/install.sh",
];

const FORBIDDEN_PRODUCT_MENTIONS = [
  { label: "musu.pro", pattern: /musu\.pro/i },
  { label: "MUSU Pro", pattern: /\bMUSU\s+Pro\b/i },
  { label: "MUSU", pattern: /\bMUSU\b/ },
  { label: "musu-bee", pattern: /\bmusu-bee\b/i },
];

async function main() {
  const failures = [];

  for (const file of FILES) {
    const text = await readFile(file, "utf8");
    for (const forbidden of FORBIDDEN_PRODUCT_MENTIONS) {
      if (forbidden.pattern.test(text)) {
        failures.push(`${file}: deploy/public config contains forbidden product mention "${forbidden.label}"`);
      }
    }
  }

  const vercel = JSON.parse(await readFile("vercel.json", "utf8"));
  for (const rewrite of vercel.rewrites ?? []) {
    if (rewrite.source === "/install.sh") {
      failures.push("vercel.json: /install.sh must be served from public/install.sh, not a Vercel rewrite");
    }
    if (typeof rewrite.destination === "string" && /^https?:\/\//i.test(rewrite.destination)) {
      failures.push(`vercel.json: external rewrite is not portable public-surface behavior: ${rewrite.source}`);
    }
  }

  process.stdout.write(`deploy_surface_files_checked=${FILES.length}\n`);

  if (failures.length > 0) {
    process.stderr.write("Deploy surface gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("deploy_surface_gate=fail\n");
    return 1;
  }

  process.stdout.write("deploy_surface_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";

const DEFAULT_OUTPUT =
  process.env.VIBECODE_CODE_INDEX_DIR ?? String.raw`F:\Aisaak\CompanyArtifacts\vibecode-code-index`;

const INCLUDE_ROOTS = ["src", "scripts"];
const INCLUDE_FILES = [
  "astro.config.mjs",
  "eslint.config.mjs",
  "package.json",
  "tsconfig.json",
  "src/data/article-production-harness.json",
];
const CODE_EXTENSIONS = new Set([".astro", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".json"]);
const SKIP_DIRS = new Set([
  ".astro",
  ".git",
  ".vercel",
  "dist",
  "node_modules",
  "node_modules_",
  "public",
  "__pycache__",
]);
const REQUIRED_FILES = [
  "scripts/verify-rendered-pages.mjs",
  "scripts/verify-article-production-harness.mjs",
  "scripts/verify-public-surface.mjs",
  "scripts/generate-source-workflow-manifest.mjs",
  "src/data/article-production-harness.json",
];

function hasArg(name) {
  return process.argv.includes(name);
}

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function exists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function normalizePath(path) {
  return path.split(sep).join("/");
}

function currentCommit(repoRoot) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

function shortHash(text) {
  return createHash("sha256").update(text).digest("hex");
}

async function walk(dir, output = []) {
  if (!(await exists(dir))) return output;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      await walk(join(dir, entry.name), output);
      continue;
    }
    if (!entry.isFile()) continue;
    const path = join(dir, entry.name);
    if (CODE_EXTENSIONS.has(extname(entry.name).toLowerCase())) output.push(path);
  }
  return output;
}

function lineOf(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function pushRegexSymbols(symbols, text, regex, kind) {
  for (const match of text.matchAll(regex)) {
    const name = match.groups?.name;
    if (!name) continue;
    symbols.push({ kind, name, line: lineOf(text, match.index ?? 0) });
  }
}

function extractJsLikeSymbols(text) {
  const symbols = [];
  pushRegexSymbols(symbols, text, /\bexport\s+(?:async\s+)?function\s+(?<name>[A-Za-z_$][\w$]*)\s*\(/g, "exported_function");
  pushRegexSymbols(symbols, text, /\bexport\s+class\s+(?<name>[A-Za-z_$][\w$]*)\b/g, "exported_class");
  pushRegexSymbols(symbols, text, /\bexport\s+const\s+(?<name>[A-Za-z_$][\w$]*)\s*=/g, "exported_const");
  pushRegexSymbols(symbols, text, /\b(?:async\s+)?function\s+(?<name>[A-Za-z_$][\w$]*)\s*\(/g, "function");
  pushRegexSymbols(symbols, text, /\bclass\s+(?<name>[A-Za-z_$][\w$]*)\b/g, "class");
  pushRegexSymbols(symbols, text, /\bconst\s+(?<name>[A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g, "arrow_function");
  pushRegexSymbols(symbols, text, /\bconst\s+(?<name>[A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?[A-Za-z_$][\w$]*\s*=>/g, "arrow_function");
  return dedupeSymbols(symbols);
}

function extractPackageScripts(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    return Object.keys(parsed.scripts ?? {}).sort().map((name) => ({
      kind: "npm_script",
      name,
      line: lineOf(jsonText, jsonText.indexOf(`"${name}"`)),
    }));
  } catch {
    return [];
  }
}

function extractJsonKeys(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    return Object.keys(parsed).sort().map((name) => ({ kind: "json_top_level_key", name, line: 1 }));
  } catch {
    return [];
  }
}

function dedupeSymbols(symbols) {
  const seen = new Set();
  const out = [];
  for (const symbol of symbols) {
    const key = `${symbol.kind}:${symbol.name}:${symbol.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(symbol);
  }
  return out;
}

function extractImports(text) {
  const imports = [];
  for (const match of text.matchAll(/\bimport\s+(?:[\s\S]*?\s+from\s+)?["'](?<source>[^"']+)["']/g)) {
    imports.push({ source: match.groups.source, line: lineOf(text, match.index ?? 0) });
  }
  for (const match of text.matchAll(/\bawait\s+import\(["'](?<source>[^"']+)["']\)/g)) {
    imports.push({ source: match.groups.source, line: lineOf(text, match.index ?? 0), dynamic: true });
  }
  return imports;
}

async function buildIndex(repoRoot) {
  const absoluteRoot = resolve(repoRoot);
  const collected = new Set();
  for (const root of INCLUDE_ROOTS) {
    for (const file of await walk(join(absoluteRoot, root))) collected.add(file);
  }
  for (const file of INCLUDE_FILES) {
    const absolute = join(absoluteRoot, file);
    if (await exists(absolute)) collected.add(absolute);
  }

  const files = [];
  for (const absolutePath of [...collected].sort()) {
    const text = await readFile(absolutePath, "utf8");
    const relativePath = normalizePath(relative(absoluteRoot, absolutePath));
    const ext = extname(relativePath).toLowerCase();
    let symbols = [];
    if (relativePath === "package.json") symbols = extractPackageScripts(text);
    else if (ext === ".json") symbols = extractJsonKeys(text);
    else symbols = extractJsLikeSymbols(text);

    files.push({
      path: relativePath,
      bytes: Buffer.byteLength(text, "utf8"),
      sha256: shortHash(text),
      symbols,
      imports: [".js", ".mjs", ".cjs", ".ts", ".tsx", ".astro"].includes(ext) ? extractImports(text) : [],
    });
  }

  const symbols = files.flatMap((file) =>
    file.symbols.map((symbol) => ({
      ...symbol,
      path: file.path,
    })),
  );

  return {
    schema: "vibecode-local-code-index/v1",
    generatedAt: new Date().toISOString(),
    repoRoot: absoluteRoot,
    commit: currentCommit(absoluteRoot),
    includeRoots: INCLUDE_ROOTS,
    requiredFiles: REQUIRED_FILES,
    fileCount: files.length,
    symbolCount: symbols.length,
    files,
    symbols,
  };
}

function stableComparable(index) {
  return JSON.stringify(
    {
      schema: index.schema,
      repoRoot: index.repoRoot,
      commit: index.commit,
      includeRoots: index.includeRoots,
      requiredFiles: index.requiredFiles,
      fileCount: index.fileCount,
      symbolCount: index.symbolCount,
      files: index.files,
      symbols: index.symbols,
    },
    null,
    2,
  );
}

function markdownSummary(index) {
  const topFiles = [...index.files]
    .sort((a, b) => b.symbols.length - a.symbols.length)
    .slice(0, 20)
    .map((file) => `| ${file.path} | ${file.symbols.length} | ${file.imports.length} |`)
    .join("\n");
  const required = REQUIRED_FILES.map((file) => {
    const found = index.files.some((entry) => entry.path === file);
    return `- ${found ? "pass" : "fail"}: ${file}`;
  }).join("\n");

  return `# Vibecode Local Code Index

Generated: ${index.generatedAt}
Commit: ${index.commit}
Files indexed: ${index.fileCount}
Symbols indexed: ${index.symbolCount}

## Required Surface

${required}

## Highest Symbol Density

| File | Symbols | Imports |
| --- | ---: | ---: |
${topFiles}
`;
}

async function main() {
  const repoRoot = resolve(getArg("--repo") ?? process.cwd());
  const outDir = resolve(getArg("--out") ?? DEFAULT_OUTPUT);
  const checkOnly = hasArg("--check");
  const index = await buildIndex(repoRoot);
  const jsonPath = join(outDir, "local-code-index.json");
  const markdownPath = join(outDir, "local-code-index.md");

  const missing = REQUIRED_FILES.filter((file) => !index.files.some((entry) => entry.path === file));
  if (missing.length > 0) {
    process.stderr.write(`local code index missing required files: ${missing.join(", ")}\n`);
    process.stdout.write("local_code_index_gate=fail\n");
    return 1;
  }
  if (index.fileCount < 40 || index.symbolCount < 80) {
    process.stderr.write(`local code index too small: files=${index.fileCount}, symbols=${index.symbolCount}\n`);
    process.stdout.write("local_code_index_gate=fail\n");
    return 1;
  }

  if (checkOnly) {
    if (!(await exists(jsonPath))) {
      process.stderr.write(`local code index missing: ${jsonPath}\n`);
      process.stdout.write("local_code_index_gate=fail\n");
      return 1;
    }
    const current = JSON.parse(await readFile(jsonPath, "utf8"));
    const currentComparable = stableComparable(current);
    const nextComparable = stableComparable(index);
    if (currentComparable !== nextComparable) {
      process.stderr.write("local code index is stale; run npm run index:local-code\n");
      process.stdout.write("local_code_index_gate=fail\n");
      return 1;
    }
    process.stdout.write(`local_code_index_json=${jsonPath}\n`);
    process.stdout.write(`local_code_index_files=${index.fileCount}\n`);
    process.stdout.write(`local_code_index_symbols=${index.symbolCount}\n`);
    process.stdout.write("local_code_index_gate=pass\n");
    return 0;
  }

  await mkdir(dirname(jsonPath), { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, markdownSummary(index), "utf8");
  process.stdout.write(`local_code_index_json=${jsonPath}\n`);
  process.stdout.write(`local_code_index_markdown=${markdownPath}\n`);
  process.stdout.write(`local_code_index_files=${index.fileCount}\n`);
  process.stdout.write(`local_code_index_symbols=${index.symbolCount}\n`);
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
  process.exitCode = 1;
}

import { access, readdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";
const DEFAULT_WIKI_ROOT =
  process.env.LLM_WIKI_ROOT ?? String.raw`F:\Aisaak\CompanyArtifacts\llm-wiki-completed`;
const DEFAULT_MANIFEST = "source-workflow-packets.json";
const REQUIRED_PACKET_SUFFIXES = [
  "reader-pressure",
  "title-angle",
  "evidence-bundle",
  "brief",
  "gate-0",
  "draft-critique",
];

function hasArg(name) {
  return process.argv.includes(name);
}

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function parseMarkdown(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: text };
  return { frontmatter: match[1], body: match[2] };
}

function getFrontmatterValue(frontmatter, name) {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
  if (!match) return "";
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function isDraft(frontmatter) {
  return /^draft:\s*true\s*$/m.test(frontmatter);
}

async function fileExists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(path) {
  const buffer = await readFile(path);
  return createHash("sha256").update(buffer).digest("hex");
}

function packetPath(slug, suffix) {
  return `companies/vibecode-town/plans/${slug}-${suffix}.md`;
}

async function packetEntry(wikiRoot, slug, suffix) {
  const relativePath = packetPath(slug, suffix);
  const absolutePath = join(wikiRoot, relativePath);
  if (!(await fileExists(absolutePath))) {
    throw new Error(`missing source workflow packet: ${absolutePath}`);
  }
  return {
    suffix,
    path: relativePath,
    sha256: await sha256File(absolutePath),
  };
}

async function packetBackedSlugs(blogDir) {
  const files = (await readdir(blogDir))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const slugs = [];

  for (const file of files) {
    const text = await readFile(join(blogDir, file), "utf8");
    const { frontmatter } = parseMarkdown(text);
    if (isDraft(frontmatter)) continue;
    if (getFrontmatterValue(frontmatter, "series") === "About") continue;
    if (getFrontmatterValue(frontmatter, "workflow") === "legacy") continue;
    slugs.push(file.replace(/\.md$/, ""));
  }

  return slugs;
}

async function buildManifest({ blogDir, wikiRoot }) {
  const packets = {};
  for (const slug of await packetBackedSlugs(blogDir)) {
    packets[slug] = {
      files: await Promise.all(REQUIRED_PACKET_SUFFIXES.map((suffix) => packetEntry(wikiRoot, slug, suffix))),
    };
  }

  return {
    generated_at: new Date().toISOString(),
    source: wikiRoot,
    packets,
  };
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function comparableManifest(manifest) {
  return {
    source: manifest.source,
    packets: manifest.packets,
  };
}

async function main() {
  const blogDir = getArg("--blog-dir") ?? DEFAULT_BLOG_DIR;
  const wikiRoot = resolve(getArg("--wiki-root") ?? DEFAULT_WIKI_ROOT);
  const manifestFile = getArg("--manifest") ?? DEFAULT_MANIFEST;
  const checkOnly = hasArg("--check");

  if (!(await fileExists(wikiRoot))) {
    if (checkOnly) {
      process.stdout.write("source_workflow_manifest_check=skip\n");
      process.stdout.write(`source_workflow_manifest_skip_reason=llm_wiki_unreadable:${wikiRoot}\n`);
      return 0;
    }
    throw new Error(`LLM-Wiki root is not readable: ${wikiRoot}`);
  }

  const manifest = await buildManifest({ blogDir, wikiRoot });
  const nextText = stableJson(manifest);

  if (checkOnly) {
    const current = JSON.parse(await readFile(manifestFile, "utf8"));
    const expectedComparable = stableJson(comparableManifest(manifest));
    const currentComparable = stableJson(comparableManifest(current));
    if (expectedComparable !== currentComparable) {
      process.stderr.write("source workflow manifest is stale; run npm run write:source-workflow-manifest\n");
      process.stdout.write("source_workflow_manifest_check=fail\n");
      return 1;
    }
    process.stdout.write("source_workflow_manifest_check=pass\n");
    return 0;
  }

  await writeFile(manifestFile, nextText, "utf8");
  process.stdout.write(`source_workflow_manifest_written=${manifestFile}\n`);
  process.stdout.write(`source_workflow_manifest_packet_count=${Object.keys(manifest.packets).length}\n`);
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

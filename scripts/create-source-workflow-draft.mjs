import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const DEFAULT_OUTPUT_DIR = "src/data/blog";
const DEFAULT_WIKI_ROOT =
  process.env.LLM_WIKI_ROOT ?? String.raw`F:\Aisaak\CompanyArtifacts\llm-wiki-completed`;
const PACKET_SUFFIXES = [
  "reader-pressure",
  "title-angle",
  "evidence-bundle",
  "brief",
  "gate-0",
  "draft-critique",
];

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function requiredArg(name) {
  const value = getArg(name);
  if (!value?.trim()) {
    throw new Error(`missing required argument: ${name}`);
  }
  return value.trim();
}

function slugIsValid(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

async function fileExists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function yamlEscape(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function packetPath(wikiRoot, slug, suffix) {
  return join(wikiRoot, "companies", "vibecode-town", "plans", `${slug}-${suffix}.md`);
}

async function readPackets(wikiRoot, slug) {
  const packets = {};
  for (const suffix of PACKET_SUFFIXES) {
    packets[suffix] = await readFile(packetPath(wikiRoot, slug, suffix), "utf8");
  }
  return packets;
}

function firstUrl(text) {
  return text.match(/https?:\/\/[^\s)>"']+/i)?.[0] ?? "";
}

function extractSection(text, heading) {
  const pattern = new RegExp(`^#{1,3}\\s+${heading}\\s*\\r?\\n([\\s\\S]*?)(?=\\r?\\n#{1,3}\\s+|$)`, "im");
  return text.match(pattern)?.[1]?.trim() ?? "";
}

function splitTags(value) {
  const tags = (value ?? "ai-agents,verification")
    .split(/[,;]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  return [...new Set(tags)];
}

async function writeValidationBlog(root, slug, title, series) {
  const blogDir = join(root, "blog");
  await mkdir(blogDir, { recursive: true });
  await writeFile(
    join(blogDir, `${slug}.md`),
    `---\ntitle: "${yamlEscape(title)}"\npubDatetime: 2026-05-20T00:00:00Z\ndescription: "Source workflow draft validation fixture."\ndraft: false\nseries: "${yamlEscape(series)}"\nworkflow: "packet"\n---\n\n# ${title}\n`,
    "utf8",
  );
  return blogDir;
}

function runQualityGate({ blogDir, wikiRoot }) {
  return spawnSync(
    process.execPath,
    [
      resolve("scripts/verify-source-workflow-quality.mjs"),
      "--blog-dir",
      blogDir,
      "--wiki-root",
      wikiRoot,
    ],
    {
      cwd: resolve("."),
      encoding: "utf8",
    },
  );
}

function failOnPublishArgs() {
  if (hasArg("--publish") || hasArg("--published") || hasArg("--public") || hasArg("--draft")) {
    throw new Error("source workflow draft generator only writes draft: true; publication requires human approval");
  }
}

function buildDraft({ slug, title, description, series, tags, packets, sourceUrl }) {
  const readerProblem = extractSection(packets["reader-pressure"], "Reader Problem");
  const readerQuestion = extractSection(packets["reader-pressure"], "Reader Question");
  const angle = extractSection(packets["title-angle"], "Angle");
  const hook = extractSection(packets.brief, "Hook");
  const corePoint = extractSection(packets.brief, "Core Point");
  const proof = extractSection(packets.brief, "Proof");
  const currentRisk = extractSection(packets["draft-critique"], "Current Risk");
  const nonClaims = extractSection(packets["evidence-bundle"], "Non-Claims");
  const tagYaml = tags.map((tag) => `"${yamlEscape(tag)}"`).join(", ");

  return `---
title: "${yamlEscape(title)}"
pubDatetime: ${new Date().toISOString()}
description: "${yamlEscape(description)}"
draft: true
featured: false
series: "${yamlEscape(series)}"
lang: "en"
workflow: "packet"
tags: [${tagYaml}]
ogImage: "/images/posts/${slug}.png"
references:
  - name: "Primary source packet reference"
    url: "${yamlEscape(sourceUrl)}"
    guru: "source-workflow-packet"
---

# ${title}

> Draft generated only after the source workflow quality gate passed. This is not approved for publication.

## Packet Receipt

\`\`\`txt
source_workflow_quality_gate=pass
source_workflow_slug=${slug}
publication_state=draft_only
approval_required=true
\`\`\`

## Opening Pressure

${hook || "TODO: Open on the visible failure, cost, or proof artifact from the source packet."}

## Reader Problem

${readerProblem || "TODO: State the reader problem in one inspectable sentence."}

Reader question: ${readerQuestion || "TODO: Name the question the reader is trying to answer."}

## Angle

${angle || corePoint || "TODO: Turn the source into a concrete operating decision, not a trend summary."}

## Evidence To Use

${proof || "TODO: Use only packet-backed public source material and internal proof artifacts."}

Primary source: ${sourceUrl}

## Draft Body

TODO: Write this section after reviewing the source and the internal artifacts. The post should make one strong claim, show the evidence, and transfer a concrete accept/reject decision to the reader.

## Reader Transfer

TODO: End with what the reader should now do differently, what they should verify, and what they should reject.

## Boundary

${nonClaims || "TODO: Name the claim this post is not allowed to make."}

## Draft Risk

${currentRisk || "TODO: Name the most likely way this draft will become boring, unsupported, or too generic."}
`;
}

async function main() {
  failOnPublishArgs();

  const slug = requiredArg("--slug");
  if (!slugIsValid(slug)) {
    throw new Error("--slug must be lowercase kebab-case");
  }

  const title = requiredArg("--title");
  const description =
    getArg("--description")?.trim() ||
    "A packet-backed draft generated after source workflow quality validation.";
  const series = getArg("--series")?.trim() || "AI Tool Note";
  const tags = splitTags(getArg("--tags"));
  const wikiRoot = resolve(getArg("--wiki-root") ?? DEFAULT_WIKI_ROOT);
  const outputDir = resolve(getArg("--output-dir") ?? DEFAULT_OUTPUT_DIR);
  const outputPath = join(outputDir, `${slug}.md`);
  const overwrite = hasArg("--overwrite");

  if (!overwrite && (await fileExists(outputPath))) {
    throw new Error(`draft already exists, pass --overwrite to replace: ${outputPath}`);
  }

  const tempRoot = await makeTestTempDir("vibecode-source-draft-create-");
  const blogDir = await writeValidationBlog(tempRoot, slug, title, series);
  const result = runQualityGate({ blogDir, wikiRoot });
  process.stdout.write(result.stdout);
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.stderr.write("Source workflow draft generation blocked until packet quality gate passes.\n");
    return result.status ?? 1;
  }

  const packets = await readPackets(wikiRoot, slug);
  const sourceUrl = firstUrl(packets["evidence-bundle"]);
  if (!sourceUrl) {
    throw new Error(`${slug}-evidence-bundle.md must include a public source URL`);
  }

  const markdown = buildDraft({
    slug,
    title,
    description,
    series,
    tags,
    packets,
    sourceUrl,
  });

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, markdown, "utf8");
  process.stdout.write(`source_workflow_draft=${outputPath}\n`);
  process.stdout.write(`source_workflow_draft_slug=${slug}\n`);
  process.stdout.write("source_workflow_draft_state=draft_true\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

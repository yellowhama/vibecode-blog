import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = resolve("scripts/verify-source-references.mjs");

function run(blogDir) {
  return spawnSync(process.execPath, [verifier, "--blog-dir", blogDir], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function requireOutput(result, label, expectedStatus, snippets) {
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status !== expectedStatus) {
    throw new Error(`${label}: expected exit ${expectedStatus}, got ${result.status}\n${output}`);
  }

  for (const snippet of snippets) {
    if (!output.includes(snippet)) {
      throw new Error(`${label}: missing output snippet "${snippet}"\n${output}`);
    }
  }
}

async function writePost(dir, name, frontmatter, body = "Body with a technical contract and evidence.") {
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, name),
    `---\n${frontmatter.trim()}\n---\n\n${body}\n`,
    "utf8",
  );
}

async function main() {
  const root = await makeTestTempDir("vibecode-source-references-");
  try {
    const passDir = join(root, "pass");
    const missingRefsDir = join(root, "missing-refs");
    const badUrlDir = join(root, "bad-url");
    const missingOfficialDir = join(root, "missing-official");

    await Promise.all([
      writePost(passDir, "about.md", `
title: "About"
pubDatetime: 2026-05-17T00:00:00Z
description: "About"
draft: false
series: "About"
`, "About pages may omit references."),
      writePost(passDir, "valid.md", `
title: "Valid"
pubDatetime: 2026-05-17T00:00:00Z
description: "Valid"
draft: false
series: "AI Explainer"
references:
  - name: "GPT-5.5"
    url: "https://developers.openai.com/api/docs/models/gpt-5.5"
    guru: "OpenAI"
`, "GPT-5.5 requires an official source and has one."),
      writePost(missingRefsDir, "missing.md", `
title: "Missing"
pubDatetime: 2026-05-17T00:00:00Z
description: "Missing"
draft: false
series: "AI Explainer"
`, "This public post has no frontmatter references."),
      writePost(badUrlDir, "bad.md", `
title: "Bad"
pubDatetime: 2026-05-17T00:00:00Z
description: "Bad"
draft: false
series: "AI Explainer"
references:
  - name: "Old GPT-5.5 URL"
    url: "https://openai.com/research/gpt-5-5"
    guru: "OpenAI"
`, "GPT-5.5 with a known bad reference URL."),
      writePost(missingOfficialDir, "missing-official.md", `
title: "Missing Official"
pubDatetime: 2026-05-17T00:00:00Z
description: "Missing Official"
draft: false
series: "AI Explainer"
references:
  - name: "General Models"
    url: "https://example.com/models"
    guru: "Example"
`, "GPT-5.5 is mentioned without the official OpenAI reference."),
    ]);

    requireOutput(run(passDir), "source_reference_positive_self_test", 0, [
      "source_reference_posts_checked=2",
      "source_reference_posts_with_frontmatter_references=1",
      "source_reference_gate=pass",
    ]);
    requireOutput(run(missingRefsDir), "source_reference_missing_refs_self_test", 1, [
      "missing.md: non-About public posts must include frontmatter references",
      "source_reference_gate=fail",
    ]);
    requireOutput(run(badUrlDir), "source_reference_bad_url_self_test", 1, [
      "bad.md: known bad reference URL https://openai.com/research/gpt-5-5",
      "source_reference_gate=fail",
    ]);
    requireOutput(run(missingOfficialDir), "source_reference_missing_official_self_test", 1, [
      "missing-official.md: GPT-5.5 claims require an official OpenAI GPT-5.5 reference",
      "source_reference_gate=fail",
    ]);

    process.stdout.write("source_reference_positive_self_test=pass\n");
    process.stdout.write("source_reference_missing_refs_self_test=pass\n");
    process.stdout.write("source_reference_bad_url_self_test=pass\n");
    process.stdout.write("source_reference_missing_official_self_test=pass\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

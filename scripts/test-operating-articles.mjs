import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = resolve("scripts/verify-operating-articles.mjs");

const fixtures = {
  "ai-memory-operating-structure.md": {
    series: "AI Explainer",
    body: [
      "# AI가 기억을 잃지 않게 하는 운영 구조",
      "Conversation state",
      "Compaction",
      "MCP Resources",
      "## Operating Memory Stack",
      "## Audit Checklist",
      "source, spec, handoff, index",
      "https://musu.pro",
    ].join("\n\n"),
  },
  "mcp-shared-state-data-leak.md": {
    series: "AI Market Watch",
    body: [
      "# MCP 서버는 stateless여도 shared state를 재사용하면 안 된다",
      "GHSA-345p-7cg4-v4c7",
      "@modelcontextprotocol/sdk",
      "## Control Contract",
      "## Operator Checklist",
      "## Technical Verdict",
      "https://musu.pro",
    ].join("\n\n"),
  },
  "ai-agent-work-disk-contract.md": {
    series: "AI Tool Note",
    body: [
      "# AI 에이전트 작업 폴더를 C와 F로 나누는 법",
      "Node.js os.tmpdir",
      "PowerShell Get-PSDrive",
      "## Work Disk Contract",
      "## Practical Checklist",
      "VIBECODE_TEST_TEMP_DIR",
      "MUSU_TEST_TEMP_DIR",
      "https://musu.pro",
    ].join("\n\n"),
  },
};

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

async function writeArticle(dir, file, series, body, draft = false) {
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, file),
    `---\ntitle: "${file}"\npubDatetime: 2026-05-18T00:00:00Z\ndescription: "Fixture."\ndraft: ${draft ? "true" : "false"}\nseries: "${series}"\n---\n\n${body}\n`,
    "utf8",
  );
}

async function writeFixtureSet(dir, overrides = {}) {
  await mkdir(dir, { recursive: true });
  for (const [file, fixture] of Object.entries(fixtures)) {
    const override = overrides[file] ?? {};
    await writeArticle(
      dir,
      file,
      override.series ?? fixture.series,
      override.body ?? fixture.body,
      override.draft ?? false,
    );
  }
}

async function main() {
  const root = await makeTestTempDir("vibecode-operating-articles-");
  try {
    const passDir = join(root, "pass");
    const missingAnchorDir = join(root, "missing-anchor");
    const wrongSeriesDir = join(root, "wrong-series");
    const draftDir = join(root, "draft");

    await writeFixtureSet(passDir);
    await writeFixtureSet(missingAnchorDir, {
      "mcp-shared-state-data-leak.md": {
        body: fixtures["mcp-shared-state-data-leak.md"].body.replace("GHSA-345p-7cg4-v4c7", "missing advisory"),
      },
    });
    await writeFixtureSet(wrongSeriesDir, {
      "ai-agent-work-disk-contract.md": { series: "AI Explainer" },
    });
    await writeFixtureSet(draftDir, {
      "ai-memory-operating-structure.md": { draft: true },
    });

    requireOutput(run(passDir), "operating_articles_positive_self_test", 0, [
      "operating_articles_checked=3",
      "operating_articles_gate=pass",
    ]);
    requireOutput(run(missingAnchorDir), "operating_articles_missing_anchor_self_test", 1, [
      "mcp-shared-state-data-leak.md: missing required operating article pattern: GHSA-345p-7cg4-v4c7",
      "operating_articles_gate=fail",
    ]);
    requireOutput(run(wrongSeriesDir), "operating_articles_wrong_series_self_test", 1, [
      'ai-agent-work-disk-contract.md: expected series "AI Tool Note", got "AI Explainer"',
      "operating_articles_gate=fail",
    ]);
    requireOutput(run(draftDir), "operating_articles_draft_self_test", 1, [
      "ai-memory-operating-structure.md: article is draft",
      "operating_articles_gate=fail",
    ]);

    process.stdout.write("operating_articles_positive_self_test=pass\n");
    process.stdout.write("operating_articles_missing_anchor_self_test=pass\n");
    process.stdout.write("operating_articles_wrong_series_self_test=pass\n");
    process.stdout.write("operating_articles_draft_self_test=pass\n");
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

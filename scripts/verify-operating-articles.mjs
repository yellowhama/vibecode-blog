import { readFile } from "node:fs/promises";
import { join } from "node:path";

const BLOG_DIR = "src/data/blog";

const REQUIRED_ARTICLES = [
  {
    file: "ai-memory-operating-structure.md",
    series: "AI Explainer",
    requiredPatterns: [
      "AI가 기억을 잃지 않게 하는 운영 구조",
      "Conversation state",
      "Compaction",
      "MCP Resources",
      "Operating Memory Stack",
      "Audit Checklist",
      "source, spec, handoff, index",
      "https://musu.pro",
    ],
  },
  {
    file: "mcp-shared-state-data-leak.md",
    series: "AI Market Watch",
    requiredPatterns: [
      "MCP 서버는 stateless여도 shared state를 재사용하면 안 된다",
      "GHSA-345p-7cg4-v4c7",
      "@modelcontextprotocol/sdk",
      "Control Contract",
      "Operator Checklist",
      "Technical Verdict",
      "https://musu.pro",
    ],
  },
  {
    file: "ai-agent-work-disk-contract.md",
    series: "AI Tool Note",
    requiredPatterns: [
      "AI 에이전트 작업 폴더를 C와 F로 나누는 법",
      "Node.js os.tmpdir",
      "PowerShell Get-PSDrive",
      "Work Disk Contract",
      "Practical Checklist",
      "VIBECODE_TEST_TEMP_DIR",
      "MUSU_TEST_TEMP_DIR",
      "https://musu.pro",
    ],
  },
];

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

async function checkArticle(article) {
  const text = await readFile(join(BLOG_DIR, article.file), "utf8");
  const { frontmatter, body } = parseMarkdown(text);
  const combined = `${frontmatter}\n${body}`;
  const failures = [];

  if (isDraft(frontmatter)) failures.push("article is draft");

  const series = getFrontmatterValue(frontmatter, "series");
  if (series !== article.series) {
    failures.push(`expected series "${article.series}", got "${series || "missing"}"`);
  }

  for (const pattern of article.requiredPatterns) {
    if (!combined.includes(pattern)) {
      failures.push(`missing required operating article pattern: ${pattern}`);
    }
  }

  return { file: article.file, failures };
}

async function main() {
  const results = [];
  for (const article of REQUIRED_ARTICLES) {
    results.push(await checkArticle(article));
  }

  const failures = results.filter((result) => result.failures.length > 0);
  process.stdout.write(`operating_articles_checked=${results.length}\n`);
  process.stdout.write(`operating_articles_required=${REQUIRED_ARTICLES.map((article) => article.file).join(",")}\n`);

  if (failures.length > 0) {
    process.stderr.write("Operating articles gate failed.\n");
    for (const result of failures) {
      process.stderr.write(`- ${result.file}: ${result.failures.join("; ")}\n`);
    }
    process.stdout.write("operating_articles_gate=fail\n");
    return 1;
  }

  process.stdout.write("operating_articles_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

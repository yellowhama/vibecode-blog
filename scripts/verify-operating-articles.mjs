import { readFile } from "node:fs/promises";
import { join } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";

const REQUIRED_ARTICLES = [
  {
    file: "ai-memory-operating-structure.md",
    series: "AI Explainer",
    requiredPatterns: [
      "How to Stop AI Agents From Losing Their Memory",
      "Conversation state",
      "Compaction",
      "MCP Resources",
      "Operating Memory Stack",
      "Audit Checklist",
      "source, spec, handoff, index",
      "evidence gates before Field Logs",
    ],
  },
  {
    file: "mcp-shared-state-data-leak.md",
    series: "AI Market Watch",
    requiredPatterns: [
      "Stateless MCP Servers Can Still Leak Shared State",
      "GHSA-345p-7cg4-v4c7",
      "@modelcontextprotocol/sdk",
      "Control Contract",
      "Operator Checklist",
      "Technical Verdict",
      'should not trust "stateless" as a label',
    ],
  },
  {
    file: "ai-agent-work-disk-contract.md",
    series: "AI Tool Note",
    requiredPatterns: [
      "The Work Disk Contract for AI Coding Agents",
      "Node.js os.tmpdir",
      "PowerShell Get-PSDrive",
      "Work Disk Contract",
      "Practical Checklist",
      "VIBECODE_TEST_TEMP_DIR",
      "PROJECT_TEST_TEMP_DIR",
      "No boundary, no trust.",
    ],
  },
];

function parseArgs(argv) {
  const options = { blogDir: DEFAULT_BLOG_DIR };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--blog-dir") {
      options.blogDir = argv[index + 1];
      index += 1;
    }
  }
  return options;
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

async function checkArticle(blogDir, article) {
  const text = await readFile(join(blogDir, article.file), "utf8");
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
  const { blogDir } = parseArgs(process.argv.slice(2));
  const results = [];
  for (const article of REQUIRED_ARTICLES) {
    results.push(await checkArticle(blogDir, article));
  }

  const failures = results.filter((result) => result.failures.length > 0);
  process.stdout.write(`operating_articles_blog_dir=${blogDir}\n`);
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

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const BLOG_DIR = "src/data/blog";

const BANNED_WEAK_PHRASES = [
  "game changer",
  "revolutionary",
  "amazing",
  "insane",
  "beautiful",
  "powerful",
  "seamless",
  "robust",
  "world-class",
  "high-quality",
  "cutting-edge",
  "unlock",
  "leverage",
  "supercharge",
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

async function main() {
  const files = (await readdir(BLOG_DIR))
    .filter(file => file.endsWith(".md"))
    .sort();
  const failures = [];
  let checked = 0;

  for (const file of files) {
    const text = await readFile(join(BLOG_DIR, file), "utf8");
    const { frontmatter, body } = parseMarkdown(text);
    if (isDraft(frontmatter)) continue;

    const series = getFrontmatterValue(frontmatter, "series");
    const workflow = getFrontmatterValue(frontmatter, "workflow");
    const combined = `${frontmatter}\n${body}`;
    checked += 1;

    if (series !== "About" && workflow !== "packet") {
      failures.push(`${file}: non-About posts must use workflow: "packet"`);
    }

    for (const phrase of BANNED_WEAK_PHRASES) {
      const pattern = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(combined)) {
        failures.push(`${file}: weak or hype phrase is not allowed without a stronger evidence claim: "${phrase}"`);
      }
    }
  }

  process.stdout.write(`operator_writing_posts_checked=${checked}\n`);

  if (failures.length > 0) {
    process.stderr.write("Operator writing gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("operator_writing_gate=fail\n");
    return 1;
  }

  process.stdout.write("operator_writing_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

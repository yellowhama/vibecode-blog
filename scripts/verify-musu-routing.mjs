import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const BLOG_DIR = "src/data/blog";
const MUSU_MARKDOWN_LINK =
  /\[[^\]]+\]\((https:\/\/musu\.pro[^)]*|https:\/\/github\.com\/yellowhama[^)]*|https:\/\/raw\.githubusercontent\.com\/yellowhama[^)]*|\/install\.sh[^)]*)\)/g;

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

function countRoutes(text) {
  return [...text.matchAll(MUSU_MARKDOWN_LINK)].length;
}

async function main() {
  const files = (await readdir(BLOG_DIR))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const failures = [];
  const routeCounts = [];
  let checked = 0;

  for (const file of files) {
    const text = await readFile(join(BLOG_DIR, file), "utf8");
    const { frontmatter, body } = parseMarkdown(text);
    if (isDraft(frontmatter)) continue;

    const series = getFrontmatterValue(frontmatter, "series");
    const routes = countRoutes(body);
    routeCounts.push(`${file}=${routes}`);
    checked += 1;

    if (series !== "About" && routes === 0) {
      failures.push(`${file}: missing actual MUSU/proof route link`);
    }
    if (routes > 3) {
      failures.push(`${file}: has ${routes} MUSU/proof routes; keep routing natural and non-spammy`);
    }
  }

  process.stdout.write(`musu_routing_posts_checked=${checked}\n`);
  process.stdout.write(`musu_routing_routes=${routeCounts.join(" ")}\n`);

  if (failures.length > 0) {
    process.stderr.write("MUSU routing gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("musu_routing_gate=fail\n");
    return 1;
  }

  process.stdout.write("musu_routing_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

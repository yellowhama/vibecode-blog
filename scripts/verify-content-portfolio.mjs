import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const BLOG_DIR = "src/data/blog";
const ALLOWED_SERIES = new Set([
  "About",
  "Field Log",
  "AI Explainer",
  "AI Tool Note",
  "AI Market Watch",
]);
const TRAFFIC_SERIES = new Set(["AI Explainer", "AI Tool Note", "AI Market Watch"]);
const PROOF_SERIES = new Set(["Field Log"]);
const MAX_TRAFFIC_TO_PROOF_RATIO = 3;

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

function monthKey(dateText) {
  const match = dateText.match(/^(\d{4}-\d{2})-/);
  return match?.[1] ?? "unknown";
}

async function readPosts() {
  const files = (await readdir(BLOG_DIR))
    .filter((file) => file.endsWith(".md"))
    .sort();

  const posts = [];
  for (const file of files) {
    const text = await readFile(join(BLOG_DIR, file), "utf8");
    const { frontmatter } = parseMarkdown(text);
    if (isDraft(frontmatter)) continue;
    posts.push({
      file,
      title: getFrontmatterValue(frontmatter, "title"),
      date: getFrontmatterValue(frontmatter, "pubDatetime"),
      series: getFrontmatterValue(frontmatter, "series"),
    });
  }
  return posts;
}

function countBySeries(posts) {
  const counts = new Map();
  for (const post of posts) {
    counts.set(post.series, (counts.get(post.series) ?? 0) + 1);
  }
  return counts;
}

function summarizeCounts(counts) {
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([series, count]) => `${series}=${count}`)
    .join(" ");
}

async function main() {
  const posts = await readPosts();
  const failures = [];

  for (const post of posts) {
    if (!post.title) failures.push(`${post.file}: missing title`);
    if (!post.date) failures.push(`${post.file}: missing pubDatetime`);
    if (!post.series) failures.push(`${post.file}: missing series`);
    if (post.series && !ALLOWED_SERIES.has(post.series)) {
      failures.push(`${post.file}: unsupported series "${post.series}"`);
    }
  }

  const contentPosts = posts.filter((post) => post.series !== "About");
  const proofPosts = contentPosts.filter((post) => PROOF_SERIES.has(post.series));
  const unknownPosts = contentPosts.filter((post) => !PROOF_SERIES.has(post.series) && !TRAFFIC_SERIES.has(post.series));

  if (contentPosts.length > 0 && proofPosts.length === 0) {
    failures.push("no Field Log exists in the public content portfolio");
  }
  if (unknownPosts.length > 0) {
    failures.push(`unknown portfolio role for ${unknownPosts.map((post) => post.file).join(", ")}`);
  }

  const monthly = new Map();
  for (const post of contentPosts) {
    const key = monthKey(post.date);
    const bucket = monthly.get(key) ?? { traffic: 0, proof: 0 };
    if (TRAFFIC_SERIES.has(post.series)) bucket.traffic += 1;
    if (PROOF_SERIES.has(post.series)) bucket.proof += 1;
    monthly.set(key, bucket);
  }

  for (const [month, bucket] of monthly.entries()) {
    if (bucket.traffic > 0 && bucket.proof === 0) {
      failures.push(`${month}: traffic posts exist without a Field Log`);
      continue;
    }
    if (bucket.proof > 0 && bucket.traffic / bucket.proof > MAX_TRAFFIC_TO_PROOF_RATIO) {
      failures.push(`${month}: traffic-to-proof ratio ${bucket.traffic}:${bucket.proof} exceeds ${MAX_TRAFFIC_TO_PROOF_RATIO}:1`);
    }
  }

  const counts = countBySeries(posts);
  process.stdout.write(`content_portfolio_posts_checked=${posts.length}\n`);
  process.stdout.write(`content_portfolio_series=${summarizeCounts(counts)}\n`);
  for (const [month, bucket] of [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    process.stdout.write(`content_portfolio_month=${month} traffic=${bucket.traffic} proof=${bucket.proof}\n`);
  }

  if (failures.length > 0) {
    process.stderr.write("Content portfolio gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("content_portfolio_gate=fail\n");
    return 1;
  }

  process.stdout.write("content_portfolio_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

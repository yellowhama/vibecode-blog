import { access, readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const distDir = "dist";
const requiredFiles = [
  "index.html",
  "rss.xml",
  "robots.txt",
  "sitemap.xml",
  "install.sh",
  "api/posts.json",
  "pagefind/pagefind.js",
  "pagefind/pagefind-entry.json",
  "posts/vercel-is-not-a-deployment-contract/index.html",
];

const contentChecks = [
  ["index.html", "<html"],
  ["rss.xml", "<rss"],
  ["robots.txt", "Sitemap:"],
  ["sitemap.xml", "<sitemapindex"],
  ["install.sh", "raw.githubusercontent.com"],
];

const failures = [];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

for (const file of requiredFiles) {
  const path = join(distDir, file);
  if (!(await exists(path))) {
    failures.push(`Missing ${file}`);
  }
}

for (const [file, expected] of contentChecks) {
  const path = join(distDir, file);
  if (!(await exists(path))) {
    continue;
  }

  const text = await readFile(path, "utf8");
  if (!text.includes(expected)) {
    failures.push(`${file} does not include ${expected}`);
  }
}

const postsJsonPath = join(distDir, "api/posts.json");
if (await exists(postsJsonPath)) {
  try {
    const payload = JSON.parse(await readFile(postsJsonPath, "utf8"));
    if (!Array.isArray(payload.posts) || payload.posts.length === 0) {
      failures.push("api/posts.json has no posts array");
    }
  } catch (error) {
    failures.push(`api/posts.json is invalid JSON: ${error.message}`);
  }
}

const pagefindIndexDir = join(distDir, "pagefind", "index");
if (await exists(pagefindIndexDir)) {
  const indexFiles = await readdir(pagefindIndexDir);
  if (!indexFiles.some(file => file.endsWith(".pf_index"))) {
    failures.push("pagefind/index has no .pf_index files");
  }
} else {
  failures.push("Missing pagefind/index directory");
}

const pagefindDir = join(distDir, "pagefind");
if (await exists(pagefindDir)) {
  const info = await stat(pagefindDir);
  if (!info.isDirectory()) {
    failures.push("pagefind is not a directory");
  }
}

if (failures.length > 0) {
  process.stderr.write("Static artifact verification failed:\n");
  for (const failure of failures) {
    process.stderr.write(`- ${failure}\n`);
  }
  process.exit(1);
}

process.stdout.write("Static artifact verification passed.\n");

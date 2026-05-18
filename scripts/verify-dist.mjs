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
  ["install.sh", "vibecode.town install route is intentionally inert"],
];

const failures = [];
const HANGUL = /[\u3131-\u318e\uac00-\ud7a3]/;
const FORBIDDEN_PRODUCT_MENTIONS = [
  { label: "musu.pro", pattern: /musu\.pro/i },
  { label: "MUSU Pro", pattern: /\bMUSU\s+Pro\b/i },
  { label: "MUSU", pattern: /\bMUSU\b/ },
  { label: "musu-bee", pattern: /\bmusu-bee\b/i },
];

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
    } else {
      for (const post of payload.posts) {
        if (!post.ogImage || typeof post.ogImage !== "string" || !post.ogImage.startsWith("/images/")) {
          failures.push(`api/posts.json post "${post.slug ?? post.title ?? "unknown"}" is missing local ogImage`);
        }
      }
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

const postsDir = join(distDir, "posts");
if (await exists(postsDir)) {
  const entries = await readdir(postsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const postHtmlPath = join(postsDir, entry.name, "index.html");
    if (!(await exists(postHtmlPath))) continue;
    const text = await readFile(postHtmlPath, "utf8");
    if (HANGUL.test(text)) {
      failures.push(`posts/${entry.name}/index.html contains Hangul; public posts must be English`);
    }
    if (text.includes("public/images") || text.includes("../../../public/images")) {
      failures.push(`posts/${entry.name}/index.html contains source image path instead of public /images path`);
    }
    if (!/<img\b[^>]+src="\/images\//.test(text)) {
      failures.push(`posts/${entry.name}/index.html has no rendered /images/ asset`);
    }
  }
}

async function scanForbiddenText(root) {
  if (!(await exists(root))) return;
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      await scanForbiddenText(path);
      continue;
    }
    if (!/\.(?:css|excalidraw|html|json|js|svg|txt|xml)$/i.test(entry.name)) continue;
    const text = await readFile(path, "utf8");
    for (const forbidden of FORBIDDEN_PRODUCT_MENTIONS) {
      if (forbidden.pattern.test(text)) {
        failures.push(`${path} contains forbidden public product mention "${forbidden.label}"`);
      }
    }
  }
}

await scanForbiddenText(distDir);

if (failures.length > 0) {
  process.stderr.write("Static artifact verification failed:\n");
  for (const failure of failures) {
    process.stderr.write(`- ${failure}\n`);
  }
  process.exit(1);
}

process.stdout.write("Static artifact verification passed.\n");

import { access, readdir, readFile } from "node:fs/promises";
import { stat } from "node:fs/promises";
import { basename, join } from "node:path";

const SCAN_ROOTS = ["src/data/blog", "public"];
const TEXT_FILE_EXTENSIONS = new Set([
  ".astro",
  ".css",
  ".excalidraw",
  ".html",
  ".json",
  ".md",
  ".svg",
  ".sh",
  ".ts",
  ".txt",
]);

const FORBIDDEN_PRODUCT_MENTIONS = [
  { label: "musu.pro", pattern: /musu\.pro/i },
  { label: "MUSU Pro", pattern: /\bMUSU\s+Pro\b/i },
  { label: "MUSU", pattern: /\bMUSU\b/ },
  { label: "musu-bee", pattern: /\bmusu-bee\b/i },
];

const PUBLIC_IMAGE_PATH = /^\/images\/[^?#]+\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
const MIN_PUBLIC_IMAGE_BYTES = 12_000;

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

function publicPathToFile(path) {
  const cleanPath = path.split(/[?#]/)[0];
  if (!cleanPath.startsWith("/images/")) return "";
  return join("public", cleanPath.slice(1));
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function assertImageFile(file, imagePath, failures, owner) {
  if (!(await exists(file))) {
    failures.push(`${owner}: image file does not exist: ${imagePath}`);
    return;
  }
  const info = await stat(file);
  if (info.size < MIN_PUBLIC_IMAGE_BYTES) {
    failures.push(
      `${owner}: image asset is suspiciously small (${info.size} bytes): ${imagePath}`
    );
  }
}

async function collectFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(path));
      continue;
    }
    const extension = entry.name.includes(".")
      ? entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase()
      : "";
    if (TEXT_FILE_EXTENSIONS.has(extension)) {
      files.push(path);
    }
  }
  return files;
}

function findForbiddenMentions(file, text) {
  const failures = [];
  for (const forbidden of FORBIDDEN_PRODUCT_MENTIONS) {
    if (forbidden.pattern.test(text)) {
      failures.push(`${file}: public surface contains forbidden product mention "${forbidden.label}"`);
    }
  }
  return failures;
}

async function checkPublishedPost(file, text, imageOwners) {
  const { frontmatter, body } = parseMarkdown(text);
  if (isDraft(frontmatter)) return [];

  const failures = [];
  const slug = basename(file, ".md");
  const expectedImage = `/images/posts/${slug}.png`;
  const lang = getFrontmatterValue(frontmatter, "lang");
  const ogImage = getFrontmatterValue(frontmatter, "ogImage");
  const bodyImages = [...body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)]
    .map(match => match[1].trim());

  if (lang && lang.toLowerCase() !== "en") {
    failures.push(`${file}: published posts must use lang "en" when lang is set`);
  }
  if (!ogImage) {
    failures.push(`${file}: published post is missing ogImage`);
  } else if (!PUBLIC_IMAGE_PATH.test(ogImage)) {
    failures.push(`${file}: ogImage must be a local /images/... asset`);
  } else if (ogImage !== expectedImage) {
    failures.push(`${file}: ogImage must be the post-specific image ${expectedImage}, got ${ogImage}`);
  } else {
    await assertImageFile(publicPathToFile(ogImage), ogImage, failures, file);
  }

  if (ogImage) {
    const previousOwner = imageOwners.get(ogImage);
    if (previousOwner) {
      failures.push(`${file}: ogImage is reused by ${previousOwner}; every published post needs its own image`);
    } else {
      imageOwners.set(ogImage, file);
    }
  }

  if (bodyImages.length !== 1) {
    failures.push(`${file}: published posts must have exactly one in-body markdown image, got ${bodyImages.length}`);
  }
  if (bodyImages.length === 1 && bodyImages[0] !== ogImage) {
    failures.push(`${file}: in-body markdown image must match ogImage ${ogImage}, got ${bodyImages[0]}`);
  }
  for (const imagePath of bodyImages) {
    if (!PUBLIC_IMAGE_PATH.test(imagePath)) {
      failures.push(`${file}: markdown image must be a local /images/... asset: ${imagePath}`);
    } else {
      await assertImageFile(publicPathToFile(imagePath), imagePath, failures, file);
    }
  }

  return failures;
}

async function main() {
  const failures = [];
  let filesScanned = 0;
  let publishedPostsChecked = 0;
  const imageOwners = new Map();

  for (const root of SCAN_ROOTS) {
    const files = await collectFiles(root);
    for (const file of files) {
      const text = await readFile(file, "utf8");
      filesScanned += 1;
      failures.push(...findForbiddenMentions(file, text));
      if (file.startsWith("src\\data\\blog") || file.startsWith("src/data/blog")) {
        const { frontmatter } = parseMarkdown(text);
        if (!isDraft(frontmatter)) publishedPostsChecked += 1;
        failures.push(...await checkPublishedPost(file, text, imageOwners));
      }
    }
  }

  process.stdout.write(`public_surface_files_scanned=${filesScanned}\n`);
  process.stdout.write(`public_surface_published_posts_checked=${publishedPostsChecked}\n`);

  if (failures.length > 0) {
    process.stderr.write("Public surface gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("public_surface_gate=fail\n");
    return 1;
  }

  process.stdout.write("public_surface_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

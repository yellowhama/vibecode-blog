import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";

const BLOG_DIR = "src/data/blog";
const CONTRACT_PATH = "src/data/post-image-contracts.json";
const GENERATOR_PATH = "scripts/generate-post-images.ps1";
const WIDTH = 1200;
const HEIGHT = 630;
const MIN_BYTES = 12_000;

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

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function publicImagePathToFile(path) {
  const cleanPath = path.split(/[?#]/)[0];
  if (!cleanPath.startsWith("/images/")) return "";
  return join("public", cleanPath.slice(1));
}

async function readPublishedPosts() {
  const files = (await readdir(BLOG_DIR))
    .filter(file => file.endsWith(".md"))
    .sort();
  const posts = [];

  for (const file of files) {
    const text = await readFile(join(BLOG_DIR, file), "utf8");
    const { frontmatter, body } = parseMarkdown(text);
    if (isDraft(frontmatter)) continue;

    posts.push({
      file,
      slug: basename(file, ".md"),
      title: getFrontmatterValue(frontmatter, "title"),
      description: getFrontmatterValue(frontmatter, "description"),
      ogImage: getFrontmatterValue(frontmatter, "ogImage"),
      body,
      combined: `${frontmatter}\n${body}`,
      bodyImages: [...body.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)].map(match => match[1].trim()),
    });
  }

  return posts;
}

async function main() {
  const posts = await readPublishedPosts();
  const contracts = JSON.parse(await readFile(CONTRACT_PATH, "utf8"));
  const generator = await readFile(GENERATOR_PATH, "utf8");
  const failures = [];

  if (!generator.includes(CONTRACT_PATH.replace(/\//g, "\\")) && !generator.includes(CONTRACT_PATH)) {
    failures.push(`${GENERATOR_PATH}: image generator must read ${CONTRACT_PATH}`);
  }

  const bySlug = new Map();
  const imageOwners = new Map();
  for (const contract of contracts) {
    if (bySlug.has(contract.slug)) {
      failures.push(`${CONTRACT_PATH}: duplicate contract slug ${contract.slug}`);
    }
    bySlug.set(contract.slug, contract);

    if (imageOwners.has(contract.image)) {
      failures.push(`${CONTRACT_PATH}: image ${contract.image} is reused by ${imageOwners.get(contract.image)} and ${contract.slug}`);
    }
    imageOwners.set(contract.image, contract.slug);
  }

  for (const post of posts) {
    const contract = bySlug.get(post.slug);
    const normalizedPost = normalize(post.combined);
    if (!contract) {
      failures.push(`${post.file}: missing post image contract`);
      continue;
    }

    const requiredStrings = ["title", "subtitle", "signal", "accent", "motif", "rationale"];
    for (const key of requiredStrings) {
      if (typeof contract[key] !== "string" || contract[key].trim().length < 3) {
        failures.push(`${post.file}: image contract ${key} must be a meaningful string`);
      }
    }

    if (contract.image !== post.ogImage) {
      failures.push(`${post.file}: image contract path ${contract.image} must match ogImage ${post.ogImage}`);
    }
    if (post.bodyImages.length !== 1 || post.bodyImages[0] !== contract.image) {
      failures.push(`${post.file}: body image must match image contract ${contract.image}`);
    }
    if (!Array.isArray(contract.anchors) || contract.anchors.length < 3) {
      failures.push(`${post.file}: image contract must include at least three semantic anchors`);
    } else {
      for (const anchor of contract.anchors) {
        if (!normalizedPost.includes(normalize(anchor))) {
          failures.push(`${post.file}: image contract anchor is not present in the post text: ${anchor}`);
        }
      }
    }

    const imageFile = publicImagePathToFile(contract.image);
    if (!imageFile) {
      failures.push(`${post.file}: image contract must use /images/... path`);
      continue;
    }

    try {
      const info = await stat(imageFile);
      if (info.size < MIN_BYTES) {
        failures.push(`${post.file}: image ${contract.image} is suspiciously small (${info.size} bytes)`);
      }
      const metadata = await sharp(imageFile).metadata();
      if (metadata.width !== WIDTH || metadata.height !== HEIGHT) {
        failures.push(`${post.file}: image ${contract.image} must be ${WIDTH}x${HEIGHT}, got ${metadata.width}x${metadata.height}`);
      }
    } catch (error) {
      failures.push(`${post.file}: cannot inspect image ${contract.image}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  for (const contract of contracts) {
    if (!posts.some(post => post.slug === contract.slug)) {
      failures.push(`${CONTRACT_PATH}: contract has no published post: ${contract.slug}`);
    }
  }

  process.stdout.write(`post_image_contract_posts_checked=${posts.length}\n`);
  process.stdout.write(`post_image_contracts_checked=${contracts.length}\n`);

  if (failures.length > 0) {
    process.stderr.write("Post image contract gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("post_image_contract_gate=fail\n");
    return 1;
  }

  process.stdout.write("post_image_contract_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

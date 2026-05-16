import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const BLOG_DIR = "src/data/blog";

const CLAIM_REFERENCE_RULES = [
  {
    label: "GPT-5.5",
    claim: /\bGPT-5\.5\b/i,
    reference: /https:\/\/(?:openai\.com\/index\/introducing-gpt-5-5\/?|developers\.openai\.com\/api\/docs\/models\/gpt-5\.5)/i,
    message: "GPT-5.5 claims require an official OpenAI GPT-5.5 reference",
  },
  {
    label: "Claude Opus 4.7",
    claim: /\bClaude(?:\s+Opus)?\s+4\.7\b/i,
    reference: /https:\/\/www\.anthropic\.com\/news\/claude-opus-4-7/i,
    message: "Claude 4.7 claims require the official Anthropic Claude Opus 4.7 reference",
  },
  {
    label: "Gemini 3.1",
    claim: /\bGemini\s+3\.1\b/i,
    reference: /https:\/\/ai\.google\.dev\/gemini-api\/docs\/models/i,
    message: "Gemini 3.1 claims require the official Google Gemini models reference",
  },
];

const KNOWN_BAD_REFERENCE_URLS = new Set([
  "https://openai.com/research/gpt-5-5",
]);

function hasArg(name) {
  return process.argv.includes(name);
}

function parseMarkdown(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: text };
  return { frontmatter: match[1], body: match[2] };
}

function isDraft(frontmatter) {
  return /^draft:\s*true\s*$/m.test(frontmatter);
}

function extractReferenceUrls(frontmatter) {
  return [...frontmatter.matchAll(/^\s*url:\s*["']?([^"'\r\n]+)["']?\s*$/gm)]
    .map((match) => match[1].trim());
}

function extractAllUrls(text) {
  return [...text.matchAll(/https?:\/\/[^\s)"']+/g)].map((match) => match[0]);
}

function validateUrlSyntax(file, url, failures) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      failures.push(`${file}: unsupported reference URL protocol ${url}`);
    }
  } catch {
    failures.push(`${file}: invalid reference URL ${url}`);
  }
}

async function fetchStatusOnce(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
      });
    }

    return response.status;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchStatus(url) {
  try {
    return await fetchStatusOnce(url);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return await fetchStatusOnce(url);
    }
    throw error;
  }
}

async function main() {
  const checkHttp = hasArg("--check-http");
  const files = (await readdir(BLOG_DIR))
    .filter((file) => file.endsWith(".md"))
    .sort();

  const failures = [];
  let checked = 0;
  let referencesChecked = 0;
  let postsWithFrontmatterReferences = 0;
  const allReferenceUrls = new Set();

  for (const file of files) {
    const text = await readFile(join(BLOG_DIR, file), "utf8");
    const { frontmatter, body } = parseMarkdown(text);
    if (isDraft(frontmatter)) continue;

    checked += 1;
    const referenceUrls = extractReferenceUrls(frontmatter);
    const combined = `${frontmatter}\n${body}`;
    const urls = [...new Set([...referenceUrls, ...extractAllUrls(body)])];
    const isAbout = /^series:\s*["']?About["']?\s*$/m.test(frontmatter);

    if (referenceUrls.length > 0) {
      postsWithFrontmatterReferences += 1;
    } else if (!isAbout) {
      failures.push(`${file}: non-About public posts must include frontmatter references`);
    }

    for (const url of referenceUrls) {
      referencesChecked += 1;
      allReferenceUrls.add(url);
      validateUrlSyntax(file, url, failures);
      if (KNOWN_BAD_REFERENCE_URLS.has(url)) {
        failures.push(`${file}: known bad reference URL ${url}`);
      }
    }

    for (const rule of CLAIM_REFERENCE_RULES) {
      if (rule.claim.test(combined) && !urls.some((url) => rule.reference.test(url))) {
        failures.push(`${file}: ${rule.message}`);
      }
    }
  }

  if (checkHttp) {
    for (const url of [...allReferenceUrls].sort()) {
      try {
        const status = await fetchStatus(url);
        process.stdout.write(`source_reference_http_status=${status} url=${url}\n`);
        if (status >= 400) {
          failures.push(`HTTP ${status} for reference URL ${url}`);
        }
      } catch (error) {
        failures.push(`HTTP check failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  process.stdout.write(`source_reference_posts_checked=${checked}\n`);
  process.stdout.write(`source_reference_posts_with_frontmatter_references=${postsWithFrontmatterReferences}\n`);
  process.stdout.write(`source_reference_frontmatter_urls_checked=${referencesChecked}\n`);

  if (failures.length > 0) {
    process.stderr.write("Source reference gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("source_reference_gate=fail\n");
    return 1;
  }

  process.stdout.write("source_reference_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

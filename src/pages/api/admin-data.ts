import { readdir, readFile, stat } from "node:fs/promises";
import { join, basename } from "node:path";

const BLOG_DIR = "src/data/blog";
const DRAFTS_DIR = "drafts";
const REVIEWS_DIR = "reviews";
const DECISIONS_PATH = "src/data/draft-editorial-decisions.json";

function parseMarkdown(text: string) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: text };
  return { frontmatter: match[1], body: match[2] };
}

function getFrontmatterValue(frontmatter: string, name: string) {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
  if (!match) return "";
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function getWordCount(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/[#*_>`|~-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function parseSimpleYaml(yamlText: string) {
  const result: Record<string, any> = {};
  const lines = yamlText.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([a-zA-Z_0-9]+):\s*(.*)$/);
    if (match) {
      const key = match[1];
      let val = match[2].trim();
      if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      } else if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
  }
  return result;
}

async function fileExists(path: string) {
  try {
    const s = await stat(path);
    return s.isFile();
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    // 1. Load decisions
    let decisions: any[] = [];
    if (await fileExists(DECISIONS_PATH)) {
      const decisionsDoc = JSON.parse(await readFile(DECISIONS_PATH, "utf8"));
      decisions = decisionsDoc.decisions || [];
    }
    const decisionsBySlug = new Map(decisions.map(d => [d.slug, d]));

    const posts: any[] = [];

    // 2. Read Blog directory
    if (await fileExists(join(BLOG_DIR, "000-about.md"))) {
      const blogFiles = (await readdir(BLOG_DIR)).filter(f => f.endsWith(".md"));
      for (const file of blogFiles) {
        const filepath = join(BLOG_DIR, file);
        const fileStat = await stat(filepath);
        const text = await readFile(filepath, "utf8");
        const slug = basename(file, ".md");
        const { frontmatter, body } = parseMarkdown(text);

        const title = getFrontmatterValue(frontmatter, "title") || slug;
        const description = getFrontmatterValue(frontmatter, "description");
        const draftVal = getFrontmatterValue(frontmatter, "draft");
        const isDraft = draftVal === "true";
        const workflow = getFrontmatterValue(frontmatter, "workflow") || "legacy";
        const pubDate = getFrontmatterValue(frontmatter, "pubDatetime");

        // Try load critique
        let critique: any = null;
        const critiqueFilename = `critique_${slug}.yaml`;
        const critiquePath = join(REVIEWS_DIR, critiqueFilename);
        if (await fileExists(critiquePath)) {
          const critiqueYaml = await readFile(critiquePath, "utf8");
          critique = parseSimpleYaml(critiqueYaml);
        }

        posts.push({
          slug,
          title,
          description,
          draft: isDraft,
          location: "blog",
          filepath,
          modifiedAt: fileStat.mtime.toISOString(),
          pubDate,
          wordCount: getWordCount(body),
          workflow,
          critique,
          decision: decisionsBySlug.get(slug) || null,
        });
      }
    }

    // 3. Read Drafts directory
    try {
      const draftFiles = (await readdir(DRAFTS_DIR)).filter(f => f.endsWith(".md"));
      for (const file of draftFiles) {
        const filepath = join(DRAFTS_DIR, file);
        const fileStat = await stat(filepath);
        const text = await readFile(filepath, "utf8");
        const slug = basename(file, ".md");
        const { frontmatter, body } = parseMarkdown(text);

        const title = getFrontmatterValue(frontmatter, "title") || slug;
        const description = getFrontmatterValue(frontmatter, "description");
        const isDraft = true;
        const workflow = getFrontmatterValue(frontmatter, "workflow") || "legacy";

        // Try load critique
        let critique: any = null;
        const critiqueFilename = `critique_${slug}.yaml`;
        const critiquePath = join(REVIEWS_DIR, critiqueFilename);
        if (await fileExists(critiquePath)) {
          const critiqueYaml = await readFile(critiquePath, "utf8");
          critique = parseSimpleYaml(critiqueYaml);
        }

        posts.push({
          slug,
          title,
          description,
          draft: isDraft,
          location: "drafts",
          filepath,
          modifiedAt: fileStat.mtime.toISOString(),
          pubDate: null,
          wordCount: getWordCount(body),
          workflow,
          critique,
          decision: decisionsBySlug.get(slug) || null,
        });
      }
    } catch {
      // Ignored if drafts directory missing
    }

    // Calculate Summary Stats
    const totalPublished = posts.filter(p => !p.draft && p.location === "blog").length;
    const totalDrafts = posts.filter(p => p.draft && p.location === "blog").length;
    const totalWorkspaceDrafts = posts.filter(p => p.location === "drafts").length;
    
    let totalWords = 0;
    let critiquePass = 0;
    let critiqueFix = 0;
    let critiquePending = 0;

    for (const post of posts) {
      totalWords += post.wordCount;
      if (post.critique) {
        if (post.critique.verdict === "pass") {
          critiquePass++;
        } else {
          critiqueFix++;
        }
      } else if (post.draft) {
        critiquePending++;
      }
    }

    const summary = {
      totalPublished,
      totalDrafts,
      totalWorkspaceDrafts,
      averageWords: posts.length ? Math.round(totalWords / posts.length) : 0,
      critique: {
        pass: critiquePass,
        fixRequired: critiqueFix,
        pending: critiquePending,
      }
    };

    return new Response(JSON.stringify({ posts, summary }, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}

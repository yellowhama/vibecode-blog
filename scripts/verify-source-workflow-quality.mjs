import { access, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";
const DEFAULT_WIKI_ROOT =
  process.env.LLM_WIKI_ROOT ?? String.raw`F:\Aisaak\CompanyArtifacts\llm-wiki-completed`;

const PACKET_RULES = {
  "reader-pressure": {
    sections: [
      ["Reader Problem", "Reader"],
      ["Pressure", "What Breaks", "Reader Pressure Questions"],
      ["Reader Question", "Reader Pressure Questions"],
      ["Required Reader Decision", "Reader Decision", "Next Action", "Reader Pressure Questions"],
    ],
    patterns: [
      { pattern: /\?/m, message: "reader pressure must include an actual reader question" },
      { pattern: /\b(decision|required|before|must|choose|accept|reject)\b/i, message: "reader pressure must force a decision" },
    ],
  },
  "title-angle": {
    sections: [
      ["Title", "Working Title"],
      ["Angle", "Function", "Final Angle"],
      ["Avoid", "Rejected Angles"],
      ["Must Include", "Article Shape", "Final Angle"],
    ],
    patterns: [
      { pattern: /\bavoid\b/i, message: "title angle must name what not to write" },
      { pattern: /\bmust include\b/i, message: "title angle must name required ingredients" },
    ],
  },
  "evidence-bundle": {
    sections: [
      ["Public References", "Public Reference", "Primary Source", "Source Support"],
      ["Internal Evidence", "Internal Evidence Sources", "Verified Source Facts"],
      ["Non-Claims", "Boundary"],
    ],
    patterns: [
      { pattern: /https?:\/\//i, message: "evidence bundle must include at least one public source URL" },
      {
        pattern: /\b(script|verify|gate|commit|hash|approval|rendered|screenshot|audit|receipt|log|packet|file|path)\b/i,
        message: "evidence bundle must include inspectable internal evidence",
      },
      { pattern: /\b(do not|non-claims|boundary|claim)\b/i, message: "evidence bundle must bound what the post may not claim" },
    ],
  },
  brief: {
    sections: [
      ["Hook"],
      ["Core Point", "Technical Contract", "Reader"],
      ["Structure", "Article Shape"],
      ["Proof", "Evidence"],
      ["Tone", "Non-Claims", "Reader"],
    ],
    patterns: [
      { pattern: /\b(hook|problem|failure|risk|take)\b/i, message: "brief must pressure the opening" },
      { pattern: /\b(proof|evidence|reference|internal|gate|receipt)\b/i, message: "brief must name proof material" },
    ],
  },
  "gate-0": {
    sections: [["Required Checks"], ["Reject If"], ["Verdict"]],
    patterns: [
      { pattern: /\breject if\b/i, message: "gate-0 must include a rejection path" },
      { pattern: /\b(proceed|reject|block|only if)\b/i, message: "gate-0 verdict must be actionable" },
    ],
  },
  "draft-critique": {
    sections: [["Current Risk", "Risk"], ["Revision Pressure"], ["Quality Bar"]],
    patterns: [
      { pattern: /\brisk\b/i, message: "draft critique must name the current risk" },
      { pattern: /\b(quality bar|score|target|revision)\b/i, message: "draft critique must name the revision bar" },
    ],
  },
};

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
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

async function fileExists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function packetPath(wikiRoot, slug, suffix) {
  return join(wikiRoot, "companies", "vibecode-town", "plans", `${slug}-${suffix}.md`);
}

function hasSection(text, sectionOptions) {
  const options = Array.isArray(sectionOptions) ? sectionOptions : [sectionOptions];
  return options.some((section) => new RegExp(`^#{1,3}\\s+${escapeRegExp(section)}\\s*$`, "im").test(text));
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function validatePacket(slug, suffix, text) {
  const failures = [];
  const rule = PACKET_RULES[suffix];
  if (!rule) return failures;

  if (wordCount(text) < 35) {
    failures.push(`${slug}-${suffix}.md: packet is too thin to guide drafting`);
  }

  for (const sectionOptions of rule.sections) {
    if (!hasSection(text, sectionOptions)) {
      failures.push(`${slug}-${suffix}.md: missing section "${sectionOptions.join(" | ")}"`);
    }
  }

  for (const { pattern, message } of rule.patterns) {
    if (!pattern.test(text)) {
      failures.push(`${slug}-${suffix}.md: ${message}`);
    }
  }

  if (/\b(tbd|placeholder|fill this in|lorem ipsum)\b/i.test(text)) {
    failures.push(`${slug}-${suffix}.md: packet contains placeholder language`);
  }

  return failures;
}

async function publicPacketSlugs(blogDir) {
  const files = (await readdir(blogDir))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const slugs = [];

  for (const file of files) {
    const text = await readFile(join(blogDir, file), "utf8");
    const { frontmatter } = parseMarkdown(text);
    if (isDraft(frontmatter)) continue;
    if (getFrontmatterValue(frontmatter, "series") === "About") continue;
    if (getFrontmatterValue(frontmatter, "workflow") === "legacy") continue;
    slugs.push(file.replace(/\.md$/, ""));
  }

  return slugs;
}

async function main() {
  const blogDir = getArg("--blog-dir") ?? DEFAULT_BLOG_DIR;
  const wikiRoot = resolve(getArg("--wiki-root") ?? DEFAULT_WIKI_ROOT);
  const wikiRootExists = await fileExists(wikiRoot);
  const suffixes = Object.keys(PACKET_RULES);

  if (!wikiRootExists) {
    process.stdout.write("source_workflow_quality_gate=skip\n");
    process.stdout.write(`source_workflow_quality_skip_reason=llm_wiki_unreadable:${wikiRoot}\n`);
    return 0;
  }

  const failures = [];
  const slugs = await publicPacketSlugs(blogDir);
  let packetsChecked = 0;

  for (const slug of slugs) {
    for (const suffix of suffixes) {
      const path = packetPath(wikiRoot, slug, suffix);
      if (!(await fileExists(path))) {
        failures.push(`${slug}-${suffix}.md: packet file is missing`);
        continue;
      }
      const text = await readFile(path, "utf8");
      packetsChecked += 1;
      failures.push(...validatePacket(slug, suffix, text));
    }
  }

  process.stdout.write(`source_workflow_quality_blog_dir=${blogDir}\n`);
  process.stdout.write(`source_workflow_quality_wiki_root=${wikiRoot}\n`);
  process.stdout.write(`source_workflow_quality_posts_checked=${slugs.length}\n`);
  process.stdout.write(`source_workflow_quality_packets_checked=${packetsChecked}\n`);

  if (failures.length > 0) {
    process.stderr.write("Source workflow quality gate failed.\n");
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.stdout.write("source_workflow_quality_gate=fail\n");
    return 1;
  }

  process.stdout.write("source_workflow_quality_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

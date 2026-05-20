import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const DEFAULT_BLOG_DIR = "src/data/blog";
const CODE_FENCE = /```[\s\S]*?```/g;
const TABLE_ROW = /^\|.+\|$/gm;
const REQUIRED_SECTIONS = [
  "Opening Pressure",
  "Reader Problem",
  "Angle",
  "Reader Transfer",
  "Approval Candidate Verdict",
  "Draft Risk",
];

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

function isPacketDraft(frontmatter) {
  return /^draft:\s*true\s*$/m.test(frontmatter) && getFrontmatterValue(frontmatter, "workflow") === "packet";
}

function stripCode(markdown) {
  return markdown.replace(CODE_FENCE, " ");
}

function stripMarkdown(markdown) {
  return stripCode(markdown)
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, " ")
    .replace(/^#{1,6}\s+.+$/gm, " ")
    .replace(/[`*_>#|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function section(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = body.match(new RegExp(`(?:^|\\r?\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\r?\\n##\\s+|$)`, "i"));
  return match?.[1]?.trim() ?? "";
}

function headingExists(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^##\\s+${escaped}\\s*$`, "im").test(body);
}

function wordCount(markdown) {
  const clean = stripMarkdown(markdown);
  return clean ? clean.split(/\s+/).filter(Boolean).length : 0;
}

function countMatches(text, pattern) {
  return (text.match(pattern) ?? []).length;
}

function scoreDraft(file, text) {
  const failures = [];
  const { body } = parseMarkdown(text);
  const slug = basename(file, ".md");
  const opening = section(body, "Opening Pressure");
  const readerProblem = section(body, "Reader Problem");
  const angle = section(body, "Angle");
  const readerTransfer = section(body, "Reader Transfer");
  const bodyNoCode = stripCode(body);

  for (const required of REQUIRED_SECTIONS) {
    if (!headingExists(body, required)) {
      failures.push(`missing required cold-reader section: ${required}`);
    }
  }

  if (wordCount(body) < 1000) {
    failures.push(`draft is too thin for reference-blogger review (${wordCount(body)} words)`);
  }

  if (!CODE_FENCE.test(opening) && !/^>\s+.+$/m.test(opening)) {
    failures.push("Opening Pressure must show an inspectable quote, weak paragraph, log, or artifact");
  }
  if (!/\b(dangerous|risk|cost|trust|public|publish|reader|embarrassing|inadmissible|forgettable|decision)\b/i.test(opening)) {
    failures.push("Opening Pressure does not make the stakes felt for a cold reader");
  }
  if (!/\b(source|reader decision|artifact|reject|inspect|trace|claim)\b/i.test(opening)) {
    failures.push("Opening Pressure does not explain what is inspectably wrong");
  }

  if (!/Reader question:/i.test(readerProblem)) {
    failures.push("Reader Problem must include a literal Reader question line");
  }
  if (!/\bwhat should|before|decide|accept|reject|verify|do differently\b/i.test(readerProblem)) {
    failures.push("Reader Problem does not frame a reader decision");
  }

  if (!/\bnot\b|\binstead\b|\bneeds\b|\brequires\b|\bshould\b/i.test(angle)) {
    failures.push("Angle must state a sharp operating claim, not a topic label");
  }

  if (countMatches(readerTransfer, TABLE_ROW) < 4) {
    failures.push("Reader Transfer must include a real decision table with at least four rows");
  }
  if (!/\b(accept|reject|verify|use this|do this|before|run|ask|check)\b/i.test(readerTransfer)) {
    failures.push("Reader Transfer does not give reusable action language");
  }

  if (!/\b(before\/after|before and after|weak paragraph|rewritten version|earlier version|current opening|old|new)\b/i.test(body)) {
    failures.push("draft lacks a before/after revision trace");
  }
  if (countMatches(body, CODE_FENCE) < 4) {
    failures.push("draft needs at least four quoted artifacts, logs, forms, or snippets");
  }
  if (countMatches(bodyNoCode, /\b(reject|accept|verify|decision|trace|artifact|source|reader)\b/gi) < 18) {
    failures.push("draft does not repeat the reader-decision/evidence spine strongly enough outside examples");
  }
  if (!/\b(That is the point|The rule is|The harder rule|The useful part|The missing object|Speed is not the scarce resource)\b/.test(bodyNoCode)) {
    failures.push("draft lacks quotable judgment lines");
  }
  if (/\b(transforming .*content operations|faster than ever|maintaining a consistent brand voice|marketing funnel|unlock productivity|game[- ]changer)\b/i.test(bodyNoCode)) {
    failures.push("draft contains generic AI marketing language outside an explicit quoted failure");
  }

  return {
    slug,
    skipped: false,
    failures,
  };
}

async function main() {
  const blogDir = getArg("--blog-dir") ?? DEFAULT_BLOG_DIR;
  if (!existsSync(blogDir)) {
    throw new Error(`blog directory not found: ${blogDir}`);
  }

  const files = (await readdir(blogDir)).filter((file) => file.endsWith(".md")).sort();
  const results = [];
  const failures = [];

  for (const file of files) {
    const text = await readFile(join(blogDir, file), "utf8");
    const { frontmatter } = parseMarkdown(text);
    if (!isPacketDraft(frontmatter)) {
      results.push({ slug: basename(file, ".md"), skipped: true, failures: [] });
      continue;
    }

    const result = scoreDraft(file, text);
    results.push(result);
    for (const failure of result.failures) {
      failures.push(`${file}: ${failure}`);
    }
  }

  const checked = results.filter((result) => !result.skipped).length;
  const skipped = results.filter((result) => result.skipped).length;
  process.stdout.write(`reference_blogger_readiness_checked=${checked}\n`);
  process.stdout.write(`reference_blogger_readiness_skipped=${skipped}\n`);

  if (failures.length > 0) {
    process.stderr.write("Reference blogger readiness gate failed.\n");
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("reference_blogger_readiness_gate=fail\n");
    return 1;
  }

  process.stdout.write("reference_blogger_readiness_gate=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

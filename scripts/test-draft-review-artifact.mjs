import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const generator = "scripts/generate-draft-review-artifact.mjs";

function run(args) {
  return spawnSync(process.execPath, [resolve(generator), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function writeGenericFixture(root) {
  const blogDir = join(root, "blog");
  await mkdir(blogDir, { recursive: true });
  await writeFile(
    join(blogDir, "generic-source-draft.md"),
    `---\ntitle: "Generic Source Draft"\npubDatetime: 2026-05-20T00:00:00Z\ndescription: "A generic source-backed draft fixture."\ndraft: true\nworkflow: "packet"\n---\n\n# Generic Source Draft\n\n## Packet Receipt\n\n\`\`\`txt\npublication_state=draft_only\napproval_required=true\napproval_candidate=false\ncandidate_blockers=human_critique,rendered_candidate,hash_approval,image_contract\n\`\`\`\n\n## The Paragraph That Gets Past You\n\nThis opening shows a concrete weak paragraph before it explains the topic.\n\n\`\`\`txt\nWe installed seven useful tools. Now we have an operating system.\n\`\`\`\n\n## The Failure Is Not Style\n\nReader question: What should the reader accept, reject, or verify before using this draft?\n\n## The Harness Is the Point\n\nA source-backed article is only useful when the reader can inspect the source, decision, artifact, and boundary.\n\n## Source Thread\n\nThe source thread maps the draft to the tool evidence.\n\n\`\`\`txt\nskill: Research Scout\ngrounding_object: source URLs\nartifact: source-linked notes\n\`\`\`\n\n## The Pattern Worth Stealing\n\nThe useful pattern is a before/after trace.\n\n\`\`\`txt\nbefore:\nask for five ideas\n\nafter:\nask for five ideas with source URLs, rejected patterns, and reader decisions\n\`\`\`\n\n## The Table To Use Before You Prompt Again\n\n| If the draft does this | Accept only when | Reject when |\n| --- | --- | --- |\n| Claims a system | It shows the artifact | It only names tools |\n| Gives advice | It gives a decision | It cannot be reused |\n\n## Approval Candidate Verdict\n\nNot approved. The draft remains private.\n\n## Boundary\n\nThis fixture does not prove publication readiness.\n\n## Draft Risk\n\nThe fixture can still sound smoother than it is.\n`,
    "utf8",
  );
  return blogDir;
}

async function main() {
  const root = await makeTestTempDir("vibecode-draft-review-artifact-");
  try {
    const blogDir = await writeGenericFixture(root);
    const output = join(root, "generic-review-artifact.html");
    const result = run([
      "--slug",
      "generic-source-draft",
      "--blog-dir",
      blogDir,
      "--output",
      output,
    ]);
    if (result.status !== 0 || !result.stdout.includes("draft_review_artifact=")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected generic draft review artifact generation to pass");
    }
    const html = await readFile(output, "utf8");
    const required = [
      "Private Source Draft Review Artifact",
      "Opening Evidence",
      "Source Trace",
      "Before/After Trace",
      "Reader Transfer Table",
      "Approval Boundary",
      "Reviewer Decision",
    ];
    const missing = required.filter((item) => !html.includes(item));
    if (missing.length > 0) {
      throw new Error(`generic draft review artifact missing required text: ${missing.join(", ")}`);
    }
    process.stdout.write("draft_review_artifact_generic_source_self_test=pass\n");

    await writeFile(
      join(blogDir, "public-source-draft.md"),
      `---\ntitle: "Public Source Draft"\ndraft: false\nworkflow: "packet"\n---\n\n# Public Source Draft\n`,
      "utf8",
    );
    const rejected = run([
      "--slug",
      "public-source-draft",
      "--blog-dir",
      blogDir,
      "--output",
      join(root, "public-review-artifact.html"),
    ]);
    if (rejected.status === 0 || !rejected.stderr.includes("is not a private draft")) {
      process.stderr.write(rejected.stdout + rejected.stderr);
      throw new Error("expected non-private draft review artifact generation to fail");
    }
    process.stdout.write("draft_review_artifact_public_reject_self_test=pass\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

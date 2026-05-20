import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = "scripts/verify-draft-approval-candidates.mjs";

function run(args) {
  return spawnSync(process.execPath, [resolve(verifier), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

function longBody() {
  return Array.from(
    { length: 28 },
    (_, index) =>
      `This paragraph ${index + 1} keeps the fixture above the approval-candidate review floor with source evidence, draft risk, reader decision, rendered proof language, and concrete mechanism details for the writing harness.`,
  ).join("\n\n");
}

async function writeImage(slug) {
  await mkdir("public/images/posts", { recursive: true });
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: "#f8f1e7",
    },
  })
    .png()
    .toFile(`public/images/posts/${slug}.png`);
}

async function writeDraft(dir, slug, receiptExtra = "", extraBody = "") {
  await writeImage(slug);
  await writeFile(
    join(dir, `${slug}.md`),
    `---\ntitle: "Draft Candidate Fixture"\npubDatetime: 2026-05-20T00:00:00Z\ndescription: "Fixture."\ndraft: true\nworkflow: "packet"\nogImage: "/images/posts/${slug}.png"\nreferences:\n  - name: "Source"\n    url: "https://example.com/source"\n---\n\n# Draft Candidate Fixture\n\n## Packet Receipt\n\n\`\`\`txt\npublication_state=draft_only\napproval_required=true\n${receiptExtra}\n\`\`\`\n\n![Draft visual](/images/posts/${slug}.png)\n\n## Approval Candidate Verdict\n\nThis draft is not ready for publication until the missing candidate evidence exists.\n\n## Draft Risk\n\nThe draft can look finished before human critique, rendered candidate proof, and hash approval exist.\n\n${longBody()}\n\n${extraBody}\n`,
    "utf8",
  );
}

async function main() {
  const root = await makeTestTempDir("vibecode-draft-approval-candidates-");
  const generatedImages = [
    "public/images/posts/draft-review-system.png",
    "public/images/posts/bad-draft-review-system.png",
    "public/images/posts/approval-ready-draft.png",
  ];
  try {
    const blogDir = join(root, "blog");
    await mkdir(blogDir, { recursive: true });

    await writeDraft(
      blogDir,
      "draft-review-system",
      "approval_candidate=false\ncandidate_blockers=human_critique,rendered_candidate,hash_approval",
    );
    let result = run(["--blog-dir", blogDir]);
    if (result.status !== 0 || !result.stdout.includes("draft_approval_candidate_gate=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected complete draft approval candidate fixture to pass");
    }
    process.stdout.write("draft_approval_candidate_positive_self_test=pass\n");

    await writeDraft(blogDir, "bad-draft-review-system", "approval_candidate=false\ncandidate_blockers=human_critique");
    result = run(["--blog-dir", blogDir]);
    if (result.status === 0 || !result.stderr.includes("rendered_candidate")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected incomplete blocker list to fail");
    }
    process.stdout.write("draft_approval_candidate_missing_blockers_self_test=pass\n");

    const trueDir = join(root, "true-blog");
    await mkdir(trueDir, { recursive: true });
    await writeDraft(trueDir, "approval-ready-draft", "approval_candidate=true", "## Publication Evidence\n\nrendered_page_gate=pass\ncontentSha256=0123456789abcdef\n");
    result = run(["--blog-dir", trueDir]);
    if (result.status !== 0) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected approval_candidate=true fixture with publication evidence to pass");
    }
    process.stdout.write("draft_approval_candidate_true_self_test=pass\n");
  } finally {
    await rm(root, { recursive: true, force: true });
    for (const image of generatedImages) {
      await rm(image, { force: true });
    }
  }
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

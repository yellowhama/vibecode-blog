import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const generator = "scripts/generate-human-promotion-review-packet.mjs";

function run(args) {
  return spawnSync(process.execPath, [resolve(generator), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function writeFixture(root, bodyExtra = "") {
  const blogDir = join(root, "blog");
  const decisionsPath = join(root, "draft-decisions.json");
  const reviewSummaryPath = join(root, "review-summary.json");
  await mkdir(blogDir, { recursive: true });
  await writeFile(
    join(blogDir, "review-packet-fixture.md"),
    `---\ntitle: "Review Packet Fixture"\npubDatetime: 2026-05-20T00:00:00Z\ndescription: "Fixture."\ndraft: true\nworkflow: "packet"\n---\n\n# Review Packet Fixture\n\n## Packet Receipt\n\n\`\`\`txt\npublication_state=draft_only\napproval_required=true\napproval_candidate=false\neditorial_decision=keep_internal_example\neditorial_decision_ref=fixture-decisions.json#review-packet-fixture\ncandidate_blockers=human_critique,rendered_candidate,hash_approval,image_contract\n\`\`\`\n\n## Opening Pressure\n\nThis opening asks the reviewer to inspect a failed paragraph before approving the draft.\n\n\`\`\`txt\nAI agents are transforming content operations by enabling teams to create high-quality articles faster than ever before.\n\`\`\`\n\n## Reader Transfer\n\nThe reader can reuse the review form on a real draft.\n\n## Editorial Critique Result\n\nThe draft remains private until a human reviewer accepts the evidence.\n\n## What Changes In The Next Draft Review\n\nThe review desk asks for fields, not taste.\n\n\`\`\`txt\nsource_changed_claim=which source forced this sentence to exist?\nreader_decision=what can the reader now accept, reject, or verify?\nproof_artifact=what file, log, screenshot, diff, or table proves the mechanism?\nreject_condition=what would make us refuse this paragraph?\nrewrite_order=claim -> evidence -> consequence -> reader action\n\`\`\`\n\n## Draft Risk\n\nThe draft can still sound finished before a human review exists.\n\n${bodyExtra}\n`,
    "utf8",
  );
  await writeFile(
    decisionsPath,
    `${JSON.stringify(
      {
        policy: { requiredForPacketDrafts: true },
        decisions: [
          {
            slug: "review-packet-fixture",
            decision: "keep_internal_example",
            approvalCandidate: false,
            reviewerType: "editorial-system",
            decidedAt: "2026-05-20T00:00:00.000Z",
            rationale:
              "The fixture remains private because a human reviewer has not yet accepted the opening, transfer, artifact, and remaining risk.",
            candidateBlockers: ["human_critique", "rendered_candidate", "hash_approval", "image_contract"],
            requiredNextActions: ["Run human promotion review.", "Capture rendered candidate proof."],
            evidence: ["review-packet-fixture.md", "review-summary.json"],
          },
        ],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await writeFile(
    reviewSummaryPath,
    `${JSON.stringify(
      {
        artifact: join(root, "artifact.html"),
        screenshot: join(root, "artifact.png"),
        title: "Review Packet Fixture - Draft Review Artifact",
        requiredTextMatches: 9,
        requiredTextTotal: 9,
        requiredMissing: [],
        bodyTextLength: 1800,
        scrollHeight: 2400,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return { blogDir, decisionsPath, reviewSummaryPath };
}

async function main() {
  const root = await makeTestTempDir("vibecode-human-promotion-review-");
  try {
    const { blogDir, decisionsPath, reviewSummaryPath } = await writeFixture(root);
    const output = join(root, "human-review.html");
    const summary = join(root, "human-review-summary.json");
    let result = run([
      "--slug",
      "review-packet-fixture",
      "--blog-dir",
      blogDir,
      "--decisions",
      decisionsPath,
      "--review-summary",
      reviewSummaryPath,
      "--output",
      output,
      "--summary",
      summary,
    ]);
    if (result.status !== 0 || !result.stdout.includes("human_promotion_review_packet=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected human promotion review packet generation to pass");
    }
    process.stdout.write("human_promotion_review_packet_generation_self_test=pass\n");

    result = run([
      "--check",
      "--slug",
      "review-packet-fixture",
      "--blog-dir",
      blogDir,
      "--decisions",
      decisionsPath,
      "--review-summary",
      reviewSummaryPath,
      "--output",
      output,
      "--summary",
      summary,
    ]);
    if (result.status !== 0 || !result.stdout.includes("human_promotion_review_packet=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected fresh human promotion review packet check to pass");
    }
    process.stdout.write("human_promotion_review_packet_check_self_test=pass\n");

    await writeFixture(root, "This added sentence changes the fixture hash after the packet was generated.");
    result = run([
      "--check",
      "--slug",
      "review-packet-fixture",
      "--blog-dir",
      blogDir,
      "--decisions",
      decisionsPath,
      "--review-summary",
      reviewSummaryPath,
      "--output",
      output,
      "--summary",
      summary,
    ]);
    if (result.status === 0 || !result.stderr.includes("stale")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected stale human promotion review packet check to fail");
    }
    process.stdout.write("human_promotion_review_packet_stale_self_test=pass\n");
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

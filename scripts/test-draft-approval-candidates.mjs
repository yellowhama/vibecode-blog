import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
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

async function writeDecisions(path, decisions) {
  await writeFile(
    path,
    `${JSON.stringify({ policy: { requiredForPacketDrafts: true }, decisions }, null, 2)}\n`,
    "utf8",
  );
}

async function sha256(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function writeEvidence(root, name) {
  const evidenceDir = join(root, "evidence");
  await mkdir(evidenceDir, { recursive: true });
  const critiquePath = join(evidenceDir, `${name}-critique.md`);
  const screenshotPath = join(evidenceDir, `${name}-screenshot.png`);
  const summaryPath = join(evidenceDir, `${name}-summary.json`);
  await writeFile(
    critiquePath,
    "The rendered draft opened from internal process, lacked a real-time rejection scene, and underused the source comparison.\n",
    "utf8",
  );
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: "#e9edf3",
    },
  })
    .png()
    .toFile(screenshotPath);
  await writeFile(summaryPath, `${JSON.stringify({ requiredTextMatches: 6, rendered: true }, null, 2)}\n`, "utf8");
  return {
    status: "present",
    kind: "rendered_artifact_editorial_critique",
    failedDraftCommit: "0f07239",
    repairedDraftCommit: "5235746",
    critiquePath,
    renderedScreenshotPath: screenshotPath,
    renderedSummaryPath: summaryPath,
    critiqueSha256: await sha256(critiquePath),
    renderedScreenshotSha256: await sha256(screenshotPath),
    renderedSummarySha256: await sha256(summaryPath),
    failureSignals: ["opening too internal", "no real-time rejection scene"],
    repairSignals: ["bad-draft opening added", "review rejection moment added"],
  };
}

async function main() {
  const root = await makeTestTempDir("vibecode-draft-approval-candidates-");
  const generatedImages = [
    "public/images/posts/draft-review-system.png",
    "public/images/posts/bad-draft-review-system.png",
    "public/images/posts/evidence-backed-draft.png",
    "public/images/posts/missing-evidence-draft.png",
    "public/images/posts/approval-ready-draft.png",
  ];
  try {
    const blogDir = join(root, "blog");
    await mkdir(blogDir, { recursive: true });

    await writeDraft(
      blogDir,
      "draft-review-system",
      "approval_candidate=false\neditorial_decision=keep_internal_example\neditorial_decision_ref=fixture-decisions.json#draft-review-system\ncandidate_blockers=human_critique,real_failed_draft_evidence,rendered_candidate,hash_approval",
    );
    const decisionsPath = join(root, "draft-decisions.json");
    await writeDecisions(decisionsPath, [
      {
        slug: "draft-review-system",
        decision: "keep_internal_example",
        approvalCandidate: false,
        reviewerType: "editorial-system",
        decidedAt: "2026-05-20T00:00:00.000Z",
        rationale: "The fixture remains an internal example until human critique, real failed draft evidence, rendered candidate proof, and hash approval exist.",
        candidateBlockers: ["human_critique", "real_failed_draft_evidence", "rendered_candidate", "hash_approval"],
        requiredNextActions: ["Run human critique.", "Capture rendered candidate proof."],
        evidence: ["fixture-draft.md", "fixture-critique.md"],
      },
    ]);
    let result = run(["--blog-dir", blogDir, "--decisions", decisionsPath]);
    if (result.status !== 0 || !result.stdout.includes("draft_approval_candidate_gate=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected complete draft approval candidate fixture to pass");
    }
    process.stdout.write("draft_approval_candidate_positive_self_test=pass\n");

    await writeDraft(blogDir, "bad-draft-review-system", "approval_candidate=false\neditorial_decision=keep_internal_example\neditorial_decision_ref=fixture-decisions.json#bad-draft-review-system\ncandidate_blockers=human_critique");
    await writeDecisions(decisionsPath, [
      {
        slug: "draft-review-system",
        decision: "keep_internal_example",
        approvalCandidate: false,
        reviewerType: "editorial-system",
        decidedAt: "2026-05-20T00:00:00.000Z",
        rationale: "The fixture remains an internal example until human critique, rendered candidate proof, and hash approval exist.",
        candidateBlockers: ["human_critique", "rendered_candidate", "hash_approval"],
        requiredNextActions: ["Run human critique.", "Capture rendered candidate proof."],
        evidence: ["fixture-draft.md", "fixture-critique.md"],
      },
      {
        slug: "bad-draft-review-system",
        decision: "keep_internal_example",
        approvalCandidate: false,
        reviewerType: "editorial-system",
        decidedAt: "2026-05-20T00:00:00.000Z",
        rationale: "The bad fixture intentionally omits blockers in the body so the verifier can reject it.",
        candidateBlockers: ["human_critique"],
        requiredNextActions: ["Run human critique.", "Capture rendered candidate proof."],
        evidence: ["fixture-draft.md", "fixture-critique.md"],
      },
    ]);
    result = run(["--blog-dir", blogDir, "--decisions", decisionsPath]);
    if (result.status === 0 || !result.stderr.includes("rendered_candidate")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected incomplete blocker list to fail");
    }
    process.stdout.write("draft_approval_candidate_missing_blockers_self_test=pass\n");

    const evidenceDir = join(root, "evidence-blog");
    await mkdir(evidenceDir, { recursive: true });
    await writeDraft(
      evidenceDir,
      "evidence-backed-draft",
      "approval_candidate=false\neditorial_decision=keep_internal_example\neditorial_decision_ref=fixture-decisions.json#evidence-backed-draft\ncandidate_blockers=human_critique,rendered_candidate,hash_approval",
    );
    const evidenceDecisionPath = join(root, "evidence-draft-decisions.json");
    const realEvidence = await writeEvidence(root, "evidence-backed-draft");
    await writeDecisions(evidenceDecisionPath, [
      {
        slug: "evidence-backed-draft",
        decision: "keep_internal_example",
        approvalCandidate: false,
        reviewerType: "editorial-system",
        decidedAt: "2026-05-20T00:00:00.000Z",
        rationale: "The fixture has real failed draft evidence, but it remains internal until human critique, rendered candidate proof, and hash approval exist.",
        candidateBlockers: ["human_critique", "rendered_candidate", "hash_approval"],
        realFailedDraftEvidence: realEvidence,
        requiredNextActions: ["Run human critique.", "Capture rendered candidate proof."],
        evidence: ["fixture-draft.md", realEvidence.critiquePath],
      },
    ]);
    result = run(["--blog-dir", evidenceDir, "--decisions", evidenceDecisionPath]);
    if (result.status !== 0 || !result.stdout.includes("draft_approval_candidate_gate=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected evidence-backed internal draft fixture to pass without real_failed_draft_evidence blocker");
    }
    process.stdout.write("draft_approval_candidate_real_evidence_self_test=pass\n");

    const missingEvidenceDir = join(root, "missing-evidence-blog");
    await mkdir(missingEvidenceDir, { recursive: true });
    await writeDraft(
      missingEvidenceDir,
      "missing-evidence-draft",
      "approval_candidate=false\neditorial_decision=keep_internal_example\neditorial_decision_ref=fixture-decisions.json#missing-evidence-draft\ncandidate_blockers=human_critique,rendered_candidate,hash_approval",
    );
    const missingEvidenceDecisionPath = join(root, "missing-evidence-draft-decisions.json");
    await writeDecisions(missingEvidenceDecisionPath, [
      {
        slug: "missing-evidence-draft",
        decision: "keep_internal_example",
        approvalCandidate: false,
        reviewerType: "editorial-system",
        decidedAt: "2026-05-20T00:00:00.000Z",
        rationale: "The bad fixture clears the real failed draft blocker without providing evidence so the verifier can reject it.",
        candidateBlockers: ["human_critique", "rendered_candidate", "hash_approval"],
        requiredNextActions: ["Run human critique.", "Capture rendered candidate proof."],
        evidence: ["fixture-draft.md", "fixture-critique.md"],
      },
    ]);
    result = run(["--blog-dir", missingEvidenceDir, "--decisions", missingEvidenceDecisionPath]);
    if (result.status === 0 || !result.stderr.includes("realFailedDraftEvidence.status=present")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected missing real failed draft evidence to fail");
    }
    process.stdout.write("draft_approval_candidate_missing_real_evidence_self_test=pass\n");

    const trueDir = join(root, "true-blog");
    await mkdir(trueDir, { recursive: true });
    await writeDraft(trueDir, "approval-ready-draft", "approval_candidate=true\neditorial_decision=promote_to_approval_candidate\neditorial_decision_ref=fixture-decisions.json#approval-ready-draft", "## Publication Evidence\n\nrendered_page_gate=pass\ncontentSha256=0123456789abcdef\n");
    const trueDecisionsPath = join(root, "true-draft-decisions.json");
    const approvalEvidence = await writeEvidence(root, "approval-ready-draft");
    await writeDecisions(trueDecisionsPath, [
      {
        slug: "approval-ready-draft",
        decision: "promote_to_approval_candidate",
        approvalCandidate: true,
        reviewerType: "human",
        decidedAt: "2026-05-20T00:00:00.000Z",
        rationale: "A human reviewer has marked this fixture as ready for approval-candidate handling after rendered and hash evidence exists.",
        candidateBlockers: [],
        realFailedDraftEvidence: approvalEvidence,
        requiredNextActions: ["Create approval record.", "Run final rendered audit."],
        evidence: ["rendered-page-gate.log", approvalEvidence.critiquePath],
      },
    ]);
    result = run(["--blog-dir", trueDir, "--decisions", trueDecisionsPath]);
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

import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = resolve("scripts/verify-article-production-harness.mjs");

const roleIds = [
  "source-scout",
  "packet-builder",
  "angle-strategist",
  "evidence-designer",
  "draft-writer",
  "reference-critic",
  "public-surface-editor",
  "rendered-qa",
  "publisher",
];

const roleTitles = {
  "source-scout": "Source Scout",
  "packet-builder": "Packet Builder",
  "angle-strategist": "Angle Strategist",
  "evidence-designer": "Evidence Designer",
  "draft-writer": "Draft Writer",
  "reference-critic": "Reference Critic",
  "public-surface-editor": "Public Surface Editor",
  "rendered-qa": "Rendered QA",
  publisher: "Publisher",
};

function run(args) {
  return spawnSync(process.execPath, [verifier, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function requireRun(label, result, expectedStatus, expectedText) {
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status !== expectedStatus) {
    throw new Error(`${label}: expected exit ${expectedStatus}, got ${result.status}\n${output}`);
  }
  for (const text of expectedText) {
    if (!output.includes(text)) throw new Error(`${label}: missing output ${text}\n${output}`);
  }
}

function makeRole(id) {
  const title = roleTitles[id];
  return {
    id,
    title,
    purpose: `${title} owns its narrow article-production responsibility.`,
    owns: [`${id} owned artifact`],
    inputs: [`${id} input`],
    outputs: [`${id} output`],
    hardStops:
      id === "draft-writer"
        ? [
            "Writer cannot approve its own work.",
            "Generated drafts stay draft: true until promotion.",
            "Do not write packet, queue, approval, score, or hash language into the reader-facing article body.",
          ]
        : [`${title} stops when its required evidence is missing.`],
    skills: [`${id} skill`],
    verification: {
      command: "npm run verify:content",
      evidence: `${id} evidence`,
    },
    boundary: {
      public: `${title} public boundary.`,
      private: `${title} private boundary.`,
    },
  };
}

function validManifest(repoRoot) {
  return {
    schema: "vibecode-article-production-harness/v1",
    updatedAt: "2026-05-22T00:00:00+09:00",
    sourceReferences: [
      {
        name: "Revfactory Harness function extract",
        path: "companies/vibecode-town/sources/processed/revfactory-harness-function-extract.md",
        role: "team architecture reference",
      },
      {
        name: "Revfactory Unreal Idol function extract",
        path: "companies/vibecode-town/sources/processed/revfactory-unreal-idol-function-extract.md",
        role: "applied artifact-map reference",
      },
    ],
    architecture: {
      allowedPatterns: [
        "pipeline",
        "fan-out/fan-in",
        "expert-pool",
        "producer-reviewer",
        "supervisor",
        "hierarchical-delegation",
      ],
      defaultArticleLoop: [
        { stage: "source-intake", pattern: "fan-out/fan-in", roles: ["source-scout", "packet-builder"] },
        { stage: "packet-angle", pattern: "pipeline", roles: ["packet-builder", "angle-strategist"] },
        { stage: "draft-repair", pattern: "producer-reviewer", roles: ["draft-writer", "reference-critic"] },
        { stage: "public-surface", pattern: "producer-reviewer", roles: ["public-surface-editor", "rendered-qa"] },
        { stage: "publication", pattern: "pipeline", roles: ["publisher"] },
      ],
    },
    voiceContract: {
      reference: "revfactory/unreal-idol V3 persona architecture",
      articleVoice: {
        role: "field-note essayist",
        mustDo: ["Start from a concrete failure."],
        mustNotDo: ["Do not narrate packet receipts, queue state, approval state, or hash language as public prose."],
      },
      roleVoiceBoundaries: [
        {
          role: "draft-writer",
          voice: "reader-facing argument only",
          forbiddenSections: ["packet receipt", "publisher queue", "approval candidate verdict"],
        },
        {
          role: "reference-critic",
          voice: "private reject/accept scorecard",
          forbiddenSections: ["reader-facing essay body"],
        },
        {
          role: "publisher",
          voice: "private queue and approval control",
          forbiddenSections: ["reader-facing essay body", "homepage copy"],
        },
      ],
      appendixRule: "Private packet, queue, approval, and hash material stays after the reader-facing article body.",
    },
    pipelineOrder: roleIds,
    roles: roleIds.map(makeRole),
    trackedArticles: [
      {
        slug: "sample-draft",
        sourceWorkflowSlug: "sample-draft",
        draftPath: "src/data/blog/sample-draft.md",
        decisionRef: "src/data/draft-editorial-decisions.json#sample-draft",
        currentGate: "human-promotion-review",
        publicPromotionAllowed: false,
        nextRole: "reference-critic",
        lifecycleRoleOrder: roleIds,
        requiredArtifacts: [
          { kind: "draft", path: "src/data/blog/sample-draft.md", required: true },
          { kind: "decision", path: "src/data/draft-editorial-decisions.json", required: true },
          { kind: "external-proof", path: join(repoRoot, "proof.json"), required: true },
        ],
      },
    ],
  };
}

async function writeFixture(root, manifest) {
  const blogDir = join(root, "src", "data", "blog");
  const dataDir = join(root, "src", "data");
  const wikiRoot = join(root, "wiki");
  await mkdir(blogDir, { recursive: true });
  await mkdir(dataDir, { recursive: true });
  await mkdir(join(wikiRoot, "companies", "global"), { recursive: true });
  await mkdir(join(wikiRoot, "companies", "vibecode-town"), { recursive: true });

  await writeFile(
    join(blogDir, "sample-draft.md"),
    `---\ntitle: Sample Draft\ndraft: true\nworkflow: "packet"\n---\n\n# Sample Draft\n`,
    "utf8",
  );
  await writeFile(
    join(dataDir, "draft-editorial-decisions.json"),
    `${JSON.stringify(
      {
        decisions: [
          {
            slug: "sample-draft",
            decision: "keep_internal_example",
            approvalCandidate: false,
            candidateBlockers: ["human_critique"],
          },
        ],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await writeFile(join(dataDir, "publication-approvals.json"), `${JSON.stringify({ approvals: [] }, null, 2)}\n`, "utf8");
  await writeFile(join(root, "proof.json"), "{}\n", "utf8");
  await writeFile(join(dataDir, "article-production-harness.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const roleText = roleTitlesText();
  await writeFile(join(wikiRoot, "companies", "global", "company-agent-registry.md"), roleText, "utf8");
  await writeFile(join(wikiRoot, "companies", "vibecode-town", "content-cell-operating-model.md"), roleText, "utf8");
  await writeFile(join(wikiRoot, "companies", "vibecode-town", "article-production-harness.md"), roleText, "utf8");
  await writeFile(join(wikiRoot, "companies", "vibecode-town", "article-production-artifact-map.md"), roleText, "utf8");
  await writeFile(join(wikiRoot, "companies", "vibecode-town", "harness-architecture-patterns.md"), roleText, "utf8");

  return { wikiRoot };
}

function roleTitlesText(extra = "") {
  return `${Object.values(roleTitles).join("\n")}\nPublic surface cards use source/artifact/decision language.\n${extra}\n`;
}

try {
  const root = await makeTestTempDir("vibecode-article-production-harness-");
  try {
    const manifest = validManifest(root);
    const { wikiRoot } = await writeFixture(root, manifest);
    requireRun(
      "positive harness",
      run([
        "--repo-root",
        root,
        "--wiki-root",
        wikiRoot,
        "--decisions-ref",
        "src/data/draft-editorial-decisions.json",
      ]),
      0,
      ["article_production_harness_gate=pass"],
    );

    const missingVoiceContract = structuredClone(manifest);
    delete missingVoiceContract.voiceContract;
    await writeFile(
      join(root, "src", "data", "article-production-harness.json"),
      `${JSON.stringify(missingVoiceContract, null, 2)}\n`,
      "utf8",
    );
    requireRun(
      "missing voice contract",
      run(["--repo-root", root, "--wiki-root", wikiRoot, "--decisions-ref", "src/data/draft-editorial-decisions.json"]),
      1,
      ["voiceContract is required"],
    );

    const missingRole = structuredClone(manifest);
    missingRole.roles = missingRole.roles.filter((role) => role.id !== "rendered-qa");
    await writeFile(
      join(root, "src", "data", "article-production-harness.json"),
      `${JSON.stringify(missingRole, null, 2)}\n`,
      "utf8",
    );
    requireRun(
      "missing role",
      run(["--repo-root", root, "--wiki-root", wikiRoot, "--decisions-ref", "src/data/draft-editorial-decisions.json"]),
      1,
      ["missing required role rendered-qa"],
    );

    const collapsed = structuredClone(manifest);
    collapsed.roles.find((role) => role.id === "draft-writer").purpose = "Write, critique, and approve publication.";
    await writeFile(
      join(root, "src", "data", "article-production-harness.json"),
      `${JSON.stringify(collapsed, null, 2)}\n`,
      "utf8",
    );
    requireRun(
      "collapsed writer",
      run(["--repo-root", root, "--wiki-root", wikiRoot, "--decisions-ref", "src/data/draft-editorial-decisions.json"]),
      1,
      ["draft-writer scope is collapsed"],
    );

    await writeFile(
      join(root, "src", "data", "article-production-harness.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      join(wikiRoot, "companies", "vibecode-town", "content-cell-operating-model.md"),
      roleTitlesText("homepage must show writing-pulse score and hash approval text"),
      "utf8",
    );
    requireRun(
      "stale public surface",
      run(["--repo-root", root, "--wiki-root", wikiRoot, "--decisions-ref", "src/data/draft-editorial-decisions.json"]),
      1,
      ["stale public-surface internal wording"],
    );

    await rm(root, { recursive: true, force: true });
    process.stdout.write("article_production_harness_positive_self_test=pass\n");
    process.stdout.write("article_production_harness_missing_role_self_test=pass\n");
    process.stdout.write("article_production_harness_collapsed_writer_self_test=pass\n");
    process.stdout.write("article_production_harness_stale_surface_self_test=pass\n");
    process.stdout.write("article_production_harness_voice_contract_self_test=pass\n");
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = "scripts/verify-reference-blogger-readiness.mjs";

function run(args) {
  return spawnSync(process.execPath, [resolve(verifier), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

function bodyFiller() {
  return Array.from(
    { length: 20 },
    (_, index) =>
      `This review paragraph ${index + 1} keeps the draft grounded in a source, a reader decision, a trace, and a visible artifact. The editor can accept the claim only after the evidence explains what changed, why the reader should care, and what to reject before publication.`,
  ).join("\n\n");
}

async function writeDraft(dir, slug, body) {
  await writeFile(
    join(dir, `${slug}.md`),
    `---\ntitle: "Reference Blogger Fixture"\npubDatetime: 2026-05-20T00:00:00Z\ndescription: "Fixture."\ndraft: true\nworkflow: "packet"\nseries: "AI Tool Note"\n---\n\n# Reference Blogger Fixture\n\n${body}\n`,
    "utf8",
  );
}

async function main() {
  const root = await makeTestTempDir("vibecode-reference-blogger-readiness-");
  try {
    const passDir = join(root, "pass");
    await mkdir(passDir, { recursive: true });
    await writeDraft(
      passDir,
      "strong-draft",
      `## Packet Receipt

\`\`\`txt
publication_state=draft_only
approval_required=true
approval_candidate=false
\`\`\`

## The Paragraph That Gets Past You

Here is the weak paragraph that looked publishable until the editor inspected it:

\`\`\`txt
AI agents are transforming content operations by making teams faster.
\`\`\`

That sentence is dangerous because no source changed the claim, no reader decision exists, no artifact proves the mechanism, and no reject condition tells the editor when to stop.

## The Failure Is Not Style

The reader is trying to decide whether an agent-written post deserves human review or should be rejected before it wastes public attention.

Reader question: What should the editor accept, reject, or verify before a draft is allowed to look finished?

## The Harness Is the Point

Reference-grade agent writing needs a harness instead of another prompt, because the harness makes every claim carry a source, artifact, reader decision, and reject rule.

## Draft Body

The useful part is not a better tone instruction. The useful part is the missing object: a harness that can reject a polished paragraph before it becomes a public article.

The first version had the facts but not the scene.

\`\`\`txt
Before: The agent generated a post after the source workflow quality gate passed.
\`\`\`

The stronger version starts with the failure the reader already recognizes.

\`\`\`txt
After: The paragraph looked fine, but every field in the autopsy came back empty.
\`\`\`

That is the point. The trace gives the editor a better question than "make it punchier."

\`\`\`txt
source_changed_claim=empty
reader_decision=empty
proof_artifact=empty
reject_condition=generic claim without trace
\`\`\`

The rule is simple: if the paragraph cannot explain what made it inspectable, the rewrite only sounds better.

${bodyFiller()}

## The Table To Use Before You Prompt Again

| If you see | Do this | Reject this |
| --- | --- | --- |
| A topic but no source | Build the packet | Asking for a full article |
| A paragraph but no trace | Fill the autopsy | Asking for more style |
| A claim but no artifact | Add proof | Publishing from vibes |
| A better sentence | Verify what changed | Calling tone a quality system |

Use this before human review: accept only the draft that shows the source, reader decision, artifact, and reject rule.

## Approval Candidate Verdict

Do not promote until a human reviewer says the trace works for a cold reader.

## Draft Risk

The draft can still sound like a competent summary unless the scene, source, artifact, and reader decision stay visible.`,
    );

    let result = run(["--blog-dir", passDir]);
    if (result.status !== 0 || !result.stdout.includes("reference_blogger_readiness_gate=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected strong reference blogger fixture to pass");
    }
    process.stdout.write("reference_blogger_readiness_positive_self_test=pass\n");

    const failDir = join(root, "fail");
    await mkdir(failDir, { recursive: true });
    await writeDraft(
      failDir,
      "weak-draft",
      `## Packet Receipt

\`\`\`txt
publication_state=draft_only
approval_required=true
\`\`\`

## Opening Pressure

AI agents can help teams create better content faster.

## Reader Problem

The reader wants content.

## Angle

AI writing is important.

## Reader Transfer

Read the article and improve your process.

## Approval Candidate Verdict

Not ready.

## Draft Risk

It might be too generic.`,
    );

    result = run(["--blog-dir", failDir]);
    if (result.status === 0 || !result.stderr.includes("opening pressure must show")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected weak reference blogger fixture to fail");
    }
    process.stdout.write("reference_blogger_readiness_negative_self_test=pass\n");
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

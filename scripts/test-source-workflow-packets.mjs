import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = "scripts/verify-source-workflow-packets.mjs";
const REQUIRED_PACKET_SUFFIXES = [
  "reader-pressure",
  "title-angle",
  "evidence-bundle",
  "brief",
  "gate-0",
  "draft-critique",
];

function run(args) {
  return spawnSync(process.execPath, [verifier, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

async function writePost(blogDir, file, frontmatter) {
  await writeFile(join(blogDir, file), `---\n${frontmatter.trim()}\n---\n\nBody.\n`, "utf8");
}

async function writePackets(wikiRoot, slug) {
  const planDir = join(wikiRoot, "companies", "vibecode-town", "plans");
  await writeFile(join(planDir, `${slug}-reader-pressure.md`), "# Reader Pressure\n", "utf8");
  await writeFile(join(planDir, `${slug}-title-angle.md`), "# Title Angle\n", "utf8");
  await writeFile(join(planDir, `${slug}-evidence-bundle.md`), "# Evidence Bundle\n", "utf8");
  await writeFile(join(planDir, `${slug}-brief.md`), "# Brief\n", "utf8");
  await writeFile(join(planDir, `${slug}-gate-0.md`), "# Gate 0\n", "utf8");
  await writeFile(join(planDir, `${slug}-draft-critique.md`), "# Draft Critique\n", "utf8");
}

async function sha256File(path) {
  const buffer = await readFile(path);
  return createHash("sha256").update(buffer).digest("hex");
}

async function writeManifest(path, wikiRoot, slug, hashOverride, pathOverride) {
  const files = [];
  for (const suffix of REQUIRED_PACKET_SUFFIXES) {
    const packetPath = join(wikiRoot, "companies", "vibecode-town", "plans", `${slug}-${suffix}.md`);
    files.push({
      suffix,
      path: pathOverride?.(suffix) ?? `companies/vibecode-town/plans/${slug}-${suffix}.md`,
      sha256: hashOverride ?? (await sha256File(packetPath)),
    });
  }

  await writeFile(path, JSON.stringify({ packets: { [slug]: { files } } }, null, 2), "utf8");
}

async function main() {
  const root = await makeTestTempDir("vibecode-source-workflow-");
  const blogDir = join(root, "blog");
  const wikiRoot = join(root, "wiki");
  const planDir = join(wikiRoot, "companies", "vibecode-town", "plans");

  try {
    await writeFile(join(root, ".keep"), "", "utf8");
    await import("node:fs/promises").then(({ mkdir }) => mkdir(blogDir, { recursive: true }));
    await import("node:fs/promises").then(({ mkdir }) => mkdir(planDir, { recursive: true }));

    await writePost(blogDir, "about.md", `
title: About
pubDatetime: 2026-05-18T00:00:00Z
draft: false
series: "About"
description: About.
`);

    await writePost(blogDir, "packet-post.md", `
title: Packet Post
pubDatetime: 2026-05-18T00:00:00Z
draft: false
series: "AI Explainer"
description: Packet-backed.
    `);
    await writePackets(wikiRoot, "packet-post");
    const manifestFile = join(root, "source-workflow-packets.json");
    await writeManifest(manifestFile, wikiRoot, "packet-post");

    await writePost(blogDir, "legacy-post.md", `
title: Legacy Post
pubDatetime: 2026-05-16T00:00:00Z
draft: false
series: "AI Explainer"
workflow: "legacy"
description: Legacy.
`);

    const pass = run(["--blog-dir", blogDir, "--wiki-root", wikiRoot, "--manifest", manifestFile]);
    if (pass.status !== 0 || !pass.stdout.includes("source_workflow_gate=pass")) {
      throw new Error(`expected pass\nstdout:\n${pass.stdout}\nstderr:\n${pass.stderr}`);
    }

    const missingWikiRoot = join(root, "missing-wiki");

    const manifestPass = run(["--blog-dir", blogDir, "--wiki-root", missingWikiRoot, "--manifest", manifestFile]);
    if (
      manifestPass.status !== 0 ||
      !manifestPass.stdout.includes("source_workflow_wiki_root_available=no") ||
      !manifestPass.stdout.includes("source_workflow_manifest_available=yes") ||
      !manifestPass.stdout.includes("source_workflow_gate=pass")
    ) {
      throw new Error(`expected manifest fallback pass\nstdout:\n${manifestPass.stdout}\nstderr:\n${manifestPass.stderr}`);
    }

    const staleManifestFile = join(root, "stale-source-workflow-packets.json");
    await writeManifest(staleManifestFile, wikiRoot, "packet-post", "a".repeat(64));
    const staleManifest = run(["--blog-dir", blogDir, "--wiki-root", wikiRoot, "--manifest", staleManifestFile]);
    if (
      staleManifest.status === 0 ||
      !staleManifest.stdout.includes("source_workflow_gate=fail") ||
      !staleManifest.stderr.includes("manifest hash mismatch")
    ) {
      throw new Error(`expected stale manifest failure\nstdout:\n${staleManifest.stdout}\nstderr:\n${staleManifest.stderr}`);
    }

    const badPathManifestFile = join(root, "bad-path-source-workflow-packets.json");
    await writeManifest(
      badPathManifestFile,
      wikiRoot,
      "packet-post",
      undefined,
      (suffix) => suffix === "reader-pressure"
        ? "companies/vibecode-town/plans/wrong-reader-pressure.md"
        : `companies/vibecode-town/plans/packet-post-${suffix}.md`,
    );
    const badPathManifest = run(["--blog-dir", blogDir, "--wiki-root", wikiRoot, "--manifest", badPathManifestFile]);
    if (
      badPathManifest.status === 0 ||
      !badPathManifest.stdout.includes("source_workflow_gate=fail") ||
      !badPathManifest.stderr.includes("unexpected path")
    ) {
      throw new Error(`expected bad manifest path failure\nstdout:\n${badPathManifest.stdout}\nstderr:\n${badPathManifest.stderr}`);
    }

    await writePost(blogDir, "missing-packet.md", `
title: Missing Packet
pubDatetime: 2026-05-18T00:00:00Z
draft: false
series: "AI Tool Note"
description: Missing packet.
`);

    const missing = run(["--blog-dir", blogDir, "--wiki-root", wikiRoot]);
    if (missing.status === 0 || !missing.stdout.includes("source_workflow_gate=fail") || !missing.stderr.includes("missing-packet.md")) {
      throw new Error(`expected missing packet failure\nstdout:\n${missing.stdout}\nstderr:\n${missing.stderr}`);
    }

    await writePost(blogDir, "future-legacy.md", `
title: Future Legacy
pubDatetime: 2026-05-18T00:00:00Z
draft: false
series: "AI Explainer"
workflow: "legacy"
description: Future legacy.
`);

    const futureLegacy = run(["--blog-dir", blogDir, "--wiki-root", wikiRoot]);
    if (futureLegacy.status === 0 || !futureLegacy.stderr.includes("future-legacy.md: legacy workflow is only allowed before")) {
      throw new Error(`expected future legacy failure\nstdout:\n${futureLegacy.stdout}\nstderr:\n${futureLegacy.stderr}`);
    }

    process.stdout.write("source_workflow_packets_self_test=pass\n");
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

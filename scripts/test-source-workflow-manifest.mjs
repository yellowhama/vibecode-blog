import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const generator = "scripts/generate-source-workflow-manifest.mjs";
const REQUIRED_PACKET_SUFFIXES = [
  "reader-pressure",
  "title-angle",
  "evidence-bundle",
  "brief",
  "gate-0",
  "draft-critique",
];

function run(args) {
  return spawnSync(process.execPath, [generator, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

async function writePost(blogDir, file, frontmatter) {
  await writeFile(join(blogDir, file), `---\n${frontmatter.trim()}\n---\n\nBody.\n`, "utf8");
}

async function writePackets(wikiRoot, slug) {
  const planDir = join(wikiRoot, "companies", "vibecode-town", "plans");
  await mkdir(planDir, { recursive: true });
  for (const suffix of REQUIRED_PACKET_SUFFIXES) {
    await writeFile(join(planDir, `${slug}-${suffix}.md`), `# ${slug} ${suffix}\n`, "utf8");
  }
}

async function main() {
  const root = await makeTestTempDir("vibecode-source-workflow-manifest-");
  const blogDir = join(root, "blog");
  const wikiRoot = join(root, "wiki");
  const manifestFile = join(root, "source-workflow-packets.json");

  try {
    await mkdir(blogDir, { recursive: true });

    await writePost(blogDir, "about.md", `
title: About
pubDatetime: 2026-05-18T00:00:00Z
draft: false
series: "About"
description: About.
`);

    await writePost(blogDir, "legacy-post.md", `
title: Legacy Post
pubDatetime: 2026-05-16T00:00:00Z
draft: false
series: "AI Explainer"
workflow: "legacy"
description: Legacy.
`);

    await writePost(blogDir, "packet-post.md", `
title: Packet Post
pubDatetime: 2026-05-18T00:00:00Z
draft: false
series: "AI Tool Note"
workflow: "packet"
description: Packet-backed.
`);
    await writePackets(wikiRoot, "packet-post");

    const writeResult = run(["--blog-dir", blogDir, "--wiki-root", wikiRoot, "--manifest", manifestFile]);
    if (writeResult.status !== 0 || !writeResult.stdout.includes("source_workflow_manifest_packet_count=1")) {
      throw new Error(`expected manifest write pass\nstdout:\n${writeResult.stdout}\nstderr:\n${writeResult.stderr}`);
    }

    const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
    if (!manifest.packets?.["packet-post"]) {
      throw new Error("expected packet-post in generated manifest");
    }
    if (manifest.packets?.["legacy-post"] || manifest.packets?.about) {
      throw new Error("expected About and legacy posts to be omitted from generated manifest");
    }

    const checkResult = run(["--blog-dir", blogDir, "--wiki-root", wikiRoot, "--manifest", manifestFile, "--check"]);
    if (checkResult.status !== 0 || !checkResult.stdout.includes("source_workflow_manifest_check=pass")) {
      throw new Error(`expected manifest check pass\nstdout:\n${checkResult.stdout}\nstderr:\n${checkResult.stderr}`);
    }

    await writeFile(
      join(wikiRoot, "companies", "vibecode-town", "plans", "packet-post-brief.md"),
      "# Packet Post Brief changed\n",
      "utf8",
    );
    const staleResult = run(["--blog-dir", blogDir, "--wiki-root", wikiRoot, "--manifest", manifestFile, "--check"]);
    if (
      staleResult.status === 0 ||
      !staleResult.stdout.includes("source_workflow_manifest_check=fail") ||
      !staleResult.stderr.includes("source workflow manifest is stale")
    ) {
      throw new Error(`expected stale manifest check failure\nstdout:\n${staleResult.stdout}\nstderr:\n${staleResult.stderr}`);
    }

    await writePost(blogDir, "missing-packet.md", `
title: Missing Packet
pubDatetime: 2026-05-18T00:00:00Z
draft: false
series: "AI Market Watch"
workflow: "packet"
description: Missing packet.
`);
    const missingResult = run(["--blog-dir", blogDir, "--wiki-root", wikiRoot, "--manifest", manifestFile]);
    if (missingResult.status === 0 || !missingResult.stderr.includes("missing source workflow packet")) {
      throw new Error(`expected missing packet failure\nstdout:\n${missingResult.stdout}\nstderr:\n${missingResult.stderr}`);
    }

    process.stdout.write("source_workflow_manifest_self_test=pass\n");
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

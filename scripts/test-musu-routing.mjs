import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { makeTestTempDir } from "./test-temp-root.mjs";

const verifier = resolve("scripts/verify-musu-routing.mjs");

function run(blogDir) {
  return spawnSync(process.execPath, [verifier, "--blog-dir", blogDir], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function requireOutput(result, label, expectedStatus, snippets) {
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status !== expectedStatus) {
    throw new Error(`${label}: expected exit ${expectedStatus}, got ${result.status}\n${output}`);
  }

  for (const snippet of snippets) {
    if (!output.includes(snippet)) {
      throw new Error(`${label}: missing output snippet "${snippet}"\n${output}`);
    }
  }
}

async function writePost(dir, file, series, body, draft = false) {
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, file),
    `---\ntitle: "${file}"\npubDatetime: 2026-05-18T00:00:00Z\ndescription: "Fixture."\ndraft: ${draft ? "true" : "false"}\nseries: "${series}"\n---\n\n${body}\n`,
    "utf8",
  );
}

async function main() {
  const root = await makeTestTempDir("vibecode-musu-routing-");
  try {
    const passDir = join(root, "pass");
    const missingRouteDir = join(root, "missing-route");
    const spammyRouteDir = join(root, "spammy-route");

    await writePost(passDir, "about.md", "About", "About pages can link nowhere.");
    await writePost(passDir, "contract.md", "AI Explainer", "[Read MUSU](https://musu.pro)");
    await writePost(passDir, "draft.md", "AI Explainer", "Drafts are ignored.", true);

    await writePost(missingRouteDir, "missing.md", "AI Tool Note", "No proof route here.");

    await writePost(
      spammyRouteDir,
      "spammy.md",
      "AI Market Watch",
      [
        "[MUSU 1](https://musu.pro)",
        "[MUSU 2](https://musu.pro/docs)",
        "[GitHub](https://github.com/yellowhama/vibecode-blog)",
        "[Install](/install.sh)",
      ].join("\n\n"),
    );

    requireOutput(run(passDir), "musu_routing_positive_self_test", 0, [
      "musu_routing_posts_checked=2",
      "about.md=0",
      "contract.md=1",
      "musu_routing_gate=pass",
    ]);
    requireOutput(run(missingRouteDir), "musu_routing_missing_route_self_test", 1, [
      "missing.md: missing actual MUSU/proof route link",
      "musu_routing_gate=fail",
    ]);
    requireOutput(run(spammyRouteDir), "musu_routing_spammy_route_self_test", 1, [
      "spammy.md: has 4 MUSU/proof routes; keep routing natural and non-spammy",
      "musu_routing_gate=fail",
    ]);

    process.stdout.write("musu_routing_positive_self_test=pass\n");
    process.stdout.write("musu_routing_missing_route_self_test=pass\n");
    process.stdout.write("musu_routing_spammy_route_self_test=pass\n");
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

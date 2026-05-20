import { readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { makeTestTempDir } from "./test-temp-root.mjs";

const generator = "scripts/generate-private-run-log-evidence-artifact.mjs";

function run(args) {
  return spawnSync(process.execPath, [resolve(generator), ...args], {
    cwd: resolve("."),
    encoding: "utf8",
  });
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  const root = await makeTestTempDir("vibecode-private-run-log-evidence-");
  try {
    const specPath = join(root, "spec.json");
    const output = join(root, "run-log.png");
    const summary = join(root, "run-log-summary.json");
    const spec = {
      schema: "vibecode-private-run-log-spec/v1",
      slug: "run-log-fixture",
      title: "Run Log Fixture",
      defaultCwd: resolve("."),
      readerTest: "The pass run proves the current gate; the expected fail run proves an old review cannot sneak through.",
      runs: [
        {
          id: "pass-current",
          label: "Current candidate passes",
          role: "The current command returns a verifier receipt.",
          command: "{node}",
          args: ["-e", "console.log('fixture_pass_receipt=pass')"],
          expectedExitCode: 0,
          requiredStdout: ["fixture_pass_receipt=pass"],
          requiredStderr: [],
        },
        {
          id: "fail-old-review",
          label: "Old candidate is rejected",
          role: "The expected failure is part of the evidence because weak prior state must stay blocked.",
          command: "{node}",
          args: ["-e", "console.error('quality review must have zero rejected rows'); process.exit(1)"],
          expectedExitCode: 1,
          requiredStdout: [],
          requiredStderr: ["zero rejected rows"],
        },
      ],
    };
    await writeJson(specPath, spec);

    let result = run(["--spec", specPath, "--output", output, "--summary", summary]);
    if (result.status !== 0 || !result.stdout.includes("private_run_log_evidence_artifact=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected private run log evidence generation to pass");
    }
    const metadata = await sharp(output).metadata();
    if (metadata.width !== 1400 || metadata.height !== 900) {
      throw new Error("expected private run log image to be 1400x900");
    }
    const generatedSummary = JSON.parse(await readFile(summary, "utf8"));
    if (!generatedSummary.runs.some((run) => run.expectedExitCode === 1 && run.exitCode === 1)) {
      throw new Error("expected summary to preserve an expected failing run");
    }
    process.stdout.write("private_run_log_evidence_generation_self_test=pass\n");

    result = run(["--check", "--spec", specPath, "--output", output, "--summary", summary]);
    if (result.status !== 0 || !result.stdout.includes("private_run_log_evidence_artifact=pass")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected private run log evidence check to pass");
    }
    process.stdout.write("private_run_log_evidence_check_self_test=pass\n");

    const badSpecPath = join(root, "bad-spec.json");
    await writeJson(badSpecPath, { ...spec, runs: spec.runs.slice(0, 1) });
    result = run(["--spec", badSpecPath, "--output", join(root, "bad.png"), "--summary", join(root, "bad-summary.json")]);
    if (result.status === 0 || !result.stderr.includes("expected failing run")) {
      process.stderr.write(result.stdout + result.stderr);
      throw new Error("expected missing failing run to fail");
    }
    process.stdout.write("private_run_log_evidence_missing_failure_self_test=pass\n");
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

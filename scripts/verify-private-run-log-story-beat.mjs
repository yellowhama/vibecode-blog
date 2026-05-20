import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function parseMarkdown(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: text };
  return { frontmatter: match[1], body: match[2] };
}

function section(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = body.match(new RegExp(`(?:^|\\r?\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\r?\\n##\\s+|$)`, "i"));
  return match?.[1]?.trim() ?? "";
}

function codeBlocks(text) {
  return [...text.matchAll(/```(?:txt)?\r?\n([\s\S]*?)```/g)].map((match) => match[1].trim());
}

function stripCode(text) {
  return text.replace(/```[\s\S]*?```/g, " ");
}

async function main() {
  const draftArg = getArg("--draft");
  const summaryArg = getArg("--summary");
  if (!draftArg) throw new Error("--draft is required");
  if (!summaryArg) throw new Error("--summary is required");
  const draftPath = resolve(draftArg);
  const summaryPath = resolve(summaryArg);
  if (!existsSync(draftPath)) throw new Error(`draft not found: ${draftPath}`);
  if (!existsSync(summaryPath)) throw new Error(`summary not found: ${summaryPath}`);

  const draft = await readFile(draftPath, "utf8");
  const summary = JSON.parse(await readFile(summaryPath, "utf8"));
  const { body } = parseMarkdown(draft);
  const visualEvidence = section(body, "Visual Evidence");
  const visibleText = stripCode(visualEvidence);
  const blocks = codeBlocks(visualEvidence);
  const failures = [];

  if (summary.schema !== "vibecode-private-run-log-evidence/v1") {
    failures.push("run-log summary schema mismatch");
  }
  if (!Array.isArray(summary.runs) || summary.runs.length < 2) {
    failures.push("run-log summary must contain at least two runs");
  }
  if (!summary.runs?.some((run) => run.expectedExitCode === 0 && run.exitCode === 0 && run.stdoutMatched === true)) {
    failures.push("run-log summary must contain a matched passing run");
  }
  if (!summary.runs?.some((run) => run.expectedExitCode !== 0 && run.exitCode !== 0 && run.stderrMatched === true)) {
    failures.push("run-log summary must contain a matched expected failing run");
  }
  if (!draft.includes(basename(summary.output ?? ""))) {
    failures.push("draft must reference the run-log evidence artifact image");
  }
  if (!/old rejected|first human-quality review|yesterday's weak review|stale/i.test(visibleText)) {
    failures.push("run-log story beat must name the old or stale rejected review");
  }
  if (!/same verifier|ran the verifier twice|pointed the same verifier/i.test(visibleText)) {
    failures.push("run-log story beat must show the repeated verifier action");
  }
  if (!/not a bug|refusing|cannot sneak through|masquerade/i.test(visibleText)) {
    failures.push("run-log story beat must state why the failure matters");
  }
  if (!blocks.some((block) => block.includes("private_workflow_evidence_artifact=pass"))) {
    failures.push("run-log story beat must show the passing console output");
  }
  if (
    !blocks.some(
      (block) =>
        block.includes("quality review must have zero rejected rows") &&
        block.includes("private_workflow_evidence_artifact=fail"),
    )
  ) {
    failures.push("run-log story beat must show the failing console output and reason");
  }

  process.stdout.write(`private_run_log_story_draft=${draftPath}\n`);
  process.stdout.write(`private_run_log_story_summary=${summaryPath}\n`);
  process.stdout.write(`private_run_log_story_runs=${summary.runs?.length ?? 0}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("private_run_log_story_beat=fail\n");
    return 1;
  }
  process.stdout.write("private_run_log_story_beat=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

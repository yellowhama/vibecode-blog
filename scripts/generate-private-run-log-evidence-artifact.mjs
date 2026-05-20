import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const DEFAULT_OUTPUT_DIR = "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasArg(name) {
  return process.argv.includes(name);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sha256Upper(value) {
  return createHash("sha256").update(value).digest("hex").toUpperCase();
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrap(value, maxChars = 42, maxLines = 4) {
  const words = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.length ? lines : ["missing"];
}

function svgText(lines, x, y, options = {}) {
  const { size = 22, fill = "#21170f", family = "Inter, Arial, sans-serif", weight = "600", lineHeight = 30 } = options;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("")}</text>`;
}

function resolveCommand(command) {
  if (command === "{node}") return process.execPath;
  return command;
}

function includesAll(haystack, needles = []) {
  return needles.every((needle) => String(haystack ?? "").includes(needle));
}

function commandLine(run) {
  return [run.command, ...(run.args ?? [])].join(" ");
}

function runCommand(run, defaultCwd) {
  const command = resolveCommand(run.command);
  const cwd = resolve(run.cwd ?? defaultCwd ?? ".");
  const result = spawnSync(command, run.args ?? [], {
    cwd,
    encoding: "utf8",
    shell: false,
    maxBuffer: 1024 * 1024 * 12,
  });
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  const exitCode = typeof result.status === "number" ? result.status : 1;
  return {
    id: run.id,
    label: run.label,
    role: run.role,
    command: commandLine(run),
    cwd,
    expectedExitCode: run.expectedExitCode,
    exitCode,
    matchedExpectedExitCode: exitCode === run.expectedExitCode,
    requiredStdout: run.requiredStdout ?? [],
    requiredStderr: run.requiredStderr ?? [],
    stdoutMatched: includesAll(stdout, run.requiredStdout),
    stderrMatched: includesAll(stderr, run.requiredStderr),
    stdoutSha256: sha256(stdout),
    stderrSha256: sha256(stderr),
    stdoutExcerpt: stdout.trim().slice(0, 900),
    stderrExcerpt: stderr.trim().slice(0, 900),
  };
}

function buildSvg(model) {
  const cards = model.runs
    .map((run, index) => {
      const x = 84 + index * 610;
      const statusColor = run.matchedExpectedExitCode && run.stdoutMatched && run.stderrMatched ? "#255b42" : "#8e3b2f";
      return `<g transform="translate(${x} 302)">
        <rect width="560" height="370" rx="22" fill="#fffaf2" stroke="#d8c7b8" stroke-width="2"/>
        <rect width="560" height="58" rx="22" fill="${statusColor}"/>
        <text x="28" y="38" font-family="Consolas, monospace" font-size="19" font-weight="700" fill="#fffaf2">${escapeXml(run.id)} / exit ${run.exitCode}</text>
        ${svgText(wrap(run.label, 34, 2), 28, 104, { size: 31, lineHeight: 36, fill: "#21170f", family: "Georgia, serif", weight: "700" })}
        ${svgText(wrap(run.role, 52, 3), 28, 180, { size: 20, lineHeight: 28, fill: "#4e4037", weight: "600" })}
        <rect x="28" y="278" width="504" height="58" rx="12" fill="#f3eadf" stroke="#d8c7b8"/>
        <text x="48" y="303" font-family="Consolas, monospace" font-size="15" font-weight="700" fill="#21170f">${escapeXml(`stdout ${run.stdoutSha256.slice(0, 10)} / stderr ${run.stderrSha256.slice(0, 10)}`)}</text>
        <text x="48" y="325" font-family="Consolas, monospace" font-size="14" fill="#74675d">${escapeXml(`expected=${run.expectedExitCode} matched=${run.matchedExpectedExitCode}`)}</text>
      </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
  <rect width="1400" height="900" fill="#f3eadf"/>
  <g stroke="#e1d2c4" stroke-width="1">
    ${Array.from({ length: 36 }, (_, index) => `<line x1="${index * 40}" y1="0" x2="${index * 40}" y2="900"/>`).join("")}
    ${Array.from({ length: 24 }, (_, index) => `<line x1="0" y1="${index * 40}" x2="1400" y2="${index * 40}"/>`).join("")}
  </g>
  <rect x="46" y="42" width="1308" height="816" rx="30" fill="#fffaf2" stroke="#21170f" stroke-width="3"/>
  <text x="84" y="91" font-family="Consolas, monospace" font-size="22" font-weight="700" fill="#8e3b2f">PRIVATE RUN LOG EVIDENCE</text>
  ${svgText(wrap(model.title, 44, 2), 84, 154, { size: 46, lineHeight: 52, fill: "#21170f", family: "Georgia, serif", weight: "700" })}
  <text x="84" y="232" font-family="Consolas, monospace" font-size="20" fill="#74675d">real command evidence: one gate passes, one stale/weak review is rejected</text>
  ${cards}
  <g transform="translate(84 724)">
    <rect width="1228" height="92" rx="18" fill="#21170f"/>
    <text x="28" y="37" font-family="Consolas, monospace" font-size="18" font-weight="700" fill="#d8794a">reader-facing test</text>
    ${svgText(wrap(model.readerTest, 104, 2), 28, 72, { size: 22, lineHeight: 30, fill: "#fffaf2", weight: "700" })}
  </g>
</svg>`;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function validateSummary(summary, spec, output) {
  const failures = [];
  if (summary.schema !== "vibecode-private-run-log-evidence/v1") failures.push("summary schema mismatch");
  if (summary.slug !== spec.slug) failures.push("summary slug mismatch");
  if (summary.specSha256 !== sha256(JSON.stringify(spec))) failures.push("summary spec hash mismatch");
  if (summary.output !== output) failures.push("summary output path mismatch");
  if (!Array.isArray(summary.runs) || summary.runs.length < 2) failures.push("summary must contain at least two runs");
  if (!summary.runs?.some((run) => run.expectedExitCode === 0 && run.exitCode === 0)) failures.push("summary must include a passing run");
  if (!summary.runs?.some((run) => run.expectedExitCode !== 0 && run.exitCode !== 0)) {
    failures.push("summary must include an expected failing run");
  }
  for (const run of summary.runs ?? []) {
    if (!run.matchedExpectedExitCode) failures.push(`${run.id} exit code did not match expected`);
    if (!run.stdoutMatched) failures.push(`${run.id} required stdout missing`);
    if (!run.stderrMatched) failures.push(`${run.id} required stderr missing`);
  }
  return failures;
}

async function main() {
  const specPath = resolve(getArg("--spec") ?? "");
  if (!specPath) throw new Error("--spec is required");
  const spec = await readJson(specPath);
  if (spec.schema !== "vibecode-private-run-log-spec/v1") throw new Error("spec schema must be vibecode-private-run-log-spec/v1");
  if (!spec.slug) throw new Error("spec.slug is required");
  const output = resolve(getArg("--output") ?? `${DEFAULT_OUTPUT_DIR}/${spec.slug}-run-log-evidence.png`);
  const summaryPath = resolve(getArg("--summary") ?? `${DEFAULT_OUTPUT_DIR}/${spec.slug}-run-log-evidence-summary.json`);
  const check = hasArg("--check");

  const failures = [];
  if (!Array.isArray(spec.runs) || spec.runs.length < 2) failures.push("spec must include at least two runs");
  if (!spec.runs?.some((run) => run.expectedExitCode === 0)) failures.push("spec must include one expected passing run");
  if (!spec.runs?.some((run) => run.expectedExitCode !== 0)) failures.push("spec must include one expected failing run");

  if (check) {
    if (!existsSync(output)) failures.push(`run log evidence image missing: ${output}`);
    if (!existsSync(summaryPath)) failures.push(`run log evidence summary missing: ${summaryPath}`);
    if (existsSync(summaryPath)) {
      const summary = await readJson(summaryPath);
      failures.push(...validateSummary(summary, spec, output));
      if (existsSync(output)) {
        const currentImageSha = sha256Upper(await readFile(output));
        if (currentImageSha !== summary.imageSha256) failures.push("run log evidence image hash mismatch");
      }
    }
  } else if (failures.length === 0) {
    const runs = spec.runs.map((run) => runCommand(run, spec.defaultCwd));
    const model = {
      title: spec.title ?? spec.slug,
      runs,
      readerTest:
        spec.readerTest ??
        "A strong content workflow does not just show the final draft. It shows the command that passed and the old/weak candidate that the system refused.",
    };
    const image = await sharp(Buffer.from(buildSvg(model))).png().toBuffer();
    const imageSha256 = sha256Upper(image);
    const summary = {
      schema: "vibecode-private-run-log-evidence/v1",
      slug: spec.slug,
      title: spec.title ?? spec.slug,
      specPath,
      specSha256: sha256(JSON.stringify(spec)),
      output,
      imageSha256,
      width: 1400,
      height: 900,
      runs,
    };
    failures.push(...validateSummary(summary, spec, output));
    if (failures.length === 0) {
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, image);
      await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    }
  }

  process.stdout.write(`private_run_log_evidence_artifact=${output}\n`);
  process.stdout.write(`private_run_log_evidence_summary=${summaryPath}\n`);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.stdout.write("private_run_log_evidence_artifact=fail\n");
    return 1;
  }
  process.stdout.write("private_run_log_evidence_artifact=pass\n");
  return 0;
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

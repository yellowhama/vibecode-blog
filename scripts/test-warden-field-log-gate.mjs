import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const eventId = "11111111-1111-4111-8111-111111111111";
const tamperedEventId = "33333333-3333-4333-8333-333333333333";

function runNode(args, options = {}) {
  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });
    child.on("close", (code) => resolveRun(code ?? 1));
    child.on("error", (error) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      resolveRun(1);
    });
  });
}

async function main() {
  const root = await mkdtemp(join(tmpdir(), "vibecode-warden-gate-"));
  const incidentDir = join(root, "incidents");
  const evidenceDir = join(root, "evidence");
  const evidencePath = join(evidenceDir, "warden-product-path-self-test.json");
  const tamperedIncidentDir = join(root, "tampered-incidents");
  const tamperedEvidenceDir = join(root, "tampered-evidence");
  const tamperedEvidencePath = join(tamperedEvidenceDir, "warden-product-path-self-test.json");

  const evidence = {
    captured_at: "2026-05-16T00:00:00.000Z",
    app_url: "http://localhost:3000",
    endpoint: "http://localhost:3000/api/bridge/watchdog?node=self-test-node&cmd=non-contract-warden-self-test",
    node_name: "self-test-node",
    command_raw: "non-contract-warden-self-test",
    requested_at: "2026-05-16T00:00:00.000Z",
    blocked_response: {
      http_status: 423,
      body: {
        error: "Warden blocked command",
        event_id: eventId,
        status: "blocked",
        reason: "watchdog command is outside the allowed command contract",
      },
    },
    warden_event: {
      id: eventId,
      user_id: "22222222-2222-4222-8222-222222222222",
      node_name: "self-test-node",
      action_type: "watchdog_command",
      command_raw: "non-contract-warden-self-test",
      reason: "watchdog command is outside the allowed command contract",
      status: "blocked",
      created_at: "2026-05-16T00:00:00.000Z",
      resolved_at: null,
    },
    resolution: {
      decision: "denied",
      transport: "dashboard_api",
      row: {
        id: eventId,
        user_id: "22222222-2222-4222-8222-222222222222",
        node_name: "self-test-node",
        action_type: "watchdog_command",
        command_raw: "non-contract-warden-self-test",
        reason: "watchdog command is outside the allowed command contract",
        status: "denied",
        created_at: "2026-05-16T00:00:00.000Z",
        resolved_at: "2026-05-16T00:01:00.000Z",
      },
    },
    migration_manifest: {
      path: join(root, "warden-migrations.manifest.json"),
      body: {
        generated_at: "2026-05-16T00:00:00.000Z",
        apply_order: [
          {
            path: "docs/migrations/019_warden_events.sql",
            sha256: "85b9fc55180c208292e767b0d6769f5dc31867d08626b0de3fa4458beaea7faa",
          },
          {
            path: "docs/migrations/020_warden_event_integrity.sql",
            sha256: "3c59bf908f174e5bf6c1cabcb9f3dec088c04bb9529b773e7b88cc589dd424eb",
          },
        ],
        bundle_sha256: "a60f6703b1a7f059e56d682818561907f011b78b37605b93ff7043e1119396ce",
      },
    },
  };

  try {
    await mkdir(incidentDir, { recursive: true });
    await mkdir(evidenceDir, { recursive: true });
    await mkdir(tamperedIncidentDir, { recursive: true });
    await mkdir(tamperedEvidenceDir, { recursive: true });

    await writeFile(
      evidencePath,
      `${JSON.stringify(evidence, null, 2)}\n`,
      "utf8"
    );

    const incidentCode = await runNode([
      resolve("scripts/create-warden-incident.mjs"),
      "--evidence",
      evidencePath,
      "--output-dir",
      incidentDir,
    ]);
    if (incidentCode !== 0) return incidentCode;

    const gateCode = await runNode([
      resolve("scripts/verify-warden-field-log-ready.mjs"),
      "--incident-dir",
      incidentDir,
    ]);
    if (gateCode !== 0) return gateCode;

    await writeFile(
      tamperedEvidencePath,
      `${JSON.stringify(
        {
          ...evidence,
          warden_event: {
            ...evidence.warden_event,
            id: tamperedEventId,
          },
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const tamperedIncidentCode = await runNode([
      resolve("scripts/create-warden-incident.mjs"),
      "--evidence",
      evidencePath,
      "--output-dir",
      tamperedIncidentDir,
    ]);
    if (tamperedIncidentCode !== 0) return tamperedIncidentCode;

    const tamperedIncidentFile = (await readdir(tamperedIncidentDir))
      .find((name) => name.endsWith("-warden-blocked-watchdog-command.md"));
    if (!tamperedIncidentFile) {
      process.stderr.write("Tampered self-test incident was not generated.\n");
      return 1;
    }
    const tamperedIncidentPath = join(tamperedIncidentDir, tamperedIncidentFile);
    const tamperedIncidentText = await readFile(tamperedIncidentPath, "utf8");
    await writeFile(
      tamperedIncidentPath,
      tamperedIncidentText.replace(evidencePath, tamperedEvidencePath),
      "utf8"
    );

    const tamperedGateCode = await runNode([
      resolve("scripts/verify-warden-field-log-ready.mjs"),
      "--incident-dir",
      tamperedIncidentDir,
    ]);
    if (tamperedGateCode === 0) {
      process.stderr.write("Warden Field Log gate accepted tampered evidence.\n");
      return 1;
    }

    process.stdout.write("warden_field_log_gate_positive_self_test=pass\n");
    process.stdout.write("warden_field_log_gate_tamper_self_test=pass\n");
    return 0;
  } finally {
    if (process.env.KEEP_WARDEN_GATE_SELF_TEST !== "1") {
      await rm(root, { recursive: true, force: true });
    } else {
      process.stdout.write(`warden_field_log_gate_self_test_dir=${root}\n`);
    }
  }
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const eventId = "11111111-1111-4111-8111-111111111111";

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

  try {
    await mkdir(incidentDir, { recursive: true });
    await mkdir(evidenceDir, { recursive: true });

    await writeFile(
      evidencePath,
      `${JSON.stringify(
        {
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
        },
        null,
        2
      )}\n`,
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

    process.stdout.write("warden_field_log_gate_self_test=pass\n");
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

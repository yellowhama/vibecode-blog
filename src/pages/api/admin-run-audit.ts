import { exec } from "node:child_process";
import { promisify } from "node:util";
import { stat } from "node:fs/promises";

const execAsync = promisify(exec);

async function fileExists(path: string) {
  try {
    const s = await stat(path);
    return s.isFile();
  } catch {
    return false;
  }
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { slug, filepath, action } = body;

    if (!slug || !filepath) {
      return new Response(JSON.stringify({ error: "Missing slug or filepath" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    if (!(await fileExists(filepath))) {
      return new Response(JSON.stringify({ error: `File not found: ${filepath}` }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    let command = "";
    if (action === "vibe_critic") {
      command = `python factory/vibe_critic.py ${filepath}`;
    } else if (action === "writing_pulse") {
      command = `node scripts/audit-writing-pulse.mjs --strict`;
    } else if (action === "reader_payoff") {
      command = `node scripts/audit-reader-payoff.mjs --strict`;
    } else if (action === "reference_writing") {
      command = `node scripts/audit-reference-writing.mjs --strict`;
    } else if (action === "verify_all") {
      command = `npm run verify:content`;
    } else {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Run the command
    const startTime = Date.now();
    try {
      const { stdout, stderr } = await execAsync(command);
      const duration = Date.now() - startTime;
      return new Response(JSON.stringify({
        status: "success",
        stdout,
        stderr,
        duration,
        command
      }), {
        headers: { "content-type": "application/json" }
      });
    } catch (execError: any) {
      const duration = Date.now() - startTime;
      return new Response(JSON.stringify({
        status: "failed",
        stdout: execError.stdout || "",
        stderr: execError.stderr || execError.message || "",
        duration,
        command
      }), {
        headers: { "content-type": "application/json" }
      });
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

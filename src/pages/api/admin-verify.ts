import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { action } = body;

    let command = "";
    if (action === "verify_content") {
      command = "npm run verify:content";
    } else if (action === "verify_site") {
      command = "npm run verify:site-quality";
    } else if (action === "build") {
      command = "npm run build";
    } else if (action === "index_code") {
      command = "npm run index:local-code";
    } else {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

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

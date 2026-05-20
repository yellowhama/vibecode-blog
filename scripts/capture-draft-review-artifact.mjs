import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { createServer as createNetServer } from "node:net";

const DEFAULT_ARTIFACT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-review-artifact.html";
const DEFAULT_OUTPUT =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-review-artifact-desktop.png";
const DEFAULT_SUMMARY =
  "F:/Aisaak/CompanyArtifacts/vibecode-draft-review-artifacts/writing-harness-not-more-prompts-review-artifact-summary.json";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function getArgs(name) {
  const values = [];
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === name && process.argv[index + 1]) {
      values.push(process.argv[index + 1]);
    }
  }
  return values;
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  const chrome = candidates.find(candidate => existsSync(candidate));
  if (!chrome) throw new Error("Chrome or Edge was not found. Set CHROME_PATH.");
  return chrome;
}

function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createNetServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not resolve free port."));
        return;
      }
      server.close(() => resolvePort(address.port));
    });
  });
}

async function waitForChrome(port) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      // Chrome is still booting.
    }
    await new Promise(resolveDelay => setTimeout(resolveDelay, 250));
  }
  throw new Error("Timed out waiting for Chrome remote debugging endpoint.");
}

async function createTarget(port, url) {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT",
  });
  if (!response.ok) throw new Error(`Could not create Chrome target: ${response.status}`);
  return response.json();
}

function openCdp(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();
  const waiters = new Map();

  ws.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolveCommand, rejectCommand } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rejectCommand(new Error(message.error.message));
      else resolveCommand(message);
      return;
    }
    if (message.method && waiters.has(message.method)) {
      const listeners = waiters.get(message.method);
      waiters.delete(message.method);
      for (const listener of listeners) listener(message);
    }
  });

  const ready = new Promise((resolveReady, rejectReady) => {
    ws.addEventListener("open", resolveReady, { once: true });
    ws.addEventListener("error", rejectReady, { once: true });
  });

  function command(method, params = {}) {
    const id = nextId;
    nextId += 1;
    return new Promise((resolveCommand, rejectCommand) => {
      pending.set(id, { resolveCommand, rejectCommand });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  function waitFor(method, timeoutMs = 8000) {
    return new Promise((resolveEvent, rejectEvent) => {
      const timeout = setTimeout(() => {
        rejectEvent(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
      const listeners = waiters.get(method) || [];
      listeners.push(message => {
        clearTimeout(timeout);
        resolveEvent(message);
      });
      waiters.set(method, listeners);
    });
  }

  return { ready, command, waitFor, close: () => ws.close() };
}

async function removeWithRetry(path) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rm(path, { recursive: true, force: true });
      return;
    } catch (error) {
      if (!["EBUSY", "EPERM", "ENOTEMPTY"].includes(error?.code)) throw error;
      await new Promise(resolveDelay => setTimeout(resolveDelay, 250));
    }
  }
}

async function capture() {
  const artifact = resolve(getArg("--artifact") ?? DEFAULT_ARTIFACT);
  const output = resolve(getArg("--output") ?? DEFAULT_OUTPUT);
  const summaryPath = resolve(getArg("--summary") ?? DEFAULT_SUMMARY);
  const requiredTexts = getArgs("--required");
  if (!existsSync(artifact)) throw new Error(`draft review artifact not found: ${artifact}`);

  const chromePort = await freePort();
  const profileRoot = await mkdtemp(join(tmpdir(), "vibecode-draft-review-chrome-"));
  const chrome = spawn(findChrome(), [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${profileRoot}`,
  ], { stdio: "ignore" });

  let cdp;
  try {
    await waitForChrome(chromePort);
    const target = await createTarget(chromePort, pathToFileURL(artifact).href);
    cdp = openCdp(target.webSocketDebuggerUrl);
    await cdp.ready;
    await cdp.command("Page.enable");
    await cdp.command("Runtime.enable");
    await cdp.command("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1400,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const load = cdp.waitFor("Page.loadEventFired", 10000).catch(() => undefined);
    await cdp.command("Page.navigate", { url: pathToFileURL(artifact).href });
    await load;
    const defaultRequired = [
      "Private Draft Review Artifact",
      "Weak paragraph",
      "Packet rejection",
      "One-minute autopsy",
      "Autopsy example",
      "Review Desk Protocol",
      "Harness review fields",
      "Review-desk rewrite",
      "Real Failed-Draft Trace",
      "failed_draft_commit=0f07239",
      "source note -> six packet files",
      "Reviewer Decision"
    ];
    const required = requiredTexts.length > 0 ? requiredTexts : defaultRequired;
    const audit = await cdp.command("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const text = document.body.textContent;
        const required = ${JSON.stringify(required)};
        const missing = required.filter(item => !text.includes(item));
        return {
          title: document.title,
          requiredTextMatches: required.filter(item => text.includes(item)).length,
          requiredTextTotal: required.length,
          requiredMissing: missing,
          bodyTextLength: text.length,
          scrollHeight: document.documentElement.scrollHeight
        };
      })()`,
    });
    const result = audit.result.result.value;
    if (result.requiredTextMatches !== result.requiredTextTotal) {
      throw new Error(
        `draft review artifact rendered without all required review sections: ${result.requiredMissing.join(", ")}`
      );
    }

    const screenshot = await cdp.command("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, Buffer.from(screenshot.result.data, "base64"));
    await writeFile(summaryPath, JSON.stringify({ artifact, screenshot: output, ...result }, null, 2), "utf8");
    process.stdout.write(`draft_review_artifact_screenshot=${output}\n`);
    process.stdout.write(`draft_review_artifact_summary=${summaryPath}\n`);
    process.stdout.write("draft_review_artifact_rendered=pass\n");
  } finally {
    if (cdp) cdp.close();
    if (!chrome.killed) chrome.kill();
    await removeWithRetry(profileRoot);
  }
}

try {
  await capture();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.stdout.write("draft_review_artifact_rendered=fail\n");
  process.exitCode = 1;
}

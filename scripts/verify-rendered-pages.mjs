import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve, extname, relative, isAbsolute } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { createServer as createNetServer } from "node:net";

const DIST_DIR = resolve("dist");
const CONTRACT_PATH = "src/data/post-image-contracts.json";
const SCREENSHOT_ROOT =
  process.env.VIBECODE_RENDERED_AUDIT_DIR ||
  process.env.VIBECODE_TEST_TEMP_DIR ||
  process.env.PROJECT_TEST_TEMP_DIR ||
  process.env.TEST_TEMP_DIR ||
  (process.platform === "win32"
    ? "F:\\Aisaak\\CompanyArtifacts\\vibecode-rendered-audit"
    : join(tmpdir(), "vibecode-rendered-audit"));

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 1100, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

function ensureInside(base, target) {
  const pathFromBase = relative(base, target);
  return pathFromBase === "" || (!pathFromBase.startsWith("..") && !isAbsolute(pathFromBase));
}

function serveDist() {
  const server = createServer((request, response) => {
    try {
      const url = new URL(request.url || "/", "http://localhost");
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";
      const filePath = resolve(DIST_DIR, `.${pathname}`);

      if (!ensureInside(DIST_DIR, filePath) || !existsSync(filePath)) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "content-type": MIME_TYPES[extname(filePath)] || "application/octet-stream",
      });
      createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500);
      response.end(error instanceof Error ? error.message : String(error));
    }
  });

  return new Promise((resolveServer, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not resolve static server address."));
        return;
      }
      resolveServer({ server, port: address.port });
    });
  });
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
  if (!chrome) {
    throw new Error("Chrome or Edge was not found. Set CHROME_PATH to run rendered page verification.");
  }
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
      const { port } = address;
      server.close(() => resolvePort(port));
    });
  });
}

async function waitForChrome(port) {
  const endpoint = `http://127.0.0.1:${port}/json/version`;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return;
    } catch {
      // Chrome is still booting.
    }
    await new Promise(resolveDelay => setTimeout(resolveDelay, 250));
  }
  throw new Error("Timed out waiting for Chrome remote debugging endpoint.");
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
  await rm(path, { recursive: true, force: true });
}

async function createTarget(port, url) {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error(`Could not create Chrome target: ${response.status}`);
  }
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
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolveCommand, rejectCommand) => {
      pending.set(id, { resolveCommand, rejectCommand });
      ws.send(payload);
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

  return {
    ready,
    command,
    waitFor,
    close: () => ws.close(),
  };
}

function pageAuditExpression(expectedImagePath) {
  return `(() => {
    const expectedImagePath = ${JSON.stringify(expectedImagePath)};
    const article = document.querySelector("article") || document.body;
    const images = Array.from(article.querySelectorAll("img")).map(img => {
      const rect = img.getBoundingClientRect();
      return {
        src: new URL(img.currentSrc || img.src, location.href).pathname,
        alt: img.getAttribute("alt") || "",
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom)
        }
      };
    });
    const expected = images.find(image => image.src === expectedImagePath);
    const h1 = document.querySelector("h1");
    const h1Rect = h1 ? h1.getBoundingClientRect() : null;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const overflowX = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth
    ) - window.innerWidth;
    const badWideElements = Array.from(document.querySelectorAll("article *"))
      .filter(element => {
        const rect = element.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return false;
        return rect.left < -2 || rect.right > window.innerWidth + 2;
      })
      .slice(0, 8)
      .map(element => ({
        tag: element.tagName.toLowerCase(),
        text: (element.textContent || "").trim().slice(0, 80),
        rect: {
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
          width: Math.round(element.getBoundingClientRect().width)
        }
      }));
    const topText = (document.body.innerText || "").trim().replace(/\\s+/g, " ").slice(0, 700);
    return {
      title: document.title,
      h1: h1 ? h1.innerText.trim() : "",
      h1InFirstViewport: Boolean(h1Rect && h1Rect.top >= 0 && h1Rect.top < window.innerHeight),
      topTextLength: topText.length,
      overflowX,
      badWideElements,
      images,
      expectedImage: expected || null,
      expectedImageVisible: Boolean(
        expected &&
        expected.complete &&
        expected.naturalWidth >= 300 &&
        expected.naturalHeight >= 150 &&
        expected.rect.width >= 220 &&
        expected.rect.height >= 100
      ),
      expectedImageInFirstScreen: Boolean(
        expected &&
        expected.rect.top < window.innerHeight &&
        expected.rect.bottom > 0
      ),
      viewport
    };
  })()`;
}

async function auditPage(chromePort, baseUrl, outputDir, contract, viewport) {
  const url = `${baseUrl}/posts/${contract.slug}/`;
  const target = await createTarget(chromePort, url);
  const cdp = openCdp(target.webSocketDebuggerUrl);
  await cdp.ready;

  try {
    await cdp.command("Page.enable");
    await cdp.command("Runtime.enable");
    await cdp.command("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.mobile ? 2 : 1,
      mobile: viewport.mobile,
    });

    const loaded = cdp.waitFor("Page.loadEventFired", 12000);
    await cdp.command("Page.navigate", { url });
    await loaded;
    await new Promise(resolveDelay => setTimeout(resolveDelay, 500));

    const evaluation = await cdp.command("Runtime.evaluate", {
      expression: pageAuditExpression(contract.image),
      returnByValue: true,
      awaitPromise: true,
    });
    const audit = evaluation.result.result.value;

    const screenshot = await cdp.command("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    const screenshotPath = join(outputDir, `${contract.slug}-${viewport.name}.png`);
    await writeFile(screenshotPath, Buffer.from(screenshot.result.data, "base64"));

    const failures = [];
    if (!audit.h1InFirstViewport) failures.push("h1 is not visible in the first viewport");
    if (audit.topTextLength < 120) failures.push("first viewport has too little readable text");
    if (audit.overflowX > 2) failures.push(`page has horizontal overflow of ${audit.overflowX}px`);
    if (audit.badWideElements.length > 0) failures.push("article elements overflow the viewport");
    if (!audit.expectedImage) failures.push(`expected image is missing: ${contract.image}`);
    if (!audit.expectedImageVisible) failures.push(`expected image did not render visibly: ${contract.image}`);

    return {
      slug: contract.slug,
      viewport: viewport.name,
      url,
      screenshotPath,
      audit,
      failures,
    };
  } finally {
    cdp.close();
  }
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    throw new Error("dist does not exist. Run npm run build before verify:rendered-pages.");
  }
  if (typeof WebSocket === "undefined") {
    throw new Error("This Node runtime does not expose WebSocket. Use Node 22 or newer.");
  }

  const contracts = JSON.parse(await readFile(CONTRACT_PATH, "utf8"));
  const outputDir = resolve(SCREENSHOT_ROOT, "latest");
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const { server, port: sitePort } = await serveDist();
  const chromePort = await freePort();
  const chromeUserData = await mkdtemp(join(resolve(SCREENSHOT_ROOT), "chrome-profile-"));
  const chrome = spawn(findChrome(), [
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${chromeUserData}`,
    "about:blank",
  ], {
    stdio: "ignore",
  });

  const results = [];
  const failures = [];

  try {
    await waitForChrome(chromePort);
    const baseUrl = `http://127.0.0.1:${sitePort}`;
    for (const contract of contracts) {
      for (const viewport of VIEWPORTS) {
        const result = await auditPage(chromePort, baseUrl, outputDir, contract, viewport);
        results.push(result);
        for (const failure of result.failures) {
          failures.push(`${contract.slug} (${viewport.name}): ${failure}`);
        }
      }
    }

    const summary = {
      generatedAt: new Date().toISOString(),
      screenshotsDir: outputDir,
      postsChecked: contracts.length,
      viewportsChecked: results.length,
      failures,
      results,
    };
    await writeFile(join(outputDir, "summary.json"), JSON.stringify(summary, null, 2));

    process.stdout.write(`rendered_page_posts_checked=${contracts.length}\n`);
    process.stdout.write(`rendered_page_viewports_checked=${results.length}\n`);
    process.stdout.write(`rendered_page_screenshots_dir=${outputDir}\n`);

    if (failures.length > 0) {
      process.stderr.write("Rendered page verification failed.\n");
      for (const failure of failures) process.stderr.write(`- ${failure}\n`);
      process.stdout.write("rendered_page_gate=fail\n");
      return 1;
    }

    process.stdout.write("rendered_page_gate=pass\n");
    return 0;
  } finally {
    server.close();
    if (!chrome.killed) chrome.kill();
    await new Promise(resolveDelay => setTimeout(resolveDelay, 500));
    await removeWithRetry(chromeUserData);
  }
}

try {
  process.exitCode = await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

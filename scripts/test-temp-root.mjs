import { existsSync } from "node:fs";
import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const LOCAL_COMPANY_TEMP = String.raw`F:\Aisaak\CompanyArtifacts\test-temp\vibecode-node`;

function resolveBaseTempDir() {
  if (process.env.VIBECODE_TEST_TEMP_DIR) {
    return process.env.VIBECODE_TEST_TEMP_DIR;
  }

  if (process.env.TEST_TEMP_DIR) {
    return process.env.TEST_TEMP_DIR;
  }

  if (existsSync(String.raw`F:\Aisaak\CompanyArtifacts`)) {
    return LOCAL_COMPANY_TEMP;
  }

  return tmpdir();
}

export async function makeTestTempDir(prefix) {
  const baseDir = resolveBaseTempDir();
  await mkdir(baseDir, { recursive: true });
  return mkdtemp(join(baseDir, prefix));
}

import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Ensure DIRECT_URL fallback before generate
await import(pathToFileURL(path.join(process.cwd(), "scripts", "prisma-env.mjs")).href);

const root = process.cwd();
const isWindows = os.platform() === "win32";

function runGenerate() {
  execSync("npx prisma generate", {
    stdio: "inherit",
    cwd: root,
    env: process.env,
    shell: true,
  });
}

if (!isWindows) {
  try {
    runGenerate();
    console.log("Prisma Client generate muvaffaqiyatli yakunlandi.");
    process.exit(0);
  } catch (error) {
    console.error("Prisma generate failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

const clientDir = path.join(root, "node_modules", ".prisma", "client");
const maxAttempts = 5;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function cleanTmpFiles() {
  if (!fs.existsSync(clientDir)) return;
  for (const name of fs.readdirSync(clientDir)) {
    if (name.includes(".tmp") || name.endsWith(".tmp")) {
      try {
        fs.unlinkSync(path.join(clientDir, name));
      } catch {
        // ignore locked tmp files
      }
    }
  }
}

function removeEngineFiles() {
  if (!fs.existsSync(clientDir)) return;
  for (const name of fs.readdirSync(clientDir)) {
    if (name.startsWith("query_engine") || name.endsWith(".node")) {
      try {
        fs.unlinkSync(path.join(clientDir, name));
      } catch {
        // file may still be briefly locked
      }
    }
  }
}

let lastError = null;

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  try {
    cleanTmpFiles();
    if (attempt > 1) {
      removeEngineFiles();
      sleep(800 * attempt);
    }

    runGenerate();
    console.log("Prisma Client generate muvaffaqiyatli yakunlandi.");
    process.exit(0);
  } catch (error) {
    lastError = error;
    const message = String(error?.stderr || error?.message || error);
    console.warn(`Prisma generate urinish ${attempt}/${maxAttempts} muvaffaqiyatsiz.`);
    if (!/EPERM|operation not permitted|rename/i.test(message) && attempt === maxAttempts) {
      break;
    }
  }
}

console.error(
  "Prisma generate yakunlanmadi. Next/dev server yoki boshqa Node jarayonini to‘xtating va qayta urinib ko‘ring."
);
if (lastError) {
  console.error(lastError.message || lastError);
}
process.exit(1);

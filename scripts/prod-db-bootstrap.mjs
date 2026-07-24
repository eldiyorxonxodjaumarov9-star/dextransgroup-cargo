/**
 * Production DB bootstrap for Vercel builds:
 * - map Neon env aliases
 * - prisma migrate deploy (baseline if schema already exists)
 * - safe admin upsert (no seed)
 */
import { spawnSync } from "node:child_process";
import "./prisma-env.mjs";

function isBad(value) {
  if (!value) return true;
  const v = String(value).trim();
  if (!v.startsWith("postgres://") && !v.startsWith("postgresql://")) return true;
  return (
    v.includes("localhost") ||
    v.includes("127.0.0.1") ||
    v.includes("user:pass@") ||
    v === "[SENSITIVE]"
  );
}

function run(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: true,
    env: process.env,
    cwd: process.cwd(),
  });
}

if (isBad(process.env.DATABASE_URL)) {
  console.warn(
    "[prod-db] Skipping migrate/admin: DATABASE_URL is missing or placeholder."
  );
  process.exit(0);
}

console.log("[prod-db] Running prisma migrate deploy...");
let migrate = run("npx", ["prisma", "migrate", "deploy"]);
process.stdout.write(migrate.stdout || "");
process.stderr.write(migrate.stderr || "");

const combined = `${migrate.stdout || ""}${migrate.stderr || ""}`;
if ((migrate.status ?? 1) !== 0 && combined.includes("P3005")) {
  console.warn(
    "[prod-db] Database not empty — baselining existing schema as applied..."
  );
  const resolve = run("npx", [
    "prisma",
    "migrate",
    "resolve",
    "--applied",
    "20260725000000_init",
  ]);
  process.stdout.write(resolve.stdout || "");
  process.stderr.write(resolve.stderr || "");
  if ((resolve.status ?? 1) !== 0) {
    process.exit(resolve.status ?? 1);
  }

  console.log("[prod-db] Re-running prisma migrate deploy...");
  migrate = run("npx", ["prisma", "migrate", "deploy"]);
  process.stdout.write(migrate.stdout || "");
  process.stderr.write(migrate.stderr || "");
}

if ((migrate.status ?? 1) !== 0) {
  process.exit(migrate.status ?? 1);
}

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.warn("[prod-db] Skipping admin upsert: ADMIN_* missing.");
  process.exit(0);
}

console.log("[prod-db] Running safe admin upsert...");
const admin = spawnSync("npx", ["tsx", "scripts/upsert-admin.ts"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
  cwd: process.cwd(),
});
process.exit(admin.status ?? 1);

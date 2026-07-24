/**
 * Production DB bootstrap for Vercel builds:
 * - map Neon env aliases
 * - prisma migrate deploy
 * - safe admin upsert (no seed)
 *
 * Skips quietly when DB URL is still a localhost placeholder.
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

if (isBad(process.env.DATABASE_URL)) {
  console.warn(
    "[prod-db] Skipping migrate/admin: DATABASE_URL is missing or placeholder."
  );
  process.exit(0);
}

console.log("[prod-db] Running prisma migrate deploy...");
const migrate = spawnSync(
  "npx",
  ["prisma", "migrate", "deploy"],
  { stdio: "inherit", shell: true, env: process.env, cwd: process.cwd() }
);
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

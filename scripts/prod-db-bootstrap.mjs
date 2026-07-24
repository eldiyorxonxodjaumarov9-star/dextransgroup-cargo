/**
 * Production DB bootstrap for Vercel builds:
 * - map Neon env aliases
 * - ensure Prisma migrations are really applied
 * - safe admin upsert (no seed, no destructive db push)
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

function run(args) {
  return spawnSync("npx", ["prisma", ...args], {
    encoding: "utf8",
    shell: true,
    env: process.env,
    cwd: process.cwd(),
  });
}

function print(result) {
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function migrateDeploy() {
  console.log("[prod-db] Running prisma migrate deploy...");
  return run(["migrate", "deploy"]);
}

if (isBad(process.env.DATABASE_URL)) {
  console.warn(
    "[prod-db] Skipping migrate/admin: DATABASE_URL is missing or placeholder."
  );
  process.exit(0);
}

let migrate = migrateDeploy();
let text = print(migrate);

if ((migrate.status ?? 1) !== 0 && text.includes("P3005")) {
  console.warn(
    "[prod-db] DB not empty and unbaselined — applying init SQL directly, then marking applied..."
  );
  const exec = run([
    "db",
    "execute",
    "--file",
    "prisma/migrations/20260725000000_init/migration.sql",
  ]);
  text = print(exec);
  if ((exec.status ?? 1) !== 0 && !/already exists/i.test(text)) {
    process.exit(exec.status ?? 1);
  }

  const applied = run([
    "migrate",
    "resolve",
    "--applied",
    "20260725000000_init",
  ]);
  print(applied);
  migrate = migrateDeploy();
  print(migrate);
}

if ((migrate.status ?? 1) !== 0) {
  process.exit(migrate.status ?? 1);
}

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.warn("[prod-db] Skipping admin upsert: ADMIN_* missing.");
  process.exit(0);
}

function upsertAdmin() {
  console.log("[prod-db] Running safe admin upsert...");
  return spawnSync("npx", ["tsx", "scripts/upsert-admin.ts"], {
    encoding: "utf8",
    shell: true,
    env: process.env,
    cwd: process.cwd(),
  });
}

let admin = upsertAdmin();
process.stdout.write(admin.stdout || "");
process.stderr.write(admin.stderr || "");
let adminText = `${admin.stdout || ""}${admin.stderr || ""}`;

if (
  (admin.status ?? 1) !== 0 &&
  /does not exist in the current database/i.test(adminText)
) {
  console.warn(
    "[prod-db] Core tables missing — migration was baselined without apply. Re-applying init SQL..."
  );

  // Undo false baseline, apply SQL, then re-mark applied.
  print(
    run(["migrate", "resolve", "--rolled-back", "20260725000000_init"])
  );
  const exec = run([
    "db",
    "execute",
    "--file",
    "prisma/migrations/20260725000000_init/migration.sql",
  ]);
  text = print(exec);
  if ((exec.status ?? 1) !== 0 && !/already exists/i.test(text)) {
    process.exit(exec.status ?? 1);
  }
  print(run(["migrate", "resolve", "--applied", "20260725000000_init"]));

  admin = upsertAdmin();
  process.stdout.write(admin.stdout || "");
  process.stderr.write(admin.stderr || "");
  adminText = `${admin.stdout || ""}${admin.stderr || ""}`;
}

if ((admin.status ?? 1) !== 0) {
  console.error("[prod-db] Admin upsert failed.");
  process.exit(admin.status ?? 1);
}

process.exit(0);

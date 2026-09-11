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

function failedMigrationName(text) {
  const m =
    text.match(/The `([^`]+)` migration/) ||
    text.match(/Migration name: ([^\s]+)/);
  return m?.[1] || null;
}

function resolveRolledBack(name) {
  console.warn(`[prod-db] Marking migration rolled-back: ${name}`);
  return print(run(["migrate", "resolve", "--rolled-back", name]));
}

function ensureCoreTables() {
  console.warn(
    "[prod-db] Ensuring core tables exist (idempotent, non-destructive)..."
  );
  return print(
    run(["db", "execute", "--file", "scripts/ensure-core-tables.sql"])
  );
}

if (isBad(process.env.DATABASE_URL)) {
  console.warn(
    "[prod-db] Skipping migrate/admin: DATABASE_URL is missing or placeholder."
  );
  process.exit(0);
}

let migrate = migrateDeploy();
let text = print(migrate);

// Recover from a previously failed migration record (e.g. interrupted deploy).
if ((migrate.status ?? 1) !== 0 && /P3009|P3018/.test(text)) {
  const failed = failedMigrationName(text);
  if (failed) {
    resolveRolledBack(failed);
  }
  if (/CargoItem|does not exist|42P01/i.test(text)) {
    ensureCoreTables();
  }
  migrate = migrateDeploy();
  text = print(migrate);
}

// Second recovery pass if apply failed again after rollback.
if ((migrate.status ?? 1) !== 0 && /P3009|P3018/.test(text)) {
  const failed = failedMigrationName(text);
  if (failed) resolveRolledBack(failed);
  ensureCoreTables();
  migrate = migrateDeploy();
  text = print(migrate);
}

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

console.log("[prod-db] Seeding warehouses + operators (non-destructive)...");
const catalog = spawnSync("npx", ["tsx", "scripts/seed-warehouses-operators.ts"], {
  encoding: "utf8",
  shell: true,
  env: process.env,
  cwd: process.cwd(),
});
process.stdout.write(catalog.stdout || "");
process.stderr.write(catalog.stderr || "");
if ((catalog.status ?? 1) !== 0) {
  console.error("[prod-db] Catalog upsert failed.");
  process.exit(catalog.status ?? 1);
}

process.exit(0);

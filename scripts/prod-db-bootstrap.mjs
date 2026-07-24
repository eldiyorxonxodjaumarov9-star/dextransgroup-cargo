/**
 * Production DB bootstrap for Vercel builds:
 * - map Neon env aliases
 * - apply schema (migrate deploy, with db push fallback)
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

if (isBad(process.env.DATABASE_URL)) {
  console.warn(
    "[prod-db] Skipping migrate/admin: DATABASE_URL is missing or placeholder."
  );
  process.exit(0);
}

console.log("[prod-db] Running prisma migrate deploy...");
let migrate = run(["migrate", "deploy"]);
let text = print(migrate);

if ((migrate.status ?? 1) !== 0 && text.includes("P3005")) {
  console.warn(
    "[prod-db] Non-empty DB without migration history — syncing schema with db push..."
  );
  const push = run(["db", "push", "--skip-generate"]);
  print(push);
  if ((push.status ?? 1) !== 0) {
    process.exit(push.status ?? 1);
  }

  console.log("[prod-db] Marking init migration as applied...");
  // Clear a wrong prior baseline if present, then mark applied.
  const rolled = run([
    "migrate",
    "resolve",
    "--rolled-back",
    "20260725000000_init",
  ]);
  print(rolled);

  const applied = run([
    "migrate",
    "resolve",
    "--applied",
    "20260725000000_init",
  ]);
  text = print(applied);
  if ((applied.status ?? 1) !== 0 && !text.includes("already recorded")) {
    // If rolled-back failed because it wasn't applied, try applied only once more.
    const applied2 = run([
      "migrate",
      "resolve",
      "--applied",
      "20260725000000_init",
    ]);
    print(applied2);
  }

  migrate = run(["migrate", "deploy"]);
  print(migrate);
}

if ((migrate.status ?? 1) !== 0) {
  console.warn(
    "[prod-db] migrate deploy failed — attempting prisma db push fallback..."
  );
  const push = run(["db", "push", "--skip-generate"]);
  print(push);
  if ((push.status ?? 1) !== 0) {
    process.exit(push.status ?? 1);
  }
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

if ((admin.status ?? 1) !== 0) {
  console.warn("[prod-db] Admin upsert failed — ensuring schema via db push...");
  const push = run(["db", "push", "--skip-generate"]);
  print(push);
  if ((push.status ?? 1) !== 0) {
    process.exit(push.status ?? 1);
  }
  const retry = spawnSync("npx", ["tsx", "scripts/upsert-admin.ts"], {
    stdio: "inherit",
    shell: true,
    env: process.env,
    cwd: process.cwd(),
  });
  process.exit(retry.status ?? 1);
}

process.exit(0);

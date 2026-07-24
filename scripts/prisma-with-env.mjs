import "./prisma-env.mjs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (!args.length) {
  console.error("Usage: node scripts/prisma-with-env.mjs <prisma-args...>");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  shell: true,
  env: process.env,
  cwd: process.cwd(),
});

process.exit(result.status ?? 1);

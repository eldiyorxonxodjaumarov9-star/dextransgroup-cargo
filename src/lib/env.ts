/**
 * Normalize env vars before Prisma Client loads.
 * Vercel often has DATABASE_URL but forgets DIRECT_URL — Prisma 5 requires both
 * when `directUrl` is declared in schema.
 */
export function ensurePrismaEnv() {
  if (process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.DATABASE_URL;
  }
}

ensurePrismaEnv();

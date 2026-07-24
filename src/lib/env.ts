/**
 * Normalize Prisma DB env for Neon + Vercel.
 * Prefer Neon-provided URLs when legacy localhost placeholders remain.
 */
export function ensurePrismaEnv() {
  const isBad = (value?: string) => {
    if (!value) return true;
    const v = value.trim();
    if (!v.startsWith("postgres://") && !v.startsWith("postgresql://")) {
      return true;
    }
    return (
      v.includes("localhost") ||
      v.includes("127.0.0.1") ||
      v.includes("user:pass@") ||
      v === "[SENSITIVE]"
    );
  };

  if (isBad(process.env.DATABASE_URL)) {
    process.env.DATABASE_URL =
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL;
  }

  if (isBad(process.env.DIRECT_URL)) {
    process.env.DIRECT_URL =
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL;
  }

  if (process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.DATABASE_URL;
  }
}

ensurePrismaEnv();

/**
 * Normalize Prisma DB env for Neon + Vercel.
 * Prefer Neon-provided URLs when legacy placeholders remain.
 * Local postgres (localhost / 127.0.0.1) is valid for development.
 */
import { config as loadDotenv } from "dotenv";

loadDotenv();

export function ensurePrismaEnv() {
  const isPlaceholder = (value?: string) => {
    if (!value) return true;
    const v = value.trim();
    if (!v.startsWith("postgres://") && !v.startsWith("postgresql://")) {
      return true;
    }
    return v.includes("user:pass@") || v === "[SENSITIVE]";
  };

  if (isPlaceholder(process.env.DATABASE_URL)) {
    process.env.DATABASE_URL =
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL;
  }

  if (isPlaceholder(process.env.DIRECT_URL)) {
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

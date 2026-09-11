/**
 * Ensure DIRECT_URL / Neon mappings before `prisma generate` / migrate on CI & Vercel.
 * Local postgres URLs are valid; only replace empty/placeholder values with Neon aliases.
 */
function isPlaceholder(value) {
  if (!value) return true;
  const v = String(value).trim();
  if (!v.startsWith("postgres://") && !v.startsWith("postgresql://")) return true;
  return v.includes("user:pass@") || v === "[SENSITIVE]";
}

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
  console.log("[prisma-env] DIRECT_URL fallback = DATABASE_URL");
}

if (
  process.env.DATABASE_URL_UNPOOLED &&
  process.env.DIRECT_URL === process.env.DATABASE_URL &&
  process.env.DATABASE_URL_UNPOOLED !== process.env.DATABASE_URL
) {
  process.env.DIRECT_URL = process.env.DATABASE_URL_UNPOOLED;
  console.log("[prisma-env] DIRECT_URL mapped from DATABASE_URL_UNPOOLED");
}

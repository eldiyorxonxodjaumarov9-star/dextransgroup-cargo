/**
 * Ensure DIRECT_URL / Neon mappings before `prisma generate` / migrate on CI & Vercel.
 * Local postgres URLs are valid locally; on Vercel prefer Neon aliases over localhost.
 */
function isPlaceholder(value) {
  if (!value) return true;
  const v = String(value).trim();
  if (!v.startsWith("postgres://") && !v.startsWith("postgresql://")) return true;
  return v.includes("user:pass@") || v === "[SENSITIVE]";
}

function isLocalHostDb(value) {
  if (!value) return false;
  const v = String(value).trim().toLowerCase();
  return v.includes("localhost") || v.includes("127.0.0.1");
}

const onVercel = Boolean(process.env.VERCEL);
const neonUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING;

if (
  isPlaceholder(process.env.DATABASE_URL) ||
  (isLocalHostDb(process.env.DATABASE_URL) && (onVercel || neonUrl))
) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;
  if (onVercel || neonUrl) {
    console.log("[prisma-env] DATABASE_URL mapped from Neon alias");
  }
}

if (
  isPlaceholder(process.env.DIRECT_URL) ||
  (isLocalHostDb(process.env.DIRECT_URL) && (onVercel || neonUrl))
) {
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

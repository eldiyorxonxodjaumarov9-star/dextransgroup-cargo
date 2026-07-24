/**
 * Ensure DIRECT_URL exists before `prisma generate` / migrate on CI & Vercel.
 */
if (process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
  console.log("[prisma-env] DIRECT_URL fallback = DATABASE_URL");
}

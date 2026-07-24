import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });
config({ path: ".env.local" });

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

const prisma = new PrismaClient();

async function main() {
  const username = (process.env.ADMIN_USERNAME || "").trim();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required."
    );
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  if (isBad(process.env.DATABASE_URL)) {
    throw new Error(
      "DATABASE_URL is still a placeholder/localhost. Set Neon DATABASE_URL (or POSTGRES_PRISMA_URL) on Vercel."
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  const removed = await prisma.adminUser.deleteMany({
    where: { id: { not: admin.id } },
  });

  const count = await prisma.adminUser.count();
  console.log(
    `Admin user upserted successfully (admins=${count}, other admin rows removed: ${removed.count}).`
  );
}

main()
  .catch((error) => {
    console.error("Admin upsert failed.");
    console.error(error instanceof Error ? error.message : "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

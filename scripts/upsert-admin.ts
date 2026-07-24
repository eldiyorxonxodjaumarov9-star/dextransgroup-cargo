import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Load local defaults. Prefer already-exported env (e.g. `vercel env run`).
config({ path: ".env" });
config({ path: ".env.local" });

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

  if (process.env.DATABASE_URL.startsWith("file:")) {
    console.warn(
      "Skipping admin upsert: DATABASE_URL points to a local file database."
    );
    return;
  }

  if (
    !process.env.DATABASE_URL.startsWith("postgresql://") &&
    !process.env.DATABASE_URL.startsWith("postgres://")
  ) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string.");
  }

  // Placeholder localhost URLs cannot receive production admin credentials.
  if (
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1")
  ) {
    console.warn(
      "Skipping admin upsert: DATABASE_URL points to localhost. Set a real hosted PostgreSQL URL in Vercel, then re-run npm run db:admin."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  // Remove other admin usernames so login uses the configured account only.
  // Does not touch cargo, warehouses, operators, or any other tables.
  const removed = await prisma.adminUser.deleteMany({
    where: { id: { not: admin.id } },
  });

  console.log(
    `Admin user upserted successfully (username set, other admin rows removed: ${removed.count}).`
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

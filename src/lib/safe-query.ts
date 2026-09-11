import { Prisma } from "@prisma/client";

export function logServerError(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${scope}]`, message);
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error(
      `[${scope}] Prisma init failed. Check DATABASE_URL / DIRECT_URL and that migrations were applied.`
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`[${scope}] Prisma code:`, error.code);
  }
}

export async function safeQuery<T>(
  scope: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logServerError(scope, error);
    return fallback;
  }
}

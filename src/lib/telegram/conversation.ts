import { prisma } from "@/lib/prisma";

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24h

export type BotMode =
  | "idle"
  | "track_search"
  | "admin_add"
  | "admin_find"
  | "admin_status";

export type BotStep =
  | "track"
  | "name"
  | "category"
  | "status"
  | "warehouse"
  | "operator"
  | "eta"
  | "notes"
  | "preview"
  | "pick_cargo"
  | null;

export type SessionPayload = {
  trackNumber?: string;
  name?: string;
  category?: string;
  status?: string;
  warehouseId?: string;
  warehouseName?: string;
  operatorId?: string;
  operatorName?: string;
  etaDate?: string;
  notes?: string;
  cargoId?: string;
  page?: number;
  region?: string;
};

function parsePayload(raw: string): SessionPayload {
  try {
    const data = JSON.parse(raw || "{}") as SessionPayload;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export async function getSession(telegramUserId: string) {
  const session = await prisma.telegramBotSession.findUnique({
    where: { telegramUserId },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.telegramBotSession.delete({ where: { id: session.id } }).catch(() => null);
    return null;
  }
  return {
    ...session,
    payload: parsePayload(session.payloadJson),
    mode: session.mode as BotMode,
    step: (session.step as BotStep) || null,
  };
}

export async function upsertSession(options: {
  telegramUserId: string;
  chatId: string;
  mode: BotMode;
  step?: BotStep;
  payload?: SessionPayload;
}) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const payloadJson = JSON.stringify(options.payload || {});
  return prisma.telegramBotSession.upsert({
    where: { telegramUserId: options.telegramUserId },
    create: {
      telegramUserId: options.telegramUserId,
      chatId: String(options.chatId),
      mode: options.mode,
      step: options.step || null,
      payloadJson,
      expiresAt,
    },
    update: {
      chatId: String(options.chatId),
      mode: options.mode,
      step: options.step || null,
      payloadJson,
      expiresAt,
    },
  });
}

export async function patchSession(
  telegramUserId: string,
  patch: {
    mode?: BotMode;
    step?: BotStep;
    payload?: SessionPayload;
    chatId?: string;
  }
) {
  const current = await getSession(telegramUserId);
  const payload = { ...(current?.payload || {}), ...(patch.payload || {}) };
  return upsertSession({
    telegramUserId,
    chatId: patch.chatId || current?.chatId || "0",
    mode: patch.mode || current?.mode || "idle",
    step: patch.step === undefined ? current?.step || null : patch.step,
    payload,
  });
}

export async function clearSession(telegramUserId: string) {
  await prisma.telegramBotSession
    .delete({ where: { telegramUserId } })
    .catch(() => null);
}

export async function claimProcessedUpdate(updateId: number): Promise<boolean> {
  try {
    await prisma.telegramProcessedUpdate.create({
      data: { updateId: BigInt(updateId) },
    });
    return true;
  } catch {
    return false;
  }
}

/** Batch delete expired conversation sessions (cron-safe). */
export async function cleanupExpiredSessions() {
  const result = await prisma.telegramBotSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return { deleted: result.count };
}

/** Optional housekeeping for very old processed update ids. */
export async function cleanupOldProcessedUpdates(olderThanDays = 14) {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  const result = await prisma.telegramProcessedUpdate.deleteMany({
    where: { processedAt: { lt: cutoff } },
  });
  return { deleted: result.count };
}

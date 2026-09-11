import { prisma } from "@/lib/prisma";
import type { CargoStatus } from "@/lib/types";
import { sendMessage } from "@/lib/telegram/bot-api";
import { statusChangedNotice } from "@/lib/telegram/messages";

export const NOTIFICATION_MAX_ATTEMPTS = 5;
export const PROCESSING_STALE_MS = 1000 * 60 * 2; // 2 minutes

export function computeNextAttemptAt(attemptsAfterFailure: number, from = new Date()) {
  // 30s, 60s, 120s, 240s, 480s … capped at 1h
  const delayMs = Math.min(
    30_000 * Math.pow(2, Math.max(0, attemptsAfterFailure - 1)),
    60 * 60 * 1000
  );
  return new Date(from.getTime() + delayMs);
}

export async function subscribeToCargo(options: {
  telegramUserId: string;
  chatId: string;
  cargoItemId: string;
}) {
  const sub = await prisma.telegramCargoSubscription.upsert({
    where: {
      telegramUserId_cargoItemId: {
        telegramUserId: options.telegramUserId,
        cargoItemId: options.cargoItemId,
      },
    },
    create: {
      telegramUserId: options.telegramUserId,
      chatId: String(options.chatId),
      cargoItemId: options.cargoItemId,
      isActive: true,
    },
    update: {
      chatId: String(options.chatId),
      isActive: true,
    },
  });
  return sub;
}

export async function isSubscribed(telegramUserId: string, cargoItemId: string) {
  const sub = await prisma.telegramCargoSubscription.findUnique({
    where: {
      telegramUserId_cargoItemId: {
        telegramUserId,
        cargoItemId,
      },
    },
  });
  return Boolean(sub?.isActive);
}

export async function enqueueStatusChangeNotifications(options: {
  cargo: {
    id: string;
    trackNumber: string;
    name: string;
    status: string;
    warehouse?: { name?: string | null; city?: string | null } | null;
  };
  previousStatus: CargoStatus;
  nextStatus: CargoStatus;
}) {
  if (options.previousStatus === options.nextStatus) return { created: 0 };

  const subs = await prisma.telegramCargoSubscription.findMany({
    where: { cargoItemId: options.cargo.id, isActive: true },
  });
  if (!subs.length) return { created: 0 };

  const origin =
    options.cargo.warehouse?.city || options.cargo.warehouse?.name || undefined;
  const text = statusChangedNotice({
    trackNumber: options.cargo.trackNumber,
    name: options.cargo.name,
    status: options.nextStatus,
    origin,
  });

  await prisma.telegramNotificationEvent.createMany({
    data: subs.map((sub) => ({
      type: "STATUS_CHANGE",
      cargoItemId: options.cargo.id,
      subscriptionId: sub.id,
      chatId: sub.chatId,
      telegramUserId: sub.telegramUserId,
      payloadJson: JSON.stringify({ text, status: options.nextStatus }),
      status: "PENDING",
      nextAttemptAt: new Date(),
    })),
  });

  // Best-effort immediate delivery; cron retries the rest
  void processTelegramNotificationBatch(40).catch((error) => {
    console.error("[telegram-subscriptions] immediate flush failed", error);
  });

  return { created: subs.length };
}

async function recoverStaleProcessing() {
  const staleBefore = new Date(Date.now() - PROCESSING_STALE_MS);
  await prisma.telegramNotificationEvent.updateMany({
    where: {
      status: "PROCESSING",
      lockedAt: { lt: staleBefore },
    },
    data: {
      status: "PENDING",
      lockedAt: null,
      nextAttemptAt: new Date(),
    },
  });
}

/**
 * Atomically claim one due PENDING event for this worker.
 * Prevents double-send across concurrent cron invocations.
 */
export async function claimNextNotificationEvent() {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const candidates = await tx.telegramNotificationEvent.findMany({
      where: {
        status: "PENDING",
        attempts: { lt: NOTIFICATION_MAX_ATTEMPTS },
        nextAttemptAt: { lte: now },
      },
      orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
      take: 8,
    });

    for (const candidate of candidates) {
      const claimed = await tx.telegramNotificationEvent.updateMany({
        where: {
          id: candidate.id,
          status: "PENDING",
          attempts: candidate.attempts,
        },
        data: {
          status: "PROCESSING",
          lockedAt: now,
        },
      });
      if (claimed.count === 1) {
        return candidate;
      }
    }
    return null;
  });
}

export async function processClaimedNotification(
  event: {
    id: string;
    chatId: string;
    payloadJson: string;
    attempts: number;
  },
  send: typeof sendMessage = sendMessage
) {
  try {
    const payload = JSON.parse(event.payloadJson) as { text?: string };
    const text = payload.text || "📦 Holat yangilandi.";
    await send(event.chatId, text);
    await prisma.telegramNotificationEvent.update({
      where: { id: event.id },
      data: {
        status: "SENT",
        attempts: event.attempts + 1,
        sentAt: new Date(),
        lastError: null,
        lockedAt: null,
        nextAttemptAt: new Date(),
      },
    });
    return { ok: true as const };
  } catch (error) {
    const nextAttempts = event.attempts + 1;
    const permanent = nextAttempts >= NOTIFICATION_MAX_ATTEMPTS;
    const message =
      error instanceof Error ? error.message.slice(0, 400) : "send failed";
    await prisma.telegramNotificationEvent.update({
      where: { id: event.id },
      data: {
        status: permanent ? "FAILED" : "PENDING",
        attempts: nextAttempts,
        lastError: message,
        lockedAt: null,
        nextAttemptAt: permanent
          ? new Date()
          : computeNextAttemptAt(nextAttempts),
      },
    });
    return { ok: false as const, permanent, error: message };
  }
}

export async function processTelegramNotificationBatch(limit = 20) {
  await recoverStaleProcessing();

  let processed = 0;
  let sent = 0;
  let failed = 0;
  let permanentFailed = 0;

  for (let i = 0; i < limit; i += 1) {
    const event = await claimNextNotificationEvent();
    if (!event) break;
    processed += 1;
    const result = await processClaimedNotification(event);
    if (result.ok) sent += 1;
    else {
      failed += 1;
      if (result.permanent) permanentFailed += 1;
    }
  }

  return { processed, sent, failed, permanentFailed };
}

/** @deprecated use processTelegramNotificationBatch */
export async function flushPendingNotifications(limit = 20) {
  return processTelegramNotificationBatch(limit);
}

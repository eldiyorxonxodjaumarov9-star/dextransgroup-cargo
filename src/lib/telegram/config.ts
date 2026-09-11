/**
 * Telegram server env helpers.
 * Missing token must NOT break Next.js build — only fail at runtime when used.
 */

export function getTelegramBotToken(): string | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return token || null;
}

export function getTelegramWebhookSecret(): string | null {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  return secret || null;
}

export function getTelegramBotUsername(): string | null {
  const raw =
    process.env.TELEGRAM_BOT_USERNAME?.trim() ||
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() ||
    "";
  if (!raw) return null;
  return raw.replace(/^@/, "");
}

export function getCronSecret(): string | null {
  const secret = process.env.CRON_SECRET?.trim();
  return secret || null;
}

export function getAppUrl(): string | null {
  const raw =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL.trim()}`
      : "");
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

export function requireTelegramRuntimeConfig(): {
  botToken: string;
  webhookSecret: string;
  appUrl: string;
} {
  const botToken = getTelegramBotToken();
  const webhookSecret = getTelegramWebhookSecret();
  const appUrl = getAppUrl();

  if (!botToken || !webhookSecret || !appUrl) {
    const missing = [
      !botToken && "TELEGRAM_BOT_TOKEN",
      !webhookSecret && "TELEGRAM_WEBHOOK_SECRET",
      !appUrl && "APP_URL",
    ].filter(Boolean);
    throw new Error(`Telegram is not configured: missing ${missing.join(", ")}`);
  }

  return { botToken, webhookSecret, appUrl };
}

export function parseTelegramAdminIds(
  raw = process.env.TELEGRAM_ADMIN_IDS
): string[] {
  if (!raw || !raw.trim()) return [];
  const ids: string[] = [];
  for (const part of raw.split(",")) {
    const id = part.trim();
    if (!id) continue;
    if (!/^\d+$/.test(id)) {
      throw new Error(`Invalid TELEGRAM_ADMIN_IDS entry: ${id}`);
    }
    // Telegram user ids fit in signed 64-bit; keep as decimal string
    if (id === "0") {
      throw new Error("Invalid TELEGRAM_ADMIN_IDS entry: 0");
    }
    ids.push(id);
  }
  return ids;
}

export function isTelegramAdminId(
  userId: number | string,
  adminIds = parseTelegramAdminIds()
): boolean {
  const id = String(userId);
  if (!/^\d+$/.test(id) || id === "0") return false;
  return adminIds.includes(id);
}

export function telegramSessionIdentity(telegramUserId: number | string) {
  const id = String(telegramUserId);
  return {
    userId: `tg:${id}`,
    username: `tg:${id}`,
  };
}

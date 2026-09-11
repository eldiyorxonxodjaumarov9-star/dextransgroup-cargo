import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  getAppUrl,
  getTelegramBotToken,
  getTelegramWebhookSecret,
  parseTelegramAdminIds,
} from "@/lib/telegram/config";
import { sanitizeTelegramApiError } from "@/lib/telegram/bot-api";
import { claimProcessedUpdate } from "@/lib/telegram/conversation";
import {
  handleTelegramUpdate,
  type TelegramUpdate,
} from "@/lib/telegram/webhook";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64_000;

function safeEqualString(a: string, b: string) {
  try {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    if (left.length === 0 || left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const webhookSecret = getTelegramWebhookSecret();
  const botToken = getTelegramBotToken();
  const appUrl = getAppUrl();

  if (!webhookSecret || !botToken || !appUrl) {
    return NextResponse.json(
      { error: "Telegram webhook is not configured" },
      { status: 503 }
    );
  }

  const headerSecret =
    request.headers.get("x-telegram-bot-api-secret-token") || "";
  if (!safeEqualString(headerSecret, webhookSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    if (typeof update.update_id === "number") {
      const claimed = await claimProcessedUpdate(update.update_id);
      if (!claimed) {
        return NextResponse.json({ ok: true, deduped: true });
      }
    }

    let adminIds: string[] = [];
    try {
      adminIds = parseTelegramAdminIds();
    } catch (error) {
      console.error(
        "[telegram-webhook] invalid TELEGRAM_ADMIN_IDS",
        sanitizeTelegramApiError(error)
      );
    }

    await handleTelegramUpdate({
      update,
      appUrl,
      botToken,
      adminIds,
    });
  } catch (error) {
    console.error("[telegram-webhook]", sanitizeTelegramApiError(error));
  }

  return NextResponse.json({ ok: true });
}

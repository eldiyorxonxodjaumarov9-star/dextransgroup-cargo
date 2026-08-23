import { NextResponse } from "next/server";
import { attachAdminSessionCookie } from "@/lib/auth";
import { getTelegramBotToken, isTelegramAdminId, parseTelegramAdminIds, telegramSessionIdentity } from "@/lib/telegram/config";
import { consumeRateLimit } from "@/lib/telegram/rate-limit";
import {
  InitDataValidationError,
  validateTelegramInitData,
} from "@/lib/telegram/validate-init-data";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8_192;
const MAX_INIT_DATA_CHARS = 4_096;

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  try {
    const limited = consumeRateLimit(
      `tg-auth:${clientKey(request)}`,
      20,
      60_000
    );
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const botToken = getTelegramBotToken();
    if (!botToken) {
      return NextResponse.json(
        { error: "Telegram auth is not configured" },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const initData =
      body &&
      typeof body === "object" &&
      "initData" in body &&
      typeof (body as { initData: unknown }).initData === "string"
        ? (body as { initData: string }).initData
        : "";

    if (!initData.trim()) {
      return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    }
    if (initData.length > MAX_INIT_DATA_CHARS) {
      return NextResponse.json({ error: "initData too large" }, { status: 413 });
    }

    let validated;
    try {
      validated = validateTelegramInitData(initData, botToken);
    } catch (error) {
      if (error instanceof InitDataValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let adminIds: string[];
    try {
      adminIds = parseTelegramAdminIds();
    } catch {
      return NextResponse.json(
        { error: "Admin allowlist is misconfigured" },
        { status: 503 }
      );
    }

    if (!isTelegramAdminId(validated.user.id, adminIds)) {
      return NextResponse.json(
        { error: "Sizda admin ruxsati mavjud emas" },
        { status: 403 }
      );
    }

    const identity = telegramSessionIdentity(validated.user.id);
    const response = NextResponse.json({
      ok: true,
      username: identity.username,
    });
    attachAdminSessionCookie(response, identity.userId, identity.username);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Telegram auth failed" },
      { status: 500 }
    );
  }
}

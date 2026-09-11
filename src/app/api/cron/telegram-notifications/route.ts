import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { cleanupExpiredSessions, cleanupOldProcessedUpdates } from "@/lib/telegram/conversation";
import { processTelegramNotificationBatch } from "@/lib/telegram/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getCronSecret() {
  return process.env.CRON_SECRET?.trim() || null;
}

function authorized(request: Request) {
  const secret = getCronSecret();
  if (!secret) return false;

  const header =
    request.headers.get("authorization") ||
    request.headers.get("x-cron-secret") ||
    "";

  const bearer = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : header.trim();

  try {
    const left = Buffer.from(bearer);
    const right = Buffer.from(secret);
    if (!left.length || left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

async function runCron() {
  const notifications = await processTelegramNotificationBatch(40);
  const sessions = await cleanupExpiredSessions();
  const processed = await cleanupOldProcessedUpdates(14);
  return {
    ok: true,
    notifications,
    sessions,
    processedUpdates: processed,
  };
}

/**
 * Vercel Cron / external scheduler endpoint.
 * Secure with CRON_SECRET via Authorization: Bearer <secret>
 * or x-cron-secret: <secret>
 */
export async function POST(request: Request) {
  if (!getCronSecret()) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runCron();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[cron/telegram-notifications]", error);
    return NextResponse.json(
      { error: "Notification cron failed" },
      { status: 500 }
    );
  }
}

/** Vercel Cron may invoke GET */
export async function GET(request: Request) {
  return POST(request);
}

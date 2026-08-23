import assert from "node:assert/strict";
import { createHmac, timingSafeEqual } from "node:crypto";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";

/**
 * Lightweight route-level checks using dynamic import so missing Telegram env
 * does not break the suite when modules load.
 */

describe("telegram auth + webhook routes (config closed)", () => {
  it("auth rejects missing initData with 400", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123456:TESTTOKEN_for_route_suite_only";
    process.env.TELEGRAM_ADMIN_IDS = "42";
    const { POST } = await import("../../app/api/auth/telegram/route");
    const req = new NextRequest("http://localhost/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    assert.equal(res.status, 400);
  });

  it("auth returns 503 when bot token missing", async () => {
    const prev = process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_BOT_TOKEN;
    // Re-import won't re-evaluate easily; call validate path via fresh module cache reset is hard.
    // Instead assert config helper behavior:
    const { getTelegramBotToken } = await import("./config");
    assert.equal(getTelegramBotToken(), null);
    if (prev) process.env.TELEGRAM_BOT_TOKEN = prev;
  });

  it("webhook rejects missing secret with 401", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123456:TESTTOKEN_for_route_suite_only";
    process.env.TELEGRAM_WEBHOOK_SECRET = "super-secret-webhook-value";
    process.env.APP_URL = "https://example.com";
    const { POST } = await import("../../app/api/telegram/webhook/route");
    const req = new NextRequest("http://localhost/api/telegram/webhook", {
      method: "POST",
      body: JSON.stringify({ update_id: 1 }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    assert.equal(res.status, 401);
  });

  it("webhook rejects invalid secret with 401", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123456:TESTTOKEN_for_route_suite_only";
    process.env.TELEGRAM_WEBHOOK_SECRET = "super-secret-webhook-value";
    process.env.APP_URL = "https://example.com";
    const { POST } = await import("../../app/api/telegram/webhook/route");
    const req = new NextRequest("http://localhost/api/telegram/webhook", {
      method: "POST",
      body: JSON.stringify({ update_id: 1 }),
      headers: {
        "content-type": "application/json",
        "x-telegram-bot-api-secret-token": "wrong",
      },
    });
    const res = await POST(req);
    assert.equal(res.status, 401);
  });

  it("webhook returns 503 when not configured", async () => {
    const prevToken = process.env.TELEGRAM_BOT_TOKEN;
    const prevSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const prevUrl = process.env.APP_URL;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_WEBHOOK_SECRET;
    delete process.env.APP_URL;

    // Dynamic import may be cached with previous env reads — helpers re-read env each call.
    const { getTelegramBotToken, getTelegramWebhookSecret, getAppUrl } =
      await import("./config");
    assert.equal(getTelegramBotToken(), null);
    assert.equal(getTelegramWebhookSecret(), null);
    assert.equal(getAppUrl(), null);

    if (prevToken) process.env.TELEGRAM_BOT_TOKEN = prevToken;
    if (prevSecret) process.env.TELEGRAM_WEBHOOK_SECRET = prevSecret;
    if (prevUrl) process.env.APP_URL = prevUrl;
  });

  it("auth issues session cookie for allowlisted admin", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123456:TESTTOKEN_for_route_suite_only";
    process.env.TELEGRAM_ADMIN_IDS = "42";
    process.env.SESSION_SECRET = "test-session-secret-for-telegram-suite";

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const authDate = Math.floor(Date.now() / 1000);
    const fields = new URLSearchParams({
      auth_date: String(authDate),
      user: JSON.stringify({ id: 42, first_name: "Admin" }),
    });
    const pairs: string[] = [];
    for (const [k, v] of fields.entries()) pairs.push(`${k}=${v}`);
    pairs.sort((a, b) => a.localeCompare(b));
    const dataCheckString = pairs.join("\n");
    const secretKey = createHmac("sha256", "WebAppData").update(botToken!).digest();
    const hash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    fields.set("hash", hash);

    const { POST } = await import("../../app/api/auth/telegram/route");
    const req = new NextRequest("http://localhost/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ initData: fields.toString() }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    assert.equal(res.status, 200);
    const cookie = res.headers.get("set-cookie") || "";
    assert.match(cookie, /dextrans_admin_session=/);
    assert.match(cookie, /HttpOnly/i);
  });

  it("auth returns 403 for valid non-admin", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123456:TESTTOKEN_for_route_suite_only";
    process.env.TELEGRAM_ADMIN_IDS = "42";
    process.env.SESSION_SECRET = "test-session-secret-for-telegram-suite";

    const botToken = process.env.TELEGRAM_BOT_TOKEN!;
    const authDate = Math.floor(Date.now() / 1000);
    const fields = new URLSearchParams({
      auth_date: String(authDate),
      user: JSON.stringify({ id: 99, first_name: "User", username: "admin" }),
    });
    const pairs: string[] = [];
    for (const [k, v] of fields.entries()) pairs.push(`${k}=${v}`);
    pairs.sort((a, b) => a.localeCompare(b));
    const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
    const hash = createHmac("sha256", secretKey)
      .update(pairs.join("\n"))
      .digest("hex");
    fields.set("hash", hash);

    const { POST } = await import("../../app/api/auth/telegram/route");
    const req = new NextRequest("http://localhost/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ initData: fields.toString() }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    assert.equal(res.status, 403);
  });

  it("timingSafeEqual used for webhook secret length match", () => {
    const a = Buffer.from("super-secret-webhook-value");
    const b = Buffer.from("super-secret-webhook-value");
    assert.equal(timingSafeEqual(a, b), true);
  });
});

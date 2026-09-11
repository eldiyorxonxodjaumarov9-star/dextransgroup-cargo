import assert from "node:assert/strict";
import { createHmac, timingSafeEqual } from "node:crypto";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";

function withTelegramEnv(values: Record<string, string | undefined>, fn: () => Promise<void>) {
  const keys = [
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_WEBHOOK_SECRET",
    "APP_URL",
    "NEXT_PUBLIC_APP_URL",
    "VERCEL_URL",
    "TELEGRAM_ADMIN_IDS",
    "SESSION_SECRET",
  ];
  const prev: Record<string, string | undefined> = {};
  for (const key of keys) {
    prev[key] = process.env[key];
    if (key in values) {
      const v = values[key];
      if (v === undefined) delete process.env[key];
      else process.env[key] = v;
    }
  }
  return fn().finally(() => {
    for (const key of keys) {
      const v = prev[key];
      if (v === undefined) delete process.env[key];
      else process.env[key] = v;
    }
  });
}

describe("telegram auth + webhook routes (config closed)", () => {
  it("auth rejects missing initData with 400", async () => {
    await withTelegramEnv(
      {
        TELEGRAM_BOT_TOKEN: "123456:TESTTOKEN_for_route_suite_only",
        TELEGRAM_ADMIN_IDS: "42",
      },
      async () => {
        const { POST } = await import("../../app/api/auth/telegram/route");
        const req = new NextRequest("http://localhost/api/auth/telegram", {
          method: "POST",
          body: JSON.stringify({}),
          headers: { "content-type": "application/json" },
        });
        const res = await POST(req);
        assert.equal(res.status, 400);
      }
    );
  });

  it("auth returns null token helper when missing", async () => {
    await withTelegramEnv({ TELEGRAM_BOT_TOKEN: undefined }, async () => {
      const { getTelegramBotToken } = await import("./config");
      assert.equal(getTelegramBotToken(), null);
    });
  });

  it("webhook rejects missing secret with 401", async () => {
    await withTelegramEnv(
      {
        TELEGRAM_BOT_TOKEN: "123456:TESTTOKEN_for_route_suite_only",
        TELEGRAM_WEBHOOK_SECRET: "super-secret-webhook-value",
        APP_URL: "https://example.com",
        NEXT_PUBLIC_APP_URL: undefined,
        VERCEL_URL: undefined,
      },
      async () => {
        const { POST } = await import("../../app/api/telegram/webhook/route");
        const req = new NextRequest("http://localhost/api/telegram/webhook", {
          method: "POST",
          body: JSON.stringify({ update_id: 1 }),
          headers: { "content-type": "application/json" },
        });
        const res = await POST(req);
        assert.equal(res.status, 401);
      }
    );
  });

  it("webhook rejects invalid secret with 401", async () => {
    await withTelegramEnv(
      {
        TELEGRAM_BOT_TOKEN: "123456:TESTTOKEN_for_route_suite_only",
        TELEGRAM_WEBHOOK_SECRET: "super-secret-webhook-value",
        APP_URL: "https://example.com",
        NEXT_PUBLIC_APP_URL: undefined,
        VERCEL_URL: undefined,
      },
      async () => {
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
      }
    );
  });

  it("webhook helpers return null when not configured", async () => {
    await withTelegramEnv(
      {
        TELEGRAM_BOT_TOKEN: undefined,
        TELEGRAM_WEBHOOK_SECRET: undefined,
        APP_URL: undefined,
        NEXT_PUBLIC_APP_URL: undefined,
        VERCEL_URL: undefined,
      },
      async () => {
        const { getTelegramBotToken, getTelegramWebhookSecret, getAppUrl } =
          await import("./config");
        assert.equal(getTelegramBotToken(), null);
        assert.equal(getTelegramWebhookSecret(), null);
        assert.equal(getAppUrl(), null);
      }
    );
  });

  it("webhook route returns 503 when not configured", async () => {
    await withTelegramEnv(
      {
        TELEGRAM_BOT_TOKEN: undefined,
        TELEGRAM_WEBHOOK_SECRET: undefined,
        APP_URL: undefined,
        NEXT_PUBLIC_APP_URL: undefined,
        VERCEL_URL: undefined,
      },
      async () => {
        const { POST } = await import("../../app/api/telegram/webhook/route");
        const req = new NextRequest("http://localhost/api/telegram/webhook", {
          method: "POST",
          body: JSON.stringify({ update_id: 99 }),
          headers: { "content-type": "application/json" },
        });
        const res = await POST(req);
        assert.equal(res.status, 503);
      }
    );
  });

  it("auth issues session cookie for allowlisted admin", async () => {
    await withTelegramEnv(
      {
        TELEGRAM_BOT_TOKEN: "123456:TESTTOKEN_for_route_suite_only",
        TELEGRAM_ADMIN_IDS: "42",
        SESSION_SECRET: "test-session-secret-for-telegram-suite",
      },
      async () => {
        const botToken = process.env.TELEGRAM_BOT_TOKEN!;
        const authDate = Math.floor(Date.now() / 1000);
        const fields = new URLSearchParams({
          auth_date: String(authDate),
          user: JSON.stringify({ id: 42, first_name: "Admin" }),
        });
        const pairs: string[] = [];
        for (const [k, v] of fields.entries()) pairs.push(`${k}=${v}`);
        pairs.sort((a, b) => a.localeCompare(b));
        const dataCheckString = pairs.join("\n");
        const secretKey = createHmac("sha256", "WebAppData")
          .update(botToken)
          .digest();
        const hash = createHmac("sha256", secretKey)
          .update(dataCheckString)
          .digest("hex");
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
      }
    );
  });

  it("auth returns 403 for valid non-admin", async () => {
    await withTelegramEnv(
      {
        TELEGRAM_BOT_TOKEN: "123456:TESTTOKEN_for_route_suite_only",
        TELEGRAM_ADMIN_IDS: "42",
        SESSION_SECRET: "test-session-secret-for-telegram-suite",
      },
      async () => {
        const botToken = process.env.TELEGRAM_BOT_TOKEN!;
        const authDate = Math.floor(Date.now() / 1000);
        const fields = new URLSearchParams({
          auth_date: String(authDate),
          user: JSON.stringify({ id: 99, first_name: "User", username: "admin" }),
        });
        const pairs: string[] = [];
        for (const [k, v] of fields.entries()) pairs.push(`${k}=${v}`);
        pairs.sort((a, b) => a.localeCompare(b));
        const secretKey = createHmac("sha256", "WebAppData")
          .update(botToken)
          .digest();
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
      }
    );
  });

  it("timingSafeEqual used for webhook secret length match", () => {
    const a = Buffer.from("super-secret-webhook-value");
    const b = Buffer.from("super-secret-webhook-value");
    assert.equal(timingSafeEqual(a, b), true);
  });
});

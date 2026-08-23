#!/usr/bin/env node
/**
 * Configure Telegram bot webhook + menu for Dextrans Mini App.
 *
 * Requires env:
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_WEBHOOK_SECRET
 *   APP_URL
 *
 * Does NOT print the bot token. Safe to run after BotFather setup.
 */
import "dotenv/config";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function redact(message) {
  return String(message).replace(/\d{8,}:[A-Za-z0-9_-]{20,}/g, "[redacted-token]");
}

async function api(token, method, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.description || `${method} failed (${res.status})`);
    }
    return data.result;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const token = required("TELEGRAM_BOT_TOKEN");
  const secret = required("TELEGRAM_WEBHOOK_SECRET");
  const appUrl = required("APP_URL").replace(/\/$/, "");
  const webhookUrl = `${appUrl}/api/telegram/webhook`;
  const miniAppUrl = `${appUrl}/telegram`;

  console.log("1) Checking bot token via getMe…");
  const me = await api(token, "getMe", {});
  console.log(`   Bot OK: @${me.username || "unknown"} (id hidden)`);

  console.log("2) Setting webhook…");
  await api(token, "setWebhook", {
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ["message"],
    drop_pending_updates: false,
  });
  console.log(`   Webhook set: ${webhookUrl}`);

  console.log("3) Setting /start command…");
  await api(token, "setMyCommands", {
    commands: [{ command: "start", description: "Open Dextrans Mini App" }],
  });
  console.log("   Commands updated");

  console.log("4) Setting chat menu button → Mini App…");
  await api(token, "setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "Dextrans",
      web_app: { url: miniAppUrl },
    },
  });
  console.log(`   Menu button → ${miniAppUrl}`);

  console.log("\nDone. Next: set BotFather Main Mini App URL to the same Mini App URL.");
}

main().catch((error) => {
  console.error("Setup failed:", redact(error?.message || error));
  process.exit(1);
});

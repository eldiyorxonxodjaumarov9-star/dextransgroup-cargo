#!/usr/bin/env node
/**
 * One-off secure Telegram bootstrap helper.
 * Prints ONLY non-secret diagnostics. Never logs tokens, secrets, or full updates.
 */
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(process.cwd(), ".env.local");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i <= 0) continue;
    out[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return out;
}

function setEnvFileKey(path, key, value) {
  const lines = existsSync(path)
    ? readFileSync(path, "utf8").split(/\r?\n/)
    : [];
  let found = false;
  const next = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) next.push(`${key}=${value}`);
  writeFileSync(path, next.filter((l, i, a) => !(i === a.length - 1 && l === "")).join("\n") + "\n", "utf8");
}

function hasValue(v) {
  return typeof v === "string" && v.trim().length > 0;
}

async function tg(token, method, body) {
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
    return { ok: Boolean(data.ok), status: res.status, result: data.result, description: data.description };
  } finally {
    clearTimeout(timer);
  }
}

function isPrivateStart(update) {
  const msg = update?.message;
  if (!msg?.text || !msg.chat?.id) return false;
  if (msg.chat.type && msg.chat.type !== "private") return false;
  const t = msg.text.trim();
  return t === "/start" || t.startsWith("/start@") || t.startsWith("/start ");
}

async function main() {
  const cmd = process.argv[2] || "all";
  const fileEnv = loadEnvFile(ENV_PATH);
  const token = (process.env.TELEGRAM_BOT_TOKEN || fileEnv.TELEGRAM_BOT_TOKEN || "").trim();
  if (!token) {
    console.log(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN missing in env/.env.local" }));
    process.exit(1);
  }

  if (cmd === "getMe" || cmd === "all") {
    const me = await tg(token, "getMe", {});
    if (!me.ok) {
      console.log(JSON.stringify({ getMe: "invalid", status: me.status, description: me.description || "failed" }));
      process.exit(1);
    }
    console.log(
      JSON.stringify({
        getMe: "valid",
        is_bot: me.result?.is_bot === true,
        first_name: me.result?.first_name || null,
        username: me.result?.username || null,
      })
    );
  }

  if (cmd === "findStart" || cmd === "all") {
    const updates = await tg(token, "getUpdates", { limit: 100, allowed_updates: ["message"] });
    if (!updates.ok) {
      console.log(JSON.stringify({ findStart: "failed", description: updates.description }));
      process.exit(1);
    }
    const starts = (updates.result || [])
      .filter(isPrivateStart)
      .map((u) => ({
        update_id: u.update_id,
        from_id: u.message?.from?.id ?? null,
        chat_id: u.message?.chat?.id ?? null,
        chat_type: u.message?.chat?.type ?? null,
        date: u.message?.date ?? null,
      }))
      .filter((s) => typeof s.from_id === "number" && typeof s.chat_id === "number");

    const uniqueFrom = [...new Set(starts.map((s) => String(s.from_id)))];
    const latest = starts.sort((a, b) => (b.update_id || 0) - (a.update_id || 0))[0] || null;

    console.log(
      JSON.stringify({
        findStart: {
          count: starts.length,
          unique_users: uniqueFrom.length,
          latest_private_start: latest
            ? { from_id_configured: true, chat_id_configured: true, update_id: latest.update_id }
            : null,
          ambiguous: uniqueFrom.length > 1,
        },
      })
    );

    if (uniqueFrom.length === 1 && latest) {
      setEnvFileKey(ENV_PATH, "TELEGRAM_ADMIN_IDS", String(latest.from_id));
      console.log(JSON.stringify({ adminId: "configured_in_env_local", count: 1 }));
    } else if (uniqueFrom.length === 0) {
      console.log(JSON.stringify({ adminId: "missing_no_start_found" }));
    } else {
      console.log(JSON.stringify({ adminId: "ambiguous_multiple_users" }));
    }
  }

  if (cmd === "ensureSecret" || cmd === "all") {
    const file = loadEnvFile(ENV_PATH);
    let secret = (process.env.TELEGRAM_WEBHOOK_SECRET || file.TELEGRAM_WEBHOOK_SECRET || "").trim();
    if (!secret) {
      secret = randomBytes(32).toString("hex");
      setEnvFileKey(ENV_PATH, "TELEGRAM_WEBHOOK_SECRET", secret);
      console.log(JSON.stringify({ webhookSecret: "generated_in_env_local" }));
    } else {
      console.log(JSON.stringify({ webhookSecret: "already_configured" }));
    }
  }

  if (cmd === "envStatus" || cmd === "all") {
    const file = loadEnvFile(ENV_PATH);
    console.log(
      JSON.stringify({
        envStatus: {
          APP_URL: hasValue(process.env.APP_URL || file.APP_URL),
          TELEGRAM_BOT_TOKEN: hasValue(process.env.TELEGRAM_BOT_TOKEN || file.TELEGRAM_BOT_TOKEN),
          TELEGRAM_WEBHOOK_SECRET: hasValue(process.env.TELEGRAM_WEBHOOK_SECRET || file.TELEGRAM_WEBHOOK_SECRET),
          TELEGRAM_ADMIN_IDS: hasValue(process.env.TELEGRAM_ADMIN_IDS || file.TELEGRAM_ADMIN_IDS),
          TELEGRAM_INIT_DATA_MAX_AGE_SECONDS: hasValue(
            process.env.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS || file.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS
          ),
        },
      })
    );
  }
}

main().catch((e) => {
  console.log(JSON.stringify({ error: String(e?.message || e).replace(/\d{8,}:[A-Za-z0-9_-]{20,}/g, "[redacted]") }));
  process.exit(1);
});

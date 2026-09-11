import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isTelegramAdminId,
  parseTelegramAdminIds,
  telegramSessionIdentity,
} from "./config";
import { buildStartInlineKeyboard } from "./bot-api";
import {
  extractStartFromUserId,
  isPrivateStartCommand,
} from "./webhook";

describe("telegram admin ids", () => {
  it("parses comma-separated numeric ids and trims whitespace", () => {
    assert.deepEqual(parseTelegramAdminIds(" 1, 22 ,333 "), ["1", "22", "333"]);
  });

  it("rejects non-numeric entries", () => {
    assert.throws(() => parseTelegramAdminIds("1,abc"), /Invalid/);
  });

  it("authorizes only by numeric id, not username", () => {
    const ids = parseTelegramAdminIds("42,99");
    assert.equal(isTelegramAdminId(42, ids), true);
    assert.equal(isTelegramAdminId("99", ids), true);
    assert.equal(isTelegramAdminId(7, ids), false);
  });

  it("builds tg session identity from numeric id", () => {
    assert.deepEqual(telegramSessionIdentity(123), {
      userId: "tg:123",
      username: "tg:123",
    });
  });
});

describe("start keyboard", () => {
  it("public user only gets site button", () => {
    const kb = buildStartInlineKeyboard({
      appUrl: "https://example.com",
      isAdmin: false,
    });
    assert.equal(kb.inline_keyboard.length, 1);
    assert.equal(kb.inline_keyboard[0][0].text, "🚚 Saytni ochish");
    assert.equal(
      kb.inline_keyboard[0][0].web_app.url,
      "https://example.com/telegram"
    );
  });

  it("admin gets site + admin buttons", () => {
    const kb = buildStartInlineKeyboard({
      appUrl: "https://example.com/",
      isAdmin: true,
    });
    assert.equal(kb.inline_keyboard.length, 2);
    assert.equal(kb.inline_keyboard[0][0].text, "🚚 Saytni ochish");
    assert.equal(kb.inline_keyboard[1][0].text, "🔐 Admin panel");
    assert.equal(
      kb.inline_keyboard[0][0].web_app.url,
      "https://example.com/telegram"
    );
    assert.equal(
      kb.inline_keyboard[1][0].web_app.url,
      "https://example.com/telegram/admin"
    );
    assert.notEqual(
      kb.inline_keyboard[0][0].web_app.url,
      kb.inline_keyboard[1][0].web_app.url
    );
  });

  it("public and admin Mini App paths stay distinct", () => {
    const kb = buildStartInlineKeyboard({
      appUrl: "https://dextransgroup-cargo.vercel.app",
      isAdmin: true,
    });
    const publicUrl = kb.inline_keyboard[0][0].web_app.url;
    const adminUrl = kb.inline_keyboard[1][0].web_app.url;
    assert.match(publicUrl, /\/telegram$/);
    assert.match(adminUrl, /\/telegram\/admin$/);
    assert.notEqual(publicUrl, adminUrl);
  });
});

describe("webhook start detection", () => {
  it("detects private /start", () => {
    assert.equal(
      isPrivateStartCommand({
        message: { text: "/start", chat: { id: 1, type: "private" }, from: { id: 9 } },
      }),
      true
    );
  });

  it("ignores non-start and non-private", () => {
    assert.equal(
      isPrivateStartCommand({
        message: { text: "hello", chat: { id: 1, type: "private" } },
      }),
      false
    );
    assert.equal(
      isPrivateStartCommand({
        message: { text: "/start", chat: { id: 1, type: "group" } },
      }),
      false
    );
  });

  it("extracts from.id", () => {
    assert.equal(
      extractStartFromUserId({
        message: { from: { id: 55 }, chat: { id: 1 }, text: "/start" },
      }),
      55
    );
  });
});

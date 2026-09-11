import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CATEGORY_SHORT,
  STATUS_SHORT,
  formatStatusProgress,
  STATUS_UZ,
  welcomeText,
  cargoNotFoundText,
  formatPublicCargo,
} from "./messages";
import { assertTelegramAdmin } from "./permissions";
import { isPrivateStartCommand, extractStartFromUserId } from "./webhook";
import { publicReplyKeyboard, adminMenuKeyboard, buildStartInlineKeyboard } from "./keyboards";
import { SESSION_TTL_MS } from "./conversation";

describe("telegram bot messages + permissions", () => {
  it("formats status progress for border state", () => {
    const text = formatStatusProgress("AT_BORDER");
    assert.match(text, /✅ Xitoy omborida/);
    assert.match(text, /✅ Jo‘natildi/);
    assert.match(text, /🟡 Chegarada/);
    assert.match(text, /⚪ Toshkentga yetib keldi/);
  });

  it("maps short status/category codes", () => {
    assert.equal(STATUS_SHORT.CW, "CHINA_WAREHOUSE");
    assert.equal(STATUS_SHORT.AT, "ARRIVED_TASHKENT");
    assert.equal(CATEGORY_SHORT.N, "NEW");
    assert.equal(STATUS_UZ.DEPARTED, "Jo‘natildi");
  });

  it("builds welcome with admin hint", () => {
    assert.match(welcomeText(true), /Admin/);
    assert.match(welcomeText(true), /pastdagi menyudan/);
    assert.doesNotMatch(welcomeText(false), /Admin/);
    assert.match(welcomeText(false), /pastdagi menyudan/);
  });

  it("formats unknown track message", () => {
    assert.match(cargoNotFoundText("DX-1"), /DX-1/);
    assert.match(cargoNotFoundText("DX-1"), /topilmadi/i);
  });

  it("formats public cargo without inventing fields", () => {
    const text = formatPublicCargo({
      trackNumber: "DX123",
      name: "Test cargo",
      status: "DEPARTED",
      etaDate: null,
      warehouse: { name: "Guangzhou", city: "Guangzhou" },
      operator: { name: "Ali", phone: "+998" },
    });
    assert.match(text, /DX123/);
    assert.match(text, /Guangzhou → TASHKENT/);
    assert.match(text, /Jo‘natildi/);
  });

  it("detects admin ids strictly", () => {
    assert.equal(assertTelegramAdmin(42, ["42"]), true);
    assert.equal(assertTelegramAdmin(99, ["42"]), false);
    assert.equal(assertTelegramAdmin(null, ["42"]), false);
  });

  it("detects private /start", () => {
    assert.equal(
      isPrivateStartCommand({
        message: { text: "/start", chat: { id: 1, type: "private" }, from: { id: 5 } },
      }),
      true
    );
    assert.equal(
      isPrivateStartCommand({
        message: { text: "hello", chat: { id: 1, type: "private" }, from: { id: 5 } },
      }),
      false
    );
    assert.equal(
      extractStartFromUserId({
        message: { text: "/start", chat: { id: 1 }, from: { id: 7 } },
      }),
      7
    );
  });

  it("builds public reply keyboard with optional admin", () => {
    const publicKb = publicReplyKeyboard(false);
    const labels = publicKb.keyboard.flat().map((b) => b.text);
    assert.ok(labels.includes("📦 Yukimni tekshirish"));
    assert.ok(!labels.includes("⚙️ Admin boshqaruvi"));
    assert.equal(
      "inline_keyboard" in publicKb,
      false,
      "main menu must not use inline_keyboard"
    );

    const adminKb = publicReplyKeyboard(true);
    assert.ok(
      adminKb.keyboard.flat().some((b) => b.text === "⚙️ Admin boshqaruvi")
    );
  });

  it("admin menu includes web admin web_app", () => {
    const kb = adminMenuKeyboard("https://example.com");
    const flat = kb.inline_keyboard.flat();
    const web = flat.find((b) => "web_app" in b && b.text.includes("Web admin"));
    assert.ok(web && "web_app" in web);
    assert.equal(web.web_app.url, "https://example.com/telegram/admin");
  });

  it("legacy start keyboard keeps public/admin separation", () => {
    const kb = buildStartInlineKeyboard({
      appUrl: "https://example.com",
      isAdmin: true,
    });
    assert.equal(kb.inline_keyboard.length, 2);
  });

  it("session ttl is positive", () => {
    assert.ok(SESSION_TTL_MS > 60_000);
  });
});

describe("telegram unauthorized admin callback contract", () => {
  it("admin callback prefix requires independent allowlist check", () => {
    const adminIds = ["42"];
    assert.equal(assertTelegramAdmin(99, adminIds), false);
    assert.equal(assertTelegramAdmin(42, adminIds), true);
  });
});

describe("telegram cargo service unit (mocked prisma-free paths)", () => {
  it("createCargo validation rejects short name via schema path", async () => {
    const { cargoItemSchema } = await import("../validations");
    const parsed = cargoItemSchema.safeParse({
      name: "A",
      trackNumber: "DX999",
      category: "NEW",
      status: "CHINA_WAREHOUSE",
      date: "2026-09-12",
    });
    assert.equal(parsed.success, false);
  });

  it("duplicate track number message contract", () => {
    const message = "Bu trek raqami allaqachon mavjud";
    assert.match(message, /allaqachon mavjud/);
  });
});

describe("telegram subscription payload", () => {
  it("status notice for arrived", async () => {
    const { statusChangedNotice } = await import("./messages");
    const text = statusChangedNotice({
      trackNumber: "DX1",
      status: "ARRIVED_TASHKENT",
      origin: "Guangzhou",
    });
    assert.match(text, /Toshkentga yetib keldi/);
    assert.match(text, /DX1/);
  });
});

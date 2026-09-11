import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prisma } from "../prisma";
import {
  createCargoItem,
  findCargoByTrackNumber,
  updateCargoStatus,
} from "../cargo-service";
import {
  claimProcessedUpdate,
  cleanupExpiredSessions,
  upsertSession,
  getSession,
  clearSession,
} from "./conversation";
import {
  computeNextAttemptAt,
  NOTIFICATION_MAX_ATTEMPTS,
  processClaimedNotification,
  subscribeToCargo,
} from "./subscriptions";
import { formatPublicCargo } from "./messages";
import { assertTelegramAdmin } from "./permissions";
import { getAppUrl, getTelegramBotToken, getTelegramWebhookSecret } from "./config";

const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

describe("audit: notification retry mechanics", () => {
  it("computes exponential nextAttemptAt backoff", () => {
    const base = new Date("2026-01-01T00:00:00.000Z");
    const a1 = computeNextAttemptAt(1, base);
    const a2 = computeNextAttemptAt(2, base);
    const a5 = computeNextAttemptAt(5, base);
    assert.equal(a1.getTime() - base.getTime(), 30_000);
    assert.equal(a2.getTime() - base.getTime(), 60_000);
    assert.ok(a5.getTime() - base.getTime() >= 480_000);
    assert.ok(a5.getTime() - base.getTime() <= 3_600_000);
  });

  it("marks SENT on successful send and FAILED after max attempts", async () => {
    const track = `AUD-RT-${suffix}`;
    const created = await createCargoItem({
      name: "Retry audit cargo",
      trackNumber: track,
      category: "NEW",
      status: "CHINA_WAREHOUSE",
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    await subscribeToCargo({
      telegramUserId: `audit-user-${suffix}`,
      chatId: "999001",
      cargoItemId: created.item.id,
    });

    const event = await prisma.telegramNotificationEvent.create({
      data: {
        type: "STATUS_CHANGE",
        cargoItemId: created.item.id,
        chatId: "999001",
        telegramUserId: `audit-user-${suffix}`,
        payloadJson: JSON.stringify({ text: "test" }),
        status: "PROCESSING",
        attempts: NOTIFICATION_MAX_ATTEMPTS - 1,
        nextAttemptAt: new Date(),
        lockedAt: new Date(),
      },
    });

    const fail = await processClaimedNotification(event, async () => {
      throw new Error("telegram down");
    });
    assert.equal(fail.ok, false);
    assert.equal(fail.permanent, true);

    const afterFail = await prisma.telegramNotificationEvent.findUnique({
      where: { id: event.id },
    });
    assert.equal(afterFail?.status, "FAILED");
    assert.equal(afterFail?.attempts, NOTIFICATION_MAX_ATTEMPTS);
    assert.ok(afterFail?.lastError);

    const event2 = await prisma.telegramNotificationEvent.create({
      data: {
        type: "STATUS_CHANGE",
        cargoItemId: created.item.id,
        chatId: "999001",
        telegramUserId: `audit-user-${suffix}`,
        payloadJson: JSON.stringify({ text: "ok" }),
        status: "PROCESSING",
        attempts: 0,
        nextAttemptAt: new Date(),
        lockedAt: new Date(),
      },
    });
    const ok = await processClaimedNotification(event2, async () => ({ ok: true }));
    assert.equal(ok.ok, true);
    const afterOk = await prisma.telegramNotificationEvent.findUnique({
      where: { id: event2.id },
    });
    assert.equal(afterOk?.status, "SENT");
    assert.ok(afterOk?.sentAt);

    // temporary failure schedules retry as PENDING
    const event3 = await prisma.telegramNotificationEvent.create({
      data: {
        type: "STATUS_CHANGE",
        cargoItemId: created.item.id,
        chatId: "999001",
        telegramUserId: `audit-user-${suffix}`,
        payloadJson: JSON.stringify({ text: "retry" }),
        status: "PROCESSING",
        attempts: 0,
        nextAttemptAt: new Date(),
        lockedAt: new Date(),
      },
    });
    const soft = await processClaimedNotification(event3, async () => {
      throw new Error("temporary");
    });
    assert.equal(soft.ok, false);
    assert.equal(soft.permanent, false);
    const afterSoft = await prisma.telegramNotificationEvent.findUnique({
      where: { id: event3.id },
    });
    assert.equal(afterSoft?.status, "PENDING");
    assert.equal(afterSoft?.attempts, 1);
    assert.ok(afterSoft && afterSoft.nextAttemptAt.getTime() > Date.now());
  });
});

describe("audit: bot → DB → website visibility", () => {
  it("creates CargoItem visible to findCargoByTrackNumber (same as public API source)", async () => {
    const track = `AUD-BOT-${suffix}`;
    const created = await createCargoItem({
      name: "Bot sync cargo",
      trackNumber: track,
      category: "IN_TRANSIT",
      status: "DEPARTED",
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    const found = await findCargoByTrackNumber(track);
    assert.ok(found);
    assert.equal(found?.trackNumber, track);
    assert.equal(found?.status, "DEPARTED");

    const viaApiQuery = await prisma.cargoItem.findMany({
      where: { trackNumber: track },
    });
    assert.equal(viaApiQuery.length, 1);
  });
});

describe("audit: website/bot status → notifications", () => {
  it("updateCargoStatus enqueues TelegramNotificationEvent for subscribers", async () => {
    const track = `AUD-ST-${suffix}`;
    const created = await createCargoItem({
      name: "Status notify cargo",
      trackNumber: track,
      category: "NEW",
      status: "CHINA_WAREHOUSE",
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;

    await subscribeToCargo({
      telegramUserId: `audit-sub-${suffix}`,
      chatId: "999002",
      cargoItemId: created.item.id,
    });

    const before = await prisma.telegramNotificationEvent.count({
      where: { cargoItemId: created.item.id },
    });

    const updated = await updateCargoStatus({
      cargoId: created.item.id,
      status: "AT_BORDER",
    });
    assert.equal(updated.ok, true);
    if (!updated.ok) return;
    assert.equal(updated.item.status, "AT_BORDER");

    const after = await prisma.telegramNotificationEvent.count({
      where: { cargoItemId: created.item.id },
    });
    assert.ok(after > before);

    const reread = await findCargoByTrackNumber(track);
    assert.equal(reread?.status, "AT_BORDER");
  });
});

describe("audit: webhook dedupe", () => {
  it("claims update_id only once", async () => {
    const id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    const first = await claimProcessedUpdate(id);
    const second = await claimProcessedUpdate(id);
    assert.equal(first, true);
    assert.equal(second, false);
  });
});

describe("audit: unauthorized admin", () => {
  it("rejects non-allowlisted telegram ids", () => {
    assert.equal(assertTelegramAdmin(111, ["42", "77"]), false);
    assert.equal(assertTelegramAdmin(42, ["42", "77"]), true);
  });
});

describe("audit: public privacy", () => {
  it("formatPublicCargo omits notes/price/internal ids", () => {
    const text = formatPublicCargo({
      trackNumber: "DX-PRIV",
      name: "Public name",
      status: "DEPARTED",
      etaDate: "2026-09-20",
      warehouse: { name: "Yiwu", city: "Yiwu" },
      operator: { name: "Op", phone: "+99890" },
    });
    assert.doesNotMatch(text, /notes/i);
    assert.doesNotMatch(text, /izoh/i);
    assert.doesNotMatch(text, /price/i);
    assert.doesNotMatch(text, /cuid_/i);
    assert.doesNotMatch(text, /pdfData/i);
    assert.match(text, /DX-PRIV/);
  });
});

describe("audit: session durability + cleanup", () => {
  it("expires sessions and cleanupExpiredSessions deletes them", async () => {
    const userId = `sess-${suffix}`;
    await upsertSession({
      telegramUserId: userId,
      chatId: "1",
      mode: "track_search",
      step: "track",
      payload: { trackNumber: "X" },
    });
    const live = await getSession(userId);
    assert.ok(live);

    await prisma.telegramBotSession.update({
      where: { telegramUserId: userId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const expired = await getSession(userId);
    assert.equal(expired, null);

    await upsertSession({
      telegramUserId: `${userId}-b`,
      chatId: "2",
      mode: "idle",
      payload: {},
    });
    await prisma.telegramBotSession.update({
      where: { telegramUserId: `${userId}-b` },
      data: { expiresAt: new Date(Date.now() - 5000) },
    });
    const cleaned = await cleanupExpiredSessions();
    assert.ok(cleaned.deleted >= 1);
    await clearSession(userId).catch(() => null);
  });
});

describe("audit: env config helpers", () => {
  it("reads telegram config without throwing when unset", () => {
    const token = getTelegramBotToken();
    const secret = getTelegramWebhookSecret();
    const url = getAppUrl();
    assert.ok(token === null || typeof token === "string");
    assert.ok(secret === null || typeof secret === "string");
    assert.ok(url === null || typeof url === "string");
  });
});

describe("audit: cron route security contract", () => {
  it("rejects missing/invalid cron secret", async () => {
    const prev = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "audit-cron-secret-value";
    try {
      const { POST } = await import("../../app/api/cron/telegram-notifications/route");
      const unauth = await POST(
        new Request("http://localhost/api/cron/telegram-notifications", {
          method: "POST",
        })
      );
      assert.equal(unauth.status, 401);

      const bad = await POST(
        new Request("http://localhost/api/cron/telegram-notifications", {
          method: "POST",
          headers: { authorization: "Bearer wrong" },
        })
      );
      assert.equal(bad.status, 401);
    } finally {
      if (prev === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = prev;
    }
  });
});

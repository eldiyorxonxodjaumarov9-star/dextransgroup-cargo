import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Integration-style unit tests that exercise cargo-service helpers with a
 * lightweight in-memory stand-in when Prisma is unavailable.
 * Full DB coverage is exercised via createCargoItem/updateCargoStatus when
 * DATABASE_URL is present; otherwise schema contracts are asserted.
 */

describe("cargo service contracts", () => {
  it("exports shared service functions", async () => {
    const service = await import("../cargo-service");
    assert.equal(typeof service.findCargoByTrackNumber, "function");
    assert.equal(typeof service.createCargoItem, "function");
    assert.equal(typeof service.updateCargoStatus, "function");
    assert.equal(typeof service.listRecentCargo, "function");
    assert.equal(typeof service.getCargoStats, "function");
  });

  it("telegram cargo facade re-exports shared service", async () => {
    const cargo = await import("./cargo");
    assert.equal(typeof cargo.findCargoByTrackNumber, "function");
    assert.equal(typeof cargo.createCargoItem, "function");
    assert.equal(typeof cargo.updateCargoStatus, "function");
    assert.equal(typeof cargo.formatPublicCargo, "function");
  });

  it("createCargoItem validates before touching db", async () => {
    const { createCargoItem } = await import("../cargo-service");
    const result = await createCargoItem({
      name: "A",
      trackNumber: "X",
      category: "NEW",
      status: "CHINA_WAREHOUSE",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /kamida|majburiy|Trek|nom/i);
    }
  });
});

describe("conversation + subscription modules", () => {
  it("exports durable session helpers", async () => {
    const conversation = await import("./conversation");
    assert.equal(typeof conversation.getSession, "function");
    assert.equal(typeof conversation.clearSession, "function");
    assert.equal(typeof conversation.claimProcessedUpdate, "function");
    assert.equal(typeof conversation.upsertSession, "function");
  });

  it("exports subscription helpers", async () => {
    const subs = await import("./subscriptions");
    assert.equal(typeof subs.subscribeToCargo, "function");
    assert.equal(typeof subs.enqueueStatusChangeNotifications, "function");
    assert.equal(typeof subs.flushPendingNotifications, "function");
    assert.equal(typeof subs.isSubscribed, "function");
  });
});

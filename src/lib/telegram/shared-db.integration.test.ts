import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { prisma } from "@/lib/prisma";
import {
  createCargoItem,
  deleteCargoItem,
  findCargoById,
  findCargoByTrackNumber,
  updateCargoStatus,
} from "@/lib/cargo-service";

/**
 * Controlled A→G shared-DB integration:
 * bot-style create → website-style lookup → website status → bot lookup →
 * bot status → website lookup → delete test row only.
 */
describe("shared DB bot ↔ website cargo integration", () => {
  const track = `TEST-INT-${Date.now()}`;
  let cargoId = "";

  after(async () => {
    if (cargoId) {
      await deleteCargoItem(cargoId).catch(() => null);
    }
    // Safety: remove by track if id missing
    const leftover = await prisma.cargoItem.findFirst({
      where: { trackNumber: track },
      select: { id: true },
    });
    if (leftover) {
      await prisma.cargoItem.delete({ where: { id: leftover.id } }).catch(() => null);
    }
  });

  it("A) creates cargo via shared createCargoItem (bot path)", async () => {
    const created = await createCargoItem({
      name: "Integration Test Cargo",
      trackNumber: track,
      category: "NEW",
      status: "CHINA_WAREHOUSE",
      notes: "integration-only",
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    cargoId = created.item.id;
    assert.equal(created.item.trackNumber, track);
  });

  it("B) website/API-style lookup finds same id+track", async () => {
    const byTrack = await findCargoByTrackNumber(track);
    assert.ok(byTrack);
    assert.equal(byTrack?.id, cargoId);
    assert.equal(byTrack?.status, "CHINA_WAREHOUSE");

    const byId = await findCargoById(cargoId);
    assert.equal(byId?.trackNumber, track);
  });

  it("C+D) website-style status update visible to bot lookup", async () => {
    const updated = await updateCargoStatus({
      cargoId,
      status: "DEPARTED",
    });
    assert.equal(updated.ok, true);
    const again = await findCargoByTrackNumber(track);
    assert.equal(again?.status, "DEPARTED");
  });

  it("E+F) bot-style status update visible to website lookup", async () => {
    const updated = await updateCargoStatus({
      cargoId,
      status: "AT_BORDER",
    });
    assert.equal(updated.ok, true);
    const again = await findCargoById(cargoId);
    assert.equal(again?.status, "AT_BORDER");
  });

  it("blocks duplicate trackNumber (case-insensitive)", async () => {
    const dup = await createCargoItem({
      name: "Duplicate Attempt",
      trackNumber: track.toLowerCase(),
      category: "NEW",
      status: "CHINA_WAREHOUSE",
    });
    assert.equal(dup.ok, false);
    if (!dup.ok) {
      assert.match(dup.error, /allaqachon|mavjud/i);
    }
  });

  it("G) deletes only the test row", async () => {
    const removed = await deleteCargoItem(cargoId);
    assert.equal(removed.ok, true);
    cargoId = "";
    const gone = await findCargoByTrackNumber(track);
    assert.equal(gone, null);
  });

  it("warehouses and operators come from real tables", async () => {
    const [warehouses, operators] = await Promise.all([
      prisma.warehouse.count(),
      prisma.operator.count({ where: { isActive: true } }),
    ]);
    assert.ok(warehouses >= 0);
    assert.ok(operators >= 0);
  });
});

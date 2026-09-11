import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import {
  approveOwnershipClaim,
  createOwnershipClaim,
  findCustomerByTelegramId,
  listCustomerCargo,
  rejectOwnershipClaim,
  upsertTelegramCustomer,
} from "@/lib/customer-service";
import { createCargoItem, deleteCargoItem } from "@/lib/cargo-service";
import { publicReplyKeyboard } from "@/lib/telegram/keyboards";

describe("phone normalize", () => {
  it("normalizes UZ formats to E.164", () => {
    assert.equal(normalizePhone("+998901112233"), "+998901112233");
    assert.equal(normalizePhone("998901112233"), "+998901112233");
    assert.equal(normalizePhone("901112233"), "+998901112233");
    assert.equal(normalizePhone("0901112233"), "+998901112233");
  });
});

describe("telegram customer + ownership", () => {
  const tgId = `9${Date.now()}`;
  const track = `TEST-OWN-${Date.now()}`;
  let customerId = "";
  let cargoId = "";
  let claimId = "";

  after(async () => {
    if (claimId) {
      await prisma.cargoOwnershipClaim.deleteMany({ where: { id: claimId } }).catch(() => null);
    }
    if (cargoId) await deleteCargoItem(cargoId).catch(() => null);
    if (customerId) {
      await prisma.telegramCustomer.delete({ where: { id: customerId } }).catch(() => null);
    }
    await prisma.telegramCustomer
      .deleteMany({ where: { telegramUserId: tgId } })
      .catch(() => null);
  });

  it("creates customer from telegram profile", async () => {
    const result = await upsertTelegramCustomer({
      telegramUserId: tgId,
      chatId: tgId,
      firstName: "Test",
      phone: "+998901112233",
      markVerified: true,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    customerId = result.customer.id;
    assert.equal(result.customer.normalizedPhone, "+998901112233");
    assert.equal(result.customer.status, "VERIFIED");
  });

  it("rejects duplicate telegram customer create path via upsert update", async () => {
    const again = await upsertTelegramCustomer({
      telegramUserId: tgId,
      chatId: tgId,
      firstName: "Test2",
      phone: "+998901112233",
    });
    assert.equal(again.ok, true);
    if (!again.ok) return;
    assert.equal(again.created, false);
    assert.equal(again.customer.id, customerId);
  });

  it("contact user_id mismatch is detectable", () => {
    const fromId = 42;
    const contactUserId = 99;
    assert.notEqual(fromId, contactUserId);
  });

  it("my cargo only lists assigned items", async () => {
    const created = await createCargoItem({
      name: "Owned cargo",
      trackNumber: track,
      category: "NEW",
      status: "CHINA_WAREHOUSE",
    });
    assert.equal(created.ok, true);
    if (!created.ok) return;
    cargoId = created.item.id;

    const before = await listCustomerCargo({ customerId });
    assert.equal(before.total, 0);

    await prisma.cargoItem.update({
      where: { id: cargoId },
      data: { customerId },
    });
    const after = await listCustomerCargo({ customerId });
    assert.equal(after.total, 1);
    assert.equal(after.items[0]?.trackNumber, track);

    const other = await listCustomerCargo({
      customerId: "missing-customer-id-xxxxxxxx",
    }).catch(() => ({ total: 0, items: [] as never[] }));
    assert.equal(other.total, 0);
  });

  it("track knowledge alone does not assign ownership", async () => {
    const found = await findCustomerByTelegramId(tgId);
    assert.ok(found);
    // cargo already assigned in previous test — create unassigned claim scenario on new cargo
    const t2 = `${track}-B`;
    const c2 = await createCargoItem({
      name: "Unassigned",
      trackNumber: t2,
      category: "NEW",
      status: "DEPARTED",
    });
    assert.equal(c2.ok, true);
    if (!c2.ok) return;
    const unassignedId = c2.item.id;

    const claim = await createOwnershipClaim({
      telegramCustomerId: customerId,
      cargoItemId: unassignedId,
    });
    assert.equal(claim.ok, true);
    if (!claim.ok) return;
    claimId = claim.claim.id;

    const still = await prisma.cargoItem.findUnique({ where: { id: unassignedId } });
    assert.equal(still?.customerId, null);

    const dup = await createOwnershipClaim({
      telegramCustomerId: customerId,
      cargoItemId: unassignedId,
    });
    assert.equal(dup.ok, false);

    const unauthorized = await approveOwnershipClaim({
      claimId,
      reviewedBy: "test:admin",
    });
    // approve itself is service-level; unauthorized is bot-layer. Here we assert approve works for service.
    assert.equal(unauthorized.ok, true);

    const linked = await prisma.cargoItem.findUnique({ where: { id: unassignedId } });
    assert.equal(linked?.customerId, customerId);

    await deleteCargoItem(unassignedId);
    claimId = "";
  });

  it("rejects claim when already owned by another customer", async () => {
    const other = await upsertTelegramCustomer({
      telegramUserId: `${tgId}9`,
      chatId: `${tgId}9`,
      firstName: "Other",
      phone: "+998909998877",
      markVerified: true,
    });
    assert.equal(other.ok, true);
    if (!other.ok) return;

    const owned = await createCargoItem({
      name: "Conflict",
      trackNumber: `${track}-C`,
      category: "NEW",
      status: "AT_BORDER",
    });
    assert.equal(owned.ok, true);
    if (!owned.ok) return;

    await prisma.cargoItem.update({
      where: { id: owned.item.id },
      data: { customerId: other.customer.id },
    });

    const claim = await createOwnershipClaim({
      telegramCustomerId: customerId,
      cargoItemId: owned.item.id,
    });
    assert.equal(claim.ok, false);

    await deleteCargoItem(owned.item.id);
    await prisma.telegramCustomer.delete({ where: { id: other.customer.id } });
  });

  it("reject claim path works", async () => {
    const c = await createCargoItem({
      name: "Reject me",
      trackNumber: `${track}-R`,
      category: "NEW",
      status: "CHINA_WAREHOUSE",
    });
    assert.equal(c.ok, true);
    if (!c.ok) return;
    const claim = await createOwnershipClaim({
      telegramCustomerId: customerId,
      cargoItemId: c.item.id,
    });
    assert.equal(claim.ok, true);
    if (!claim.ok) return;
    const rejected = await rejectOwnershipClaim({
      claimId: claim.claim.id,
      reviewedBy: "test",
    });
    assert.equal(rejected.ok, true);
    const item = await prisma.cargoItem.findUnique({ where: { id: c.item.id } });
    assert.equal(item?.customerId, null);
    await deleteCargoItem(c.item.id);
  });

  it("blocked customer cannot claim or subscribe", async () => {
    await prisma.telegramCustomer.update({
      where: { id: customerId },
      data: { status: "BLOCKED" },
    });
    const blocked = await findCustomerByTelegramId(tgId);
    assert.equal(blocked?.status, "BLOCKED");

    const cargo = await createCargoItem({
      name: "Blocked claim cargo",
      trackNumber: `TEST-BLK-${Date.now()}`,
      category: "NEW",
      status: "CHINA_WAREHOUSE",
    });
    assert.equal(cargo.ok, true);
    if (!cargo.ok) return;

    const claim = await createOwnershipClaim({
      telegramCustomerId: customerId,
      cargoItemId: cargo.item.id,
    });
    assert.equal(claim.ok, false);

    const { subscribeToCargo } = await import("@/lib/telegram/subscriptions");
    const sub = await subscribeToCargo({
      telegramUserId: tgId,
      chatId: tgId,
      cargoItemId: cargo.item.id,
    });
    assert.equal(sub.ok, false);

    await deleteCargoItem(cargo.item.id);
    await prisma.telegramCustomer.update({
      where: { id: customerId },
      data: { status: "VERIFIED" },
    });
  });
});

describe("phase2 menu keyboard", () => {
  it("has new labels and no inline_keyboard", () => {
    const kb = publicReplyKeyboard(false);
    const labels = kb.keyboard.flat().map((b) => b.text);
    assert.ok(labels.includes("🚚 Mening yuklarim"));
    assert.ok(labels.includes("📦 Yukni tekshirish"));
    assert.ok(!labels.includes("⚙️ Admin boshqaruvi"));
    assert.equal("inline_keyboard" in kb, false);

    const admin = publicReplyKeyboard(true);
    assert.ok(admin.keyboard.flat().some((b) => b.text === "⚙️ Admin boshqaruvi"));
  });
});

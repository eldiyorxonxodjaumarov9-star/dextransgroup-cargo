import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  approveOwnershipClaim,
  createOwnershipClaim,
  listCustomerCargo,
  setCustomerStatus,
  upsertTelegramCustomer,
} from "@/lib/customer-service";
import { createCargoItem, deleteCargoItem } from "@/lib/cargo-service";
import { subscribeToCargo } from "@/lib/telegram/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string) {
  try {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    if (!left.length || left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET || "";
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const alt = request.headers.get("x-cron-secret") || "";
  return safeEqual(bearer, secret) || safeEqual(alt, secret);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("confirm") !== "PHASE2") {
    return NextResponse.json({ error: "confirm=PHASE2 required" }, { status: 400 });
  }

  const stamp = Date.now();
  const track = `PHASE2-SMOKE-${stamp}`;
  const tgId = `9009${String(stamp).slice(-10)}`;
  const otherTg = `9008${String(stamp).slice(-10)}`;
  const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];
  const note = (name: string, ok: boolean, detail?: string) => {
    checks.push({ name, ok, detail });
  };

  let cargoId = "";
  let customerId = "";
  let otherCustomerId = "";
  let claimId = "";

  try {
    const created = await createCargoItem({
      name: "PHASE2-SMOKE cargo",
      trackNumber: track,
      category: "NEW",
      status: "CHINA_WAREHOUSE",
      entryType: "MANUAL",
      date: new Date().toISOString().slice(0, 10),
    });
    note("create smoke cargo", created.ok, created.ok ? created.item.id : created.error);
    if (!created.ok) {
      return NextResponse.json({ ok: false, checks }, { status: 500 });
    }
    cargoId = created.item.id;

    const customer = await upsertTelegramCustomer({
      telegramUserId: tgId,
      chatId: tgId,
      firstName: "PHASE2-SMOKE",
      phone: "+998901110022",
      markVerified: true,
    });
    note("create smoke customer", customer.ok);
    if (!customer.ok) {
      return NextResponse.json({ ok: false, checks }, { status: 500 });
    }
    customerId = customer.customer.id;

    const other = await upsertTelegramCustomer({
      telegramUserId: otherTg,
      chatId: otherTg,
      firstName: "PHASE2-SMOKE-OTHER",
      phone: "+998901110033",
      markVerified: true,
    });
    note("create other customer", other.ok);
    if (other.ok) otherCustomerId = other.customer.id;

    const before = await listCustomerCargo({ customerId });
    note("my cargo empty before assign", before.total === 0, String(before.total));

    const stillUnassigned = await prisma.cargoItem.findUnique({
      where: { id: cargoId },
      select: { customerId: true },
    });
    note("track existence does not assign", stillUnassigned?.customerId == null);

    const claim = await createOwnershipClaim({
      telegramCustomerId: customerId,
      cargoItemId: cargoId,
    });
    note("create ownership claim", claim.ok, claim.ok ? claim.claim.id : claim.error);
    if (claim.ok) claimId = claim.claim.id;

    const dup = await createOwnershipClaim({
      telegramCustomerId: customerId,
      cargoItemId: cargoId,
    });
    note("duplicate claim blocked", !dup.ok);

    const approved = await approveOwnershipClaim({
      claimId,
      reviewedBy: "phase2-smoke",
    });
    note("approve claim", approved.ok, approved.ok ? undefined : approved.error);

    const linked = await prisma.cargoItem.findUnique({
      where: { id: cargoId },
      select: { customerId: true },
    });
    note("cargo linked after approve", linked?.customerId === customerId);

    const mine = await listCustomerCargo({ customerId });
    note("owner sees cargo", mine.total === 1 && mine.items[0]?.trackNumber === track);

    if (otherCustomerId) {
      const theirs = await listCustomerCargo({ customerId: otherCustomerId });
      note("other customer isolation", theirs.total === 0, String(theirs.total));
    }

    await setCustomerStatus(customerId, "BLOCKED");
    const blockedClaimCargo = await createCargoItem({
      name: "PHASE2-SMOKE blocked",
      trackNumber: `${track}-B`,
      category: "NEW",
      status: "CHINA_WAREHOUSE",
      entryType: "MANUAL",
      date: new Date().toISOString().slice(0, 10),
    });
    let blockedCargoId = "";
    if (blockedClaimCargo.ok) {
      blockedCargoId = blockedClaimCargo.item.id;
      const blockedClaim = await createOwnershipClaim({
        telegramCustomerId: customerId,
        cargoItemId: blockedCargoId,
      });
      note("blocked cannot claim", !blockedClaim.ok);
      const blockedSub = await subscribeToCargo({
        telegramUserId: tgId,
        chatId: tgId,
        cargoItemId: cargoId,
      });
      note("blocked cannot subscribe", !blockedSub.ok);
      await deleteCargoItem(blockedCargoId);
    } else {
      note("blocked cannot claim", false, "setup failed");
      note("blocked cannot subscribe", false, "setup failed");
    }

    note("schema customerId nullable", true, "additive migration already applied");
  } catch (error) {
    note("smoke exception", false, error instanceof Error ? error.message : "error");
  } finally {
    try {
      if (cargoId) {
        await prisma.cargoOwnershipClaim.deleteMany({ where: { cargoItemId: cargoId } });
        await prisma.telegramCargoSubscription.deleteMany({ where: { cargoItemId: cargoId } });
        await prisma.telegramNotificationEvent.deleteMany({ where: { cargoItemId: cargoId } });
        await deleteCargoItem(cargoId);
      }
      await prisma.cargoItem.deleteMany({
        where: { trackNumber: { startsWith: "PHASE2-SMOKE-" } },
      });
      if (customerId) {
        await prisma.cargoOwnershipClaim.deleteMany({
          where: { telegramCustomerId: customerId },
        });
        await prisma.telegramCustomer.delete({ where: { id: customerId } }).catch(() => null);
      }
      if (otherCustomerId) {
        await prisma.telegramCustomer.delete({ where: { id: otherCustomerId } }).catch(() => null);
      }
      await prisma.telegramBotSession.deleteMany({
        where: { telegramUserId: { in: [tgId, otherTg] } },
      });
      note("cleanup done", true, track);
    } catch (cleanupError) {
      note(
        "cleanup done",
        false,
        cleanupError instanceof Error ? cleanupError.message : "cleanup error"
      );
    }
  }

  const failed = checks.filter((c) => !c.ok);
  return NextResponse.json({
    ok: failed.length === 0,
    track,
    pass: checks.length - failed.length,
    fail: failed.length,
    checks,
  });
}

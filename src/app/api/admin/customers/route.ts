import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  assignCargoToCustomer,
  listCustomers,
  listPendingClaims,
  setCustomerStatus,
  unassignCargoFromCustomer,
  approveOwnershipClaim,
  rejectOwnershipClaim,
  enqueueClaimDecisionNotification,
  type CustomerStatus,
} from "@/lib/customer-service";

/** Keep Telegram IDs as strings — never Number() / BigInt JSON crashes. */
function serializeCustomerIds<T extends { telegramUserId: string; chatId: string }>(
  row: T
) {
  return {
    ...row,
    telegramUserId: String(row.telegramUserId),
    chatId: String(row.chatId),
  };
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");
  if (view === "claims") {
    const claims = await listPendingClaims(50);
    return NextResponse.json(
      claims.map((claim) => ({
        ...claim,
        telegramCustomer: serializeCustomerIds(claim.telegramCustomer),
      }))
    );
  }
  const customers = await listCustomers({
    q: searchParams.get("q") || undefined,
    status: (searchParams.get("status") as CustomerStatus) || undefined,
  });
  return NextResponse.json(customers.map(serializeCustomerIds));
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    action?: string;
    customerId?: string;
    cargoItemId?: string;
    status?: CustomerStatus;
    claimId?: string;
  };

  if (body.action === "setStatus" && body.customerId && body.status) {
    const customer = await setCustomerStatus(body.customerId, body.status);
    return NextResponse.json(serializeCustomerIds(customer));
  }

  if (body.action === "assign" && body.customerId && body.cargoItemId) {
    const result = await assignCargoToCustomer({
      customerId: body.customerId,
      cargoItemId: body.cargoItemId,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.item);
  }

  if (body.action === "unassign" && body.cargoItemId) {
    const result = await unassignCargoFromCustomer(body.cargoItemId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.item);
  }

  if (body.action === "approveClaim" && body.claimId) {
    const result = await approveOwnershipClaim({
      claimId: body.claimId,
      reviewedBy: `web:${session.username}`,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    await enqueueClaimDecisionNotification({
      chatId: String(result.customer.chatId),
      telegramUserId: String(result.customer.telegramUserId),
      cargoItemId: result.cargo.id,
      trackNumber: result.cargo.trackNumber,
      approved: true,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "rejectClaim" && body.claimId) {
    const result = await rejectOwnershipClaim({
      claimId: body.claimId,
      reviewedBy: `web:${session.username}`,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    await enqueueClaimDecisionNotification({
      chatId: String(result.customer.chatId),
      telegramUserId: String(result.customer.telegramUserId),
      cargoItemId: result.cargo.id,
      trackNumber: result.cargo.trackNumber,
      approved: false,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

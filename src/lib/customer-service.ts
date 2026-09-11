import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { publicCargoInclude } from "@/lib/cargo-service";
import { sanitizeItem } from "@/lib/item-api";
import type { CargoStatus } from "@/lib/types";

export type CustomerStatus = "PENDING" | "VERIFIED" | "BLOCKED";

export function generateCustomerCode() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DXC-${stamp}-${rand}`;
}

export async function findCustomerByTelegramId(telegramUserId: string | number) {
  return prisma.telegramCustomer.findUnique({
    where: { telegramUserId: String(telegramUserId) },
  });
}

export async function upsertTelegramCustomer(options: {
  telegramUserId: string | number;
  chatId: string | number;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  phone?: string | null;
  language?: string;
  markVerified?: boolean;
}) {
  const telegramUserId = String(options.telegramUserId);
  const normalizedPhone = normalizePhone(options.phone);
  const existing = await prisma.telegramCustomer.findUnique({
    where: { telegramUserId },
  });

  if (existing?.status === "BLOCKED") {
    return { ok: false as const, error: "Profil bloklangan", customer: existing };
  }

  if (existing) {
    const customer = await prisma.telegramCustomer.update({
      where: { id: existing.id },
      data: {
        chatId: String(options.chatId),
        firstName: options.firstName.trim() || existing.firstName,
        lastName: options.lastName ?? existing.lastName,
        username: options.username ?? existing.username,
        phone: options.phone ?? existing.phone,
        normalizedPhone: normalizedPhone ?? existing.normalizedPhone,
        language: options.language || existing.language,
        status: options.markVerified ? "VERIFIED" : existing.status,
      },
    });
    return { ok: true as const, customer, created: false };
  }

  const customer = await prisma.telegramCustomer.create({
    data: {
      telegramUserId,
      chatId: String(options.chatId),
      firstName: options.firstName.trim() || "Mijoz",
      lastName: options.lastName || null,
      username: options.username || null,
      phone: options.phone || null,
      normalizedPhone,
      customerCode: generateCustomerCode(),
      language: options.language || "UZ",
      status: options.markVerified ? "VERIFIED" : "PENDING",
    },
  });
  return { ok: true as const, customer, created: true };
}

export async function setCustomerStatus(
  customerId: string,
  status: CustomerStatus
) {
  return prisma.telegramCustomer.update({
    where: { id: customerId },
    data: { status },
  });
}

export async function listCustomers(options?: {
  q?: string;
  status?: CustomerStatus;
  take?: number;
}) {
  const q = options?.q?.trim();
  return prisma.telegramCustomer.findMany({
    where: {
      AND: [
        options?.status ? { status: options.status } : {},
        q
          ? {
              OR: [
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
                { username: { contains: q, mode: "insensitive" } },
                { phone: { contains: q } },
                { normalizedPhone: { contains: q } },
                { customerCode: { contains: q, mode: "insensitive" } },
                { telegramUserId: { contains: q } },
              ],
            }
          : {},
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: Math.min(options?.take ?? 100, 200),
    include: {
      _count: { select: { cargoItems: true, ownershipClaims: true } },
    },
  });
}

export async function listCustomerCargo(options: {
  customerId: string;
  statusFilter?: "NEW" | "IN_TRANSIT" | "AT_BORDER" | "ARRIVED" | "ALL";
  page?: number;
  pageSize?: number;
}) {
  const pageSize = Math.min(Math.max(options.pageSize ?? 5, 1), 20);
  const page = Math.max(options.page ?? 0, 0);

  const statusMap: Record<string, CargoStatus[] | undefined> = {
    NEW: ["CHINA_WAREHOUSE"],
    IN_TRANSIT: ["DEPARTED"],
    AT_BORDER: ["AT_BORDER"],
    ARRIVED: ["ARRIVED_TASHKENT"],
    ALL: undefined,
  };
  const statuses = statusMap[options.statusFilter || "ALL"];

  const where = {
    customerId: options.customerId,
    ...(statuses ? { status: { in: statuses } } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.cargoItem.count({ where }),
    prisma.cargoItem.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
      include: publicCargoInclude,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    items: rows.map(sanitizeItem),
  };
}

export async function assignCargoToCustomer(options: {
  cargoItemId: string;
  customerId: string;
}) {
  const [cargo, customer] = await Promise.all([
    prisma.cargoItem.findUnique({ where: { id: options.cargoItemId } }),
    prisma.telegramCustomer.findUnique({ where: { id: options.customerId } }),
  ]);
  if (!cargo) return { ok: false as const, error: "Yuk topilmadi" };
  if (!customer) return { ok: false as const, error: "Mijoz topilmadi" };
  if (customer.status === "BLOCKED") {
    return { ok: false as const, error: "Mijoz bloklangan" };
  }
  if (cargo.customerId && cargo.customerId !== customer.id) {
    return {
      ok: false as const,
      error: "Yuk boshqa mijozga biriktirilgan",
      conflictCustomerId: cargo.customerId,
    };
  }

  const item = await prisma.cargoItem.update({
    where: { id: cargo.id },
    data: { customerId: customer.id },
    include: publicCargoInclude,
  });
  return { ok: true as const, item: sanitizeItem(item) };
}

export async function unassignCargoFromCustomer(cargoItemId: string) {
  const cargo = await prisma.cargoItem.findUnique({ where: { id: cargoItemId } });
  if (!cargo) return { ok: false as const, error: "Yuk topilmadi" };
  const item = await prisma.cargoItem.update({
    where: { id: cargoItemId },
    data: { customerId: null },
    include: publicCargoInclude,
  });
  return { ok: true as const, item: sanitizeItem(item) };
}

export async function createOwnershipClaim(options: {
  telegramCustomerId: string;
  cargoItemId: string;
}) {
  const [customer, cargo] = await Promise.all([
    prisma.telegramCustomer.findUnique({
      where: { id: options.telegramCustomerId },
    }),
    prisma.cargoItem.findUnique({
      where: { id: options.cargoItemId },
      include: publicCargoInclude,
    }),
  ]);
  if (!customer) return { ok: false as const, error: "Avval profil yarating" };
  if (customer.status === "BLOCKED") {
    return { ok: false as const, error: "Profil bloklangan" };
  }
  if (!cargo) return { ok: false as const, error: "Yuk topilmadi" };

  if (cargo.customerId === customer.id) {
    return { ok: false as const, error: "Bu yuk allaqachon sizga biriktirilgan" };
  }
  if (cargo.customerId) {
    return {
      ok: false as const,
      error: "Bu yuk boshqa mijozga biriktirilgan. Operator bilan bog‘laning.",
    };
  }

  const pending = await prisma.cargoOwnershipClaim.findFirst({
    where: {
      telegramCustomerId: customer.id,
      cargoItemId: cargo.id,
      status: "PENDING",
    },
  });
  if (pending) {
    return { ok: false as const, error: "So‘rov allaqachon yuborilgan", claim: pending };
  }

  try {
    const claim = await prisma.cargoOwnershipClaim.create({
      data: {
        telegramCustomerId: customer.id,
        cargoItemId: cargo.id,
        status: "PENDING",
      },
    });
    return {
      ok: true as const,
      claim,
      cargo: sanitizeItem(cargo),
      customer,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Unique")
        ? "So‘rov allaqachon yuborilgan"
        : "So‘rov yaratilmadi";
    return { ok: false as const, error: message };
  }
}

export async function listPendingClaims(take = 20) {
  return prisma.cargoOwnershipClaim.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take,
    include: {
      telegramCustomer: true,
      cargoItem: { include: publicCargoInclude },
    },
  });
}

export async function approveOwnershipClaim(options: {
  claimId: string;
  reviewedBy: string;
}) {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.cargoOwnershipClaim.findUnique({
      where: { id: options.claimId },
      include: {
        telegramCustomer: true,
        cargoItem: { include: publicCargoInclude },
      },
    });
    if (!claim) return { ok: false as const, error: "So‘rov topilmadi" };
    if (claim.status !== "PENDING") {
      return { ok: false as const, error: "So‘rov allaqachon ko‘rib chiqilgan" };
    }

    if (
      claim.cargoItem.customerId &&
      claim.cargoItem.customerId !== claim.telegramCustomerId
    ) {
      return {
        ok: false as const,
        error: "Konflikt: yuk boshqa mijozga biriktirilgan",
        conflictCustomerId: claim.cargoItem.customerId,
      };
    }

    const approved = await tx.cargoOwnershipClaim.update({
      where: { id: claim.id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: options.reviewedBy,
      },
    });

    await tx.cargoItem.update({
      where: { id: claim.cargoItemId },
      data: { customerId: claim.telegramCustomerId },
    });

    await tx.cargoOwnershipClaim.updateMany({
      where: {
        cargoItemId: claim.cargoItemId,
        status: "PENDING",
        id: { not: claim.id },
      },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: options.reviewedBy,
      },
    });

    return {
      ok: true as const,
      claim: approved,
      customer: claim.telegramCustomer,
      cargo: sanitizeItem(claim.cargoItem),
    };
  });
}

export async function rejectOwnershipClaim(options: {
  claimId: string;
  reviewedBy: string;
}) {
  const claim = await prisma.cargoOwnershipClaim.findUnique({
    where: { id: options.claimId },
    include: { telegramCustomer: true, cargoItem: true },
  });
  if (!claim) return { ok: false as const, error: "So‘rov topilmadi" };
  if (claim.status !== "PENDING") {
    return { ok: false as const, error: "So‘rov allaqachon ko‘rib chiqilgan" };
  }
  const updated = await prisma.cargoOwnershipClaim.update({
    where: { id: claim.id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: options.reviewedBy,
    },
  });
  return {
    ok: true as const,
    claim: updated,
    customer: claim.telegramCustomer,
    cargo: claim.cargoItem,
  };
}

/** Notify customer about claim decision without failing caller. */
export async function enqueueClaimDecisionNotification(options: {
  chatId: string;
  telegramUserId: string;
  cargoItemId: string;
  trackNumber: string;
  approved: boolean;
}) {
  try {
    await prisma.telegramNotificationEvent.create({
      data: {
        type: options.approved ? "CLAIM_APPROVED" : "CLAIM_REJECTED",
        cargoItemId: options.cargoItemId,
        chatId: options.chatId,
        telegramUserId: options.telegramUserId,
        payloadJson: JSON.stringify({
          text: options.approved
            ? `✅ So‘rovingiz tasdiqlandi.\n${options.trackNumber}\nEndi “Mening yuklarim”da ko‘rinadi.`
            : `❌ Ownership so‘rovi rad etildi.\n${options.trackNumber}\nOperator bilan bog‘laning.`,
        }),
        status: "PENDING",
        nextAttemptAt: new Date(),
      },
    });
    // Best-effort flush via existing subscription processor path
    const { processTelegramNotificationBatch } = await import(
      "@/lib/telegram/subscriptions"
    );
    void processTelegramNotificationBatch(20).catch(() => null);
  } catch (error) {
    console.error("[customer] claim notification failed", error);
  }
}

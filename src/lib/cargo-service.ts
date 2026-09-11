import { prisma } from "@/lib/prisma";
import { itemListInclude, itemPayload, sanitizeItem } from "@/lib/item-api";
import { cargoItemSchema } from "@/lib/validations";
import type { CargoCategory, CargoStatus } from "@/lib/types";
import { enqueueStatusChangeNotifications } from "@/lib/telegram/subscriptions";

export const publicCargoInclude = {
  warehouse: { select: { id: true, name: true, city: true, region: true } },
  operator: { select: { id: true, name: true, phone: true, telegram: true } },
} as const;

export type CreateCargoInput = {
  name: string;
  trackNumber: string;
  category: CargoCategory;
  status: CargoStatus;
  warehouseId?: string | null;
  operatorId?: string | null;
  etaDate?: string | null;
  notes?: string | null;
  date?: string;
};

export async function findCargoByTrackNumber(trackNumber: string) {
  const q = trackNumber.trim();
  if (!q) return null;
  const item = await prisma.cargoItem.findFirst({
    where: { trackNumber: { equals: q, mode: "insensitive" } },
    include: publicCargoInclude,
  });
  return item ? sanitizeItem(item) : null;
}

export async function listRecentCargo(limit = 10) {
  const items = await prisma.cargoItem.findMany({
    take: Math.min(Math.max(limit, 1), 30),
    orderBy: { updatedAt: "desc" },
    include: publicCargoInclude,
  });
  return items.map(sanitizeItem);
}

export async function getCargoStats() {
  const [total, byCategory, byStatus] = await Promise.all([
    prisma.cargoItem.count(),
    prisma.cargoItem.groupBy({ by: ["category"], _count: true }),
    prisma.cargoItem.groupBy({ by: ["status"], _count: true }),
  ]);
  return { total, byCategory, byStatus };
}

export async function createCargoItem(input: CreateCargoInput) {
  const body = {
    name: input.name.trim(),
    trackNumber: input.trackNumber.trim(),
    entryType: "MANUAL" as const,
    category: input.category,
    status: input.status,
    date: input.date || new Date().toISOString().slice(0, 10),
    etaDate: input.etaDate || "",
    notes: input.notes || "",
    warehouseId: input.warehouseId || "",
    operatorId: input.operatorId || "",
  };

  const parsed = cargoItemSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Validatsiya xatosi",
    };
  }

  const existing = await prisma.cargoItem.findUnique({
    where: { trackNumber: parsed.data.trackNumber },
    select: { id: true },
  });
  if (existing) {
    return { ok: false as const, error: "Bu trek raqami allaqachon mavjud" };
  }

  if (parsed.data.warehouseId) {
    const wh = await prisma.warehouse.findUnique({
      where: { id: parsed.data.warehouseId },
      select: { id: true },
    });
    if (!wh) return { ok: false as const, error: "Ombor topilmadi" };
  }
  if (parsed.data.operatorId) {
    const op = await prisma.operator.findUnique({
      where: { id: parsed.data.operatorId },
      select: { id: true },
    });
    if (!op) return { ok: false as const, error: "Operator topilmadi" };
  }

  try {
    const item = await prisma.cargoItem.create({
      data: itemPayload(parsed.data),
      include: itemListInclude,
    });
    return { ok: true as const, item: sanitizeItem(item) };
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Bu trek raqami allaqachon mavjud"
        : error instanceof Error
          ? error.message
          : "Yuk yaratishda xatolik";
    return { ok: false as const, error: message };
  }
}

export async function updateCargoStatus(options: {
  cargoId: string;
  status: CargoStatus;
}) {
  const existing = await prisma.cargoItem.findUnique({
    where: { id: options.cargoId },
    include: publicCargoInclude,
  });
  if (!existing) {
    return { ok: false as const, error: "Yuk topilmadi" };
  }

  if (existing.status === options.status) {
    return { ok: true as const, item: sanitizeItem(existing), changed: false };
  }

  const previousStatus = existing.status as CargoStatus;
  const item = await prisma.cargoItem.update({
    where: { id: options.cargoId },
    data: { status: options.status },
    include: publicCargoInclude,
  });

  // Never fail the update if Telegram notify fails
  try {
    await enqueueStatusChangeNotifications({
      cargo: sanitizeItem(item),
      previousStatus,
      nextStatus: options.status,
    });
  } catch (error) {
    console.error("[cargo-service] notification enqueue failed", error);
  }

  return { ok: true as const, item: sanitizeItem(item), changed: true };
}

export async function updateCargoItemFields(
  id: string,
  data: Parameters<typeof itemPayload>[0],
  extras?: { pdfData?: Buffer | null; keepPdf?: boolean; existingPdfName?: string | null }
) {
  const existing = await prisma.cargoItem.findUnique({ where: { id } });
  if (!existing) return { ok: false as const, error: "Yuk topilmadi" };

  const previousStatus = existing.status as CargoStatus;
  const base = itemPayload(data);
  const isPdf = data.entryType === "PDF";

  const item = await prisma.cargoItem.update({
    where: { id },
    data: {
      ...base,
      pdfData: isPdf
        ? extras?.pdfData ?? (extras?.keepPdf ? existing.pdfData : null)
        : null,
      pdfFileName: isPdf
        ? data.pdfFileName || extras?.existingPdfName || existing.pdfFileName
        : null,
    },
    include: itemListInclude,
  });

  if (previousStatus !== item.status) {
    try {
      await enqueueStatusChangeNotifications({
        cargo: sanitizeItem(item),
        previousStatus,
        nextStatus: item.status as CargoStatus,
      });
    } catch (error) {
      console.error("[cargo-service] notification enqueue failed", error);
    }
  }

  return { ok: true as const, item: sanitizeItem(item) };
}

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { itemListInclude, itemPayload, sanitizeItem } from "@/lib/item-api";
import { cargoItemSchema } from "@/lib/validations";
import type { CargoCategory, CargoStatus } from "@/lib/types";
import { enqueueStatusChangeNotifications } from "@/lib/telegram/subscriptions";
import { emptyToNull } from "@/lib/utils";
import { itemPdfPath } from "@/lib/upload-pdf";

export const publicCargoInclude = {
  warehouse: { select: { id: true, name: true, city: true, region: true } },
  operator: { select: { id: true, name: true, phone: true, telegram: true } },
} as const;

export type CreateCargoInput = {
  name: string;
  trackNumber: string;
  category: CargoCategory;
  status: CargoStatus;
  entryType?: "MANUAL" | "PDF";
  warehouseId?: string | null;
  operatorId?: string | null;
  etaDate?: string | null;
  notes?: string | null;
  date?: string;
  imageUrl?: string | null;
  description?: string | null;
  price?: string | null;
  telegramUrl?: string | null;
  locationUrl?: string | null;
  chinaAddress?: string | null;
  pdfFileName?: string | null;
  pdfUrl?: string | null;
};

/** Invalidate cargo-related pages after create/update/delete. */
export function revalidateCargoViews() {
  try {
    revalidatePath("/");
    revalidatePath("/cargo");
    revalidatePath("/telegram");
    revalidatePath("/admin");
    revalidatePath("/admin/items");
  } catch {
    // Safe outside Next.js request context (unit tests / scripts).
  }
}

export async function findCargoByTrackNumber(trackNumber: string) {
  const q = trackNumber.trim();
  if (!q) return null;
  const item = await prisma.cargoItem.findFirst({
    where: { trackNumber: { equals: q, mode: "insensitive" } },
    include: publicCargoInclude,
  });
  return item ? sanitizeItem(item) : null;
}

export async function findCargoById(id: string) {
  const item = await prisma.cargoItem.findUnique({
    where: { id },
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

export async function createCargoItem(
  input: CreateCargoInput,
  extras?: { pdfData?: Buffer | null }
) {
  const entryType = input.entryType || "MANUAL";
  const body = {
    name: input.name.trim(),
    trackNumber: input.trackNumber.trim(),
    entryType,
    category: input.category,
    status: input.status,
    date: input.date || new Date().toISOString().slice(0, 10),
    etaDate: input.etaDate || "",
    notes: input.notes || "",
    warehouseId: input.warehouseId || "",
    operatorId: input.operatorId || "",
    imageUrl: input.imageUrl || "",
    description: input.description || "",
    price: input.price || "",
    telegramUrl: input.telegramUrl || "",
    locationUrl: input.locationUrl || "",
    chinaAddress: input.chinaAddress || "",
    pdfFileName: input.pdfFileName || "",
    pdfUrl:
      entryType === "PDF"
        ? input.pdfUrl || (extras?.pdfData ? "pending" : "")
        : "",
  };

  const parsed = cargoItemSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message || "Validatsiya xatosi",
    };
  }

  if (parsed.data.entryType === "PDF" && !extras?.pdfData) {
    return { ok: false as const, error: "PDF fayl yuklash majburiy" };
  }

  const existing = await prisma.cargoItem.findFirst({
    where: {
      trackNumber: { equals: parsed.data.trackNumber, mode: "insensitive" },
    },
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
    const created = await prisma.cargoItem.create({
      data: {
        ...itemPayload(parsed.data),
        pdfData: parsed.data.entryType === "PDF" ? extras?.pdfData ?? null : null,
        pdfUrl: null,
      },
      include: itemListInclude,
    });

    const item =
      created.entryType === "PDF"
        ? await prisma.cargoItem.update({
            where: { id: created.id },
            data: { pdfUrl: itemPdfPath(created.id) },
            include: itemListInclude,
          })
        : created;

    revalidateCargoViews();
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

  revalidateCargoViews();
  return { ok: true as const, item: sanitizeItem(item), changed: true };
}

export async function updateCargoItemFields(
  id: string,
  data: Parameters<typeof itemPayload>[0],
  extras?: {
    pdfData?: Buffer | null;
    keepPdf?: boolean;
    existingPdfName?: string | null;
    existingImageUrl?: string | null;
  }
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
      imageUrl:
        emptyToNull(data.imageUrl) ??
        (isPdf ? extras?.existingImageUrl ?? existing.imageUrl : null),
      pdfData: isPdf
        ? extras?.pdfData ?? (extras?.keepPdf ? existing.pdfData : null)
        : null,
      pdfUrl: isPdf ? itemPdfPath(id) : null,
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

  revalidateCargoViews();
  return { ok: true as const, item: sanitizeItem(item) };
}

export async function deleteCargoItem(id: string) {
  try {
    await prisma.cargoItem.delete({ where: { id } });
    revalidateCargoViews();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Tovarni o‘chirishda xatolik" };
  }
}

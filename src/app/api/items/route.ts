import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createCargoItem, findCargoByTrackNumber } from "@/lib/cargo-service";
import { itemListInclude, parseItemRequest, sanitizeItem } from "@/lib/item-api";
import { prisma } from "@/lib/prisma";
import { cargoItemSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const track = searchParams.get("track")?.trim();
  if (track) {
    const item = await findCargoByTrackNumber(track);
    return NextResponse.json(item ? [item] : []);
  }

  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status")?.trim();
  const category = searchParams.get("category")?.trim();
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();

  const items = await prisma.cargoItem.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { trackNumber: { contains: q } },
                { notes: { contains: q } },
              ],
            }
          : {},
        status ? { status } : {},
        category ? { category } : {},
        from || to
          ? {
              date: {
                gte: from ? new Date(from) : undefined,
                lte: to ? new Date(`${to}T23:59:59`) : undefined,
              },
            }
          : {},
      ],
    },
    include: itemListInclude,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(items.map(sanitizeItem));
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const parsedRequest = await parseItemRequest(request);
    const parsed = cargoItemSchema.safeParse(parsedRequest.body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }

    if (parsed.data.entryType === "PDF" && !parsedRequest.pdfData) {
      return NextResponse.json({ error: "PDF fayl yuklash majburiy" }, { status: 400 });
    }

    const result = await createCargoItem(
      {
        name: parsed.data.name,
        trackNumber: parsed.data.trackNumber,
        entryType: parsed.data.entryType,
        category: parsed.data.category,
        status: parsed.data.status,
        date: parsed.data.date,
        etaDate: parsed.data.etaDate,
        notes: parsed.data.notes,
        warehouseId: parsed.data.warehouseId,
        operatorId: parsed.data.operatorId,
        imageUrl: parsed.data.imageUrl,
        description: parsed.data.description,
        price: parsed.data.price,
        telegramUrl: parsed.data.telegramUrl,
        locationUrl: parsed.data.locationUrl,
        chinaAddress: parsed.data.chinaAddress,
        pdfFileName: parsed.data.pdfFileName,
        pdfUrl: parsed.data.pdfUrl,
      },
      { pdfData: parsedRequest.pdfData }
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.item, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Bu trek raqami allaqachon mavjud"
        : error instanceof Error
          ? error.message
          : "Tovar qo‘shishda xatolik";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

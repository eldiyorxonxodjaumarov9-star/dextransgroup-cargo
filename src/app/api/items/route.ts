import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { itemPayload, itemListInclude, parseItemRequest, sanitizeItem } from "@/lib/item-api";
import { prisma } from "@/lib/prisma";
import { itemPdfPath } from "@/lib/upload-pdf";
import { cargoItemSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
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

    const base = itemPayload(parsed.data);
    const item = await prisma.cargoItem.create({
      data: {
        ...base,
        pdfData: parsed.data.entryType === "PDF" ? parsedRequest.pdfData : null,
        pdfUrl: null,
      },
      include: itemListInclude,
    });

    if (item.entryType === "PDF") {
      const updated = await prisma.cargoItem.update({
        where: { id: item.id },
        data: { pdfUrl: itemPdfPath(item.id) },
        include: itemListInclude,
      });
      return NextResponse.json(sanitizeItem(updated), { status: 201 });
    }

    return NextResponse.json(sanitizeItem(item), { status: 201 });
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

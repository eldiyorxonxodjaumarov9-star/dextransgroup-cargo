import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  deleteCargoItem,
  updateCargoItemFields,
} from "@/lib/cargo-service";
import { parseItemRequest } from "@/lib/item-api";
import { prisma } from "@/lib/prisma";
import { cargoItemSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.cargoItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Tovar topilmadi" }, { status: 404 });
    }

    const parsedRequest = await parseItemRequest(request);
    if (
      parsedRequest.body.entryType === "PDF" &&
      !parsedRequest.pdfData &&
      existing.pdfData
    ) {
      parsedRequest.body.pdfUrl = "pending";
      parsedRequest.body.pdfFileName =
        parsedRequest.body.pdfFileName || existing.pdfFileName || "";
    }

    const parsed = cargoItemSchema.safeParse(parsedRequest.body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }

    if (
      parsed.data.entryType === "PDF" &&
      !parsedRequest.pdfData &&
      !existing.pdfData
    ) {
      return NextResponse.json({ error: "PDF fayl yuklash majburiy" }, { status: 400 });
    }

    const result = await updateCargoItemFields(id, parsed.data, {
      pdfData: parsedRequest.pdfData,
      keepPdf: Boolean(existing.pdfData) && !parsedRequest.pdfData,
      existingPdfName: existing.pdfFileName,
      existingImageUrl: existing.imageUrl,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.item);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Bu trek raqami allaqachon mavjud"
        : error instanceof Error
          ? error.message
          : "Tovarni yangilashda xatolik";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await deleteCargoItem(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Tovarni o‘chirishda xatolik" },
      { status: 400 }
    );
  }
}

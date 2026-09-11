import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emptyToNull } from "@/lib/utils";
import {
  parseWarehouseRequest,
  warehouseListSelect,
  warehousePayload,
} from "@/lib/warehouse-api";
import { warehousePdfPath } from "@/lib/upload-pdf";
import { warehouseSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ombor topilmadi" }, { status: 404 });
    }

    const parsedRequest = await parseWarehouseRequest(request);
    if (
      parsedRequest.body.entryType === "PDF" &&
      !parsedRequest.pdfData &&
      existing.pdfData
    ) {
      parsedRequest.body.pdfUrl = "pending";
      parsedRequest.body.pdfFileName =
        parsedRequest.body.pdfFileName || existing.pdfFileName || "";
    }

    const parsed = warehouseSchema.safeParse(parsedRequest.body);
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

    const base = warehousePayload(parsed.data);
    const isPdf = parsed.data.entryType === "PDF";

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...base,
        pdfData: isPdf ? parsedRequest.pdfData ?? existing.pdfData : null,
        pdfUrl: isPdf ? warehousePdfPath(id) : null,
        pdfFileName: isPdf
          ? emptyToNull(parsed.data.pdfFileName) || existing.pdfFileName
          : null,
      },
      select: warehouseListSelect,
    });

    return NextResponse.json(warehouse);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Omborni yangilashda xatolik",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.warehouse.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Omborni o‘chirishda xatolik" },
      { status: 400 }
    );
  }
}

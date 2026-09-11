import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  parseWarehouseRequest,
  warehouseListSelect,
  warehousePayload,
} from "@/lib/warehouse-api";
import { warehousePdfPath } from "@/lib/upload-pdf";
import { warehouseSchema } from "@/lib/validations";

export async function GET() {
  const warehouses = await prisma.warehouse.findMany({
    select: warehouseListSelect,
    orderBy: [{ region: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(warehouses);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const parsedRequest = await parseWarehouseRequest(request);
    const parsed = warehouseSchema.safeParse(parsedRequest.body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validatsiya xatosi" },
        { status: 400 }
      );
    }

    if (parsed.data.entryType === "PDF" && !parsedRequest.pdfData) {
      return NextResponse.json({ error: "PDF fayl yuklash majburiy" }, { status: 400 });
    }

    const base = warehousePayload(parsed.data);
    const warehouse = await prisma.warehouse.create({
      data: {
        ...base,
        pdfData: parsed.data.entryType === "PDF" ? parsedRequest.pdfData : null,
        pdfUrl: null,
      },
      select: warehouseListSelect,
    });

    if (warehouse.entryType === "PDF") {
      const updated = await prisma.warehouse.update({
        where: { id: warehouse.id },
        data: { pdfUrl: warehousePdfPath(warehouse.id) },
        select: warehouseListSelect,
      });
      return NextResponse.json(updated, { status: 201 });
    }

    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Ombor qo‘shishda xatolik",
      },
      { status: 400 }
    );
  }
}

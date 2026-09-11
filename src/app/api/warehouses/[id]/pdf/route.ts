import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
    select: { pdfData: true, pdfFileName: true, entryType: true },
  });

  if (!warehouse || warehouse.entryType !== "PDF" || !warehouse.pdfData) {
    return NextResponse.json({ error: "PDF topilmadi" }, { status: 404 });
  }

  const filename = warehouse.pdfFileName || "warehouse.pdf";
  return new NextResponse(Buffer.from(warehouse.pdfData), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

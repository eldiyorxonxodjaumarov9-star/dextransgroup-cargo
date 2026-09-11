import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const item = await prisma.cargoItem.findUnique({
    where: { id },
    select: { pdfData: true, pdfFileName: true, entryType: true },
  });

  if (!item || item.entryType !== "PDF" || !item.pdfData) {
    return NextResponse.json({ error: "PDF topilmadi" }, { status: 404 });
  }

  const filename = item.pdfFileName || "cargo-item.pdf";
  return new NextResponse(Buffer.from(item.pdfData), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

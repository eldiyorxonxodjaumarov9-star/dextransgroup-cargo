import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const item = await prisma.guestServiceMedia.findUnique({
    where: { id },
    select: { data: true, mimeType: true, fileName: true, mediaUrl: true },
  });

  if (!item?.data) {
    if (item?.mediaUrl && /^https?:\/\//i.test(item.mediaUrl)) {
      return NextResponse.redirect(item.mediaUrl);
    }
    return NextResponse.json({ error: "Fayl topilmadi" }, { status: 404 });
  }

  const filename = item.fileName || "media";
  return new NextResponse(Buffer.from(item.data), {
    headers: {
      "Content-Type": item.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

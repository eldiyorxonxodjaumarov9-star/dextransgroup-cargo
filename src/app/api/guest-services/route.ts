import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  guestMediaPath,
  parseGuestMediaRequest,
  sanitizeGuestMedia,
} from "@/lib/guest-media-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.guestServiceMedia.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(items.map(sanitizeGuestMedia));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const parsed = await parseGuestMediaRequest(request);

    if (parsed.body.kind === "BANNER") {
      await prisma.guestServiceMedia.updateMany({
        where: { kind: "BANNER" },
        data: { isActive: false },
      });
    }

    const created = await prisma.guestServiceMedia.create({
      data: {
        kind: parsed.body.kind,
        title: parsed.body.title,
        sortOrder: parsed.body.sortOrder,
        isActive: parsed.body.isActive,
        fileName: parsed.body.fileName,
        mimeType: parsed.body.mimeType,
        mediaUrl: parsed.body.mediaUrl,
        data: parsed.data,
      },
    });

    const mediaUrl =
      parsed.data != null ? guestMediaPath(created.id) : created.mediaUrl;

    const updated = await prisma.guestServiceMedia.update({
      where: { id: created.id },
      data: { mediaUrl },
    });

    return NextResponse.json(sanitizeGuestMedia(updated), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Media yuklashda xatolik",
      },
      { status: 400 }
    );
  }
}

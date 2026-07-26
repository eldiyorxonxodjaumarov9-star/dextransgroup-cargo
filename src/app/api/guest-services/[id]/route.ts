import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  guestMediaPath,
  parseGuestMediaRequest,
  sanitizeGuestMedia,
} from "@/lib/guest-media-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.guestServiceMedia.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    }

    const parsed = await parseGuestMediaRequest(request, { requireFile: false });

    if (parsed.body.kind === "BANNER") {
      await prisma.guestServiceMedia.updateMany({
        where: { kind: "BANNER", NOT: { id } },
        data: { isActive: false },
      });
    }

    const hasNewFile = parsed.data != null;
    const mediaUrl = hasNewFile
      ? guestMediaPath(id)
      : parsed.body.mediaUrl || existing.mediaUrl;

    const updated = await prisma.guestServiceMedia.update({
      where: { id },
      data: {
        kind: parsed.body.kind,
        title: parsed.body.title ?? existing.title,
        sortOrder: parsed.body.sortOrder,
        isActive: parsed.body.isActive,
        fileName: hasNewFile ? parsed.body.fileName : existing.fileName,
        mimeType: hasNewFile ? parsed.body.mimeType : existing.mimeType,
        mediaUrl,
        data: hasNewFile ? parsed.data : undefined,
      },
    });

    return NextResponse.json(sanitizeGuestMedia(updated));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Yangilashda xatolik",
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
    await prisma.guestServiceMedia.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "O‘chirishda xatolik" }, { status: 400 });
  }
}

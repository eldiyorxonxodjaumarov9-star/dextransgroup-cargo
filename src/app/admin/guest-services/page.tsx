import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { GuestServicesManager } from "@/components/admin/GuestServicesManager";
import { getAdminSession } from "@/lib/auth";
import { sanitizeGuestMedia } from "@/lib/guest-media-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminGuestServicesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const rows = await prisma.guestServiceMedia.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const media = rows.map((row) => {
    const clean = sanitizeGuestMedia(row);
    return {
      id: clean.id,
      kind: clean.kind,
      title: clean.title,
      sortOrder: clean.sortOrder,
      mediaUrl: clean.mediaUrl,
      fileName: clean.fileName,
      mimeType: clean.mimeType,
      isActive: clean.isActive,
    };
  });

  return (
    <div className="space-y-4">
      <AdminNav username={session.username} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mehmon xizmatlari</h1>
        <p className="text-muted">
          Banner, rasmlar va video — bosh sahifa banneri va /guest-services
          sahifasida ko‘rinadi.
        </p>
      </div>
      <GuestServicesManager media={media} />
    </div>
  );
}

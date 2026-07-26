import { GuestServicesPageContent } from "@/components/GuestServicesPageContent";
import { sanitizeGuestMedia } from "@/lib/guest-media-api";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";

export const dynamic = "force-dynamic";

export default async function GuestServicesPage() {
  const media = await safeQuery(
    "GuestServices.media",
    async () => {
      const rows = await prisma.guestServiceMedia.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      return rows.map((row) => {
        const clean = sanitizeGuestMedia(row);
        return {
          id: clean.id,
          kind: clean.kind,
          title: clean.title,
          mediaUrl: clean.mediaUrl,
          mimeType: clean.mimeType,
        };
      });
    },
    []
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <GuestServicesPageContent media={media} />
    </div>
  );
}

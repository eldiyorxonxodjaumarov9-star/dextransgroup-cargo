import { HomePublicContent } from "@/components/HomePublicContent";
import { DEFAULT_GUEST_BANNER } from "@/lib/guest-services";
import { sanitizeGuestMedia } from "@/lib/guest-media-api";
import { itemListInclude, sanitizeItem } from "@/lib/item-api";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";
import { warehouseListSelect } from "@/lib/warehouse-api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [warehouseCount, rawItems, warehouses, operators, guestBannerUrl] =
    await Promise.all([
      safeQuery(
        "Home.warehouseCount",
        () => prisma.warehouse.count({ where: { region: "CHINA" } }),
        0
      ),
      safeQuery(
        "Home.cargo",
        () =>
          prisma.cargoItem.findMany({
            include: itemListInclude,
            orderBy: { date: "desc" },
          }),
        []
      ),
      safeQuery(
        "Home.warehouses",
        () =>
          prisma.warehouse.findMany({
            select: warehouseListSelect,
            orderBy: [{ region: "asc" }, { name: "asc" }],
          }),
        []
      ),
      safeQuery(
        "Home.operators",
        () =>
          prisma.operator.findMany({
            orderBy: [{ isActive: "desc" }, { name: "asc" }],
          }),
        []
      ),
      safeQuery(
        "Home.guestBanner",
        async () => {
          const banner = await prisma.guestServiceMedia.findFirst({
            where: { kind: "BANNER", isActive: true },
            orderBy: { updatedAt: "desc" },
          });
          if (!banner) return DEFAULT_GUEST_BANNER;
          const clean = sanitizeGuestMedia(banner);
          return clean.mediaUrl || DEFAULT_GUEST_BANNER;
        },
        DEFAULT_GUEST_BANNER
      ),
    ]);

  const items = rawItems.map((item) => {
    const clean = sanitizeItem(item);
    return {
      ...clean,
      id: item.id,
      category: item.category,
      date: item.date,
      etaDate: item.etaDate,
    };
  });

  const chinaCount = warehouses.filter((w) => w.region === "CHINA").length;
  const tashkentCount = warehouses.filter((w) => w.region === "TASHKENT").length;

  return (
    <HomePublicContent
      warehouseCount={warehouseCount}
      chinaCount={chinaCount}
      tashkentCount={tashkentCount}
      items={items}
      operators={operators}
      guestBannerUrl={guestBannerUrl}
    />
  );
}

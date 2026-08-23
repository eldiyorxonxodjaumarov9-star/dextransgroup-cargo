import { HomePublicContent } from "@/components/HomePublicContent";
import { getHomePublicData } from "@/lib/home-public-data";

export const dynamic = "force-dynamic";

export default async function TelegramMiniAppPage() {
  const data = await getHomePublicData();

  return (
    <HomePublicContent
      warehouseCount={data.warehouseCount}
      chinaCount={data.chinaCount}
      tashkentCount={data.tashkentCount}
      items={data.items}
      operators={data.operators}
      guestBannerUrl={data.guestBannerUrl}
    />
  );
}

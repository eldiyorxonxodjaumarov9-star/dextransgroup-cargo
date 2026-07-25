import { WarehouseRegionButtons } from "@/components/WarehouseRegionButtons";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Omborlar | DEXTRANS GROUP CARGO",
  description: "Xitoy va Toshkent omborlari",
};

export default async function WarehousesHubPage() {
  const [chinaCount, tashkentCount] = await Promise.all([
    safeQuery(
      "WarehousesHub.china",
      () => prisma.warehouse.count({ where: { region: "CHINA" } }),
      0
    ),
    safeQuery(
      "WarehousesHub.tashkent",
      () => prisma.warehouse.count({ where: { region: "TASHKENT" } }),
      0
    ),
  ]);

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Omborlar</h1>
        <p className="max-w-2xl text-sm text-muted">
          Kerakli hududni tanlang — xaritalar alohida sahifada ochiladi.
        </p>
      </div>
      <WarehouseRegionButtons
        chinaCount={chinaCount}
        tashkentCount={tashkentCount}
      />
    </div>
  );
}

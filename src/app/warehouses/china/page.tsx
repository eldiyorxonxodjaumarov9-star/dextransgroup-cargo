import { BackButton } from "@/components/BackButton";
import { WarehouseDetailCard } from "@/components/WarehouseDetailCard";
import { WarehouseEmpty } from "@/components/WarehouseEmpty";
import { WarehouseRegionHeader } from "@/components/WarehouseRegionHeader";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";
import { warehouseListSelect } from "@/lib/warehouse-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "China warehouses | DEXTRANS GROUP CARGO",
  description: "China warehouse addresses, map and Google Maps",
};

export default async function ChinaWarehousesPage() {
  const warehouses = await safeQuery(
    "ChinaWarehousesPage",
    () =>
      prisma.warehouse.findMany({
        where: { region: "CHINA" },
        select: warehouseListSelect,
        orderBy: { name: "asc" },
      }),
    []
  );

  return (
    <div className="space-y-6 pb-6">
      <BackButton href="/#warehouses" />
      <WarehouseRegionHeader region="CHINA" count={warehouses.length} />

      {warehouses.length ? (
        <div className="space-y-6">
          {warehouses.map((warehouse) => (
            <WarehouseDetailCard key={warehouse.id} warehouse={warehouse} />
          ))}
        </div>
      ) : (
        <WarehouseEmpty region="CHINA" />
      )}
    </div>
  );
}

import { BackButton } from "@/components/BackButton";
import { WarehouseDetailCard } from "@/components/WarehouseDetailCard";
import { WarehouseEmpty } from "@/components/WarehouseEmpty";
import { WarehouseRegionHeader } from "@/components/WarehouseRegionHeader";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";
import { warehouseListSelect } from "@/lib/warehouse-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tashkent warehouses | DEXTRANS GROUP CARGO",
  description: "Tashkent warehouse addresses, map and Google Maps",
};

export default async function TashkentWarehousesPage() {
  const warehouses = await safeQuery(
    "TashkentWarehousesPage",
    () =>
      prisma.warehouse.findMany({
        where: { region: "TASHKENT" },
        select: warehouseListSelect,
        orderBy: { name: "asc" },
      }),
    []
  );

  return (
    <div className="space-y-6 pb-6">
      <BackButton href="/#warehouses" />
      <WarehouseRegionHeader region="TASHKENT" count={warehouses.length} />

      {warehouses.length ? (
        <div className="space-y-6">
          {warehouses.map((warehouse) => (
            <WarehouseDetailCard key={warehouse.id} warehouse={warehouse} />
          ))}
        </div>
      ) : (
        <WarehouseEmpty region="TASHKENT" />
      )}
    </div>
  );
}

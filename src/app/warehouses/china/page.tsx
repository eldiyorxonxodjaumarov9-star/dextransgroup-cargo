import { BackButton } from "@/components/BackButton";
import { WarehouseDetailCard } from "@/components/WarehouseDetailCard";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";
import { warehouseListSelect } from "@/lib/warehouse-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Xitoy omborlari | DEXTRANS GROUP CARGO",
  description: "Xitoy omborlari manzillari, xarita va Google Maps",
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
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-teal)]">
          🇨🇳 Xitoy
        </p>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Xitoy omborlari
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          {warehouses.length} ta ombor — manzil, telefon va interaktiv xarita.
        </p>
      </div>

      {warehouses.length ? (
        <div className="space-y-6">
          {warehouses.map((warehouse) => (
            <WarehouseDetailCard key={warehouse.id} warehouse={warehouse} />
          ))}
        </div>
      ) : (
        <div className="card p-6 text-muted">Hozircha Xitoy ombori yo‘q.</div>
      )}
    </div>
  );
}

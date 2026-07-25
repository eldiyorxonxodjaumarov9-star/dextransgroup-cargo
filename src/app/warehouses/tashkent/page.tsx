import { BackButton } from "@/components/BackButton";
import { WarehouseDetailCard } from "@/components/WarehouseDetailCard";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";
import { warehouseListSelect } from "@/lib/warehouse-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Toshkent omborlari | DEXTRANS GROUP CARGO",
  description: "Toshkent omborlari manzillari, xarita va Google Maps",
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
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-teal)]">
          🇺🇿 Toshkent
        </p>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Toshkent omborlari
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
        <div className="card p-6 text-muted">
          Hozircha Toshkent ombori yo‘q. Admin panel orqali qo‘shish mumkin.
        </div>
      )}
    </div>
  );
}

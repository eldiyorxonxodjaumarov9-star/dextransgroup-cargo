import { WarehouseDetailCard } from "@/components/WarehouseDetailCard";
import { warehouseListSelect } from "@/lib/warehouse-api";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";

export const dynamic = "force-dynamic";

export default async function WarehousesPage() {
  const warehouses = await safeQuery(
    "WarehousesPage",
    () =>
      prisma.warehouse.findMany({
        select: warehouseListSelect,
        orderBy: [{ region: "asc" }, { name: "asc" }],
      }),
    []
  );

  const china = warehouses.filter((w) => w.region === "CHINA");
  const tashkent = warehouses.filter((w) => w.region === "TASHKENT");

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Omborlar</h1>
        <p className="max-w-2xl text-muted">
          Xitoy omborlari — qo‘lda kiritilgan manzillar yoki yuklangan PDF
          hujjatlar, interaktiv xarita va Google Maps.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-bold">Xitoydagi omborlar ({china.length})</h2>
        <div className="space-y-6">
          {china.map((warehouse) => (
            <WarehouseDetailCard key={warehouse.id} warehouse={warehouse} />
          ))}
          {!china.length && (
            <div className="card p-6 text-muted">Hozircha Xitoy ombori yo‘q.</div>
          )}
        </div>
      </section>

      {tashkent.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-2xl font-bold">Toshkentdagi omborlar ({tashkent.length})</h2>
          <div className="space-y-6">
            {tashkent.map((warehouse) => (
              <WarehouseDetailCard key={warehouse.id} warehouse={warehouse} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

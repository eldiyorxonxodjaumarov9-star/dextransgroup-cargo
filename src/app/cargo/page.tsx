import { ItemCard } from "@/components/ItemCard";
import { CATEGORY_LABELS } from "@/lib/constants";
import { itemListInclude, sanitizeItem } from "@/lib/item-api";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";

export const dynamic = "force-dynamic";

export default async function CargoPage() {
  const rawItems = await safeQuery(
    "CargoPage",
    () =>
      prisma.cargoItem.findMany({
        include: itemListInclude,
        orderBy: { date: "desc" },
      }),
    []
  );
  const items = rawItems.map(sanitizeItem);

  const sections = [
    { id: "new", category: "NEW" as const },
    { id: "transit", category: "IN_TRANSIT" as const },
    { id: "arrived", category: "ARRIVED" as const },
  ];

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Cargo bo‘limi</h1>
        <p className="max-w-2xl text-muted">
          Yangi, yo‘ldagi va Toshkentga kelgan tovarlarni kuzating. Har bir
          kartada trek raqami, holat, ombor, operator va Telegram havolasi bor.
        </p>
      </section>

      {sections.map((section) => {
        const list = items.filter((item) => item.category === section.category);
        return (
          <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">
                  {CATEGORY_LABELS[section.category]}
                </h2>
                <p className="text-sm text-muted">{list.length} ta tovar</p>
              </div>
            </div>
            {list.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="card p-6 text-muted">Hozircha tovar yo‘q.</div>
            )}
          </section>
        );
      })}
    </div>
  );
}

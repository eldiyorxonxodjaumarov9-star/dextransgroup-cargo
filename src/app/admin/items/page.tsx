import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminNav";
import { ItemsManager } from "@/components/admin/ItemsManager";
import { getAdminSession } from "@/lib/auth";
import { itemListInclude, sanitizeItem } from "@/lib/item-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminItemsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [items, warehouses, operators] = await Promise.all([
    prisma.cargoItem.findMany({
      include: itemListInclude,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.warehouse.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.operator.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedItems = items.map((item) => {
    const clean = sanitizeItem(item);
    return {
      ...clean,
      date: item.date.toISOString(),
      etaDate: item.etaDate ? item.etaDate.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  });

  return (
    <AdminShell
      username={session.username}
      title="Tovarlar"
      description="Qo‘lda kiritish yoki PDF yuklash — Cargo sahifasida ko‘rinadi."
    >
      <ItemsManager
        items={serializedItems}
        warehouses={warehouses}
        operators={operators}
      />
    </AdminShell>
  );
}

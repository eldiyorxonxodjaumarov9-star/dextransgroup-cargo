import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { WarehousesManager } from "@/components/admin/WarehousesManager";
import { getAdminSession } from "@/lib/auth";
import { warehouseListSelect } from "@/lib/warehouse-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminWarehousesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const warehouses = await prisma.warehouse.findMany({
    select: warehouseListSelect,
    orderBy: [{ region: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-4">
      <AdminNav username={session.username} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Omborlar</h1>
        <p className="text-muted">
          Qo‘lda kiritish yoki PDF yuklash orqali ombor qo‘shing — ikkalasi ham
          Omborlar sahifasida ko‘rinadi.
        </p>
      </div>
      <WarehousesManager warehouses={warehouses} />
    </div>
  );
}

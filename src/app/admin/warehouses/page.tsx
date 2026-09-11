import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminNav";
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
    <AdminShell
      username={session.username}
      title="Omborlar"
      description="Qo‘lda kiritish yoki PDF yuklash orqali ombor qo‘shing — ikkalasi ham Omborlar sahifasida ko‘rinadi."
    >
      <WarehousesManager warehouses={warehouses} />
    </AdminShell>
  );
}

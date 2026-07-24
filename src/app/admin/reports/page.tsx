import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { ReportsManager } from "@/components/admin/ReportsManager";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const items = await prisma.cargoItem.findMany({
    include: { warehouse: true, operator: true },
    orderBy: { date: "desc" },
  });

  const serialized = items.map((item) => ({
    id: item.id,
    name: item.name,
    trackNumber: item.trackNumber,
    category: item.category,
    status: item.status,
    date: item.date.toISOString(),
    warehouse: item.warehouse ? { name: item.warehouse.name } : null,
    operator: item.operator ? { name: item.operator.name } : null,
  }));

  return (
    <div className="space-y-4">
      <AdminNav username={session.username} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Hisobot</h1>
        <p className="text-muted">
          Oddiy jadval, qidiruv, filterlar va Excel eksport.
        </p>
      </div>
      <ReportsManager items={serialized} />
    </div>
  );
}

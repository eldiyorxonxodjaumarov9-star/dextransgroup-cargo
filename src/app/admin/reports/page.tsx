import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminNav";
import { ReportsManager } from "@/components/admin/ReportsManager";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const items = await prisma.cargoItem.findMany({
    select: {
      id: true,
      name: true,
      trackNumber: true,
      category: true,
      status: true,
      date: true,
      warehouse: { select: { name: true } },
      operator: { select: { name: true } },
    },
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
    <AdminShell
      username={session.username}
      title="Hisobot"
      description="Oddiy jadval, qidiruv, filterlar va Excel eksport."
    >
      <ReportsManager items={serialized} />
    </AdminShell>
  );
}

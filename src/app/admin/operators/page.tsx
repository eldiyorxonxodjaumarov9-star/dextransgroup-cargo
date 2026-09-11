import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminNav";
import { OperatorsManager } from "@/components/admin/OperatorsManager";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOperatorsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [operators, warehouses] = await Promise.all([
    prisma.operator.findMany({
      include: { warehouse: true },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
    prisma.warehouse.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AdminShell
      username={session.username}
      title="Operatorlar"
      description="Operatorlar katalogini qo‘shing yoki yangilang."
    >
      <OperatorsManager operators={operators} warehouses={warehouses} />
    </AdminShell>
  );
}

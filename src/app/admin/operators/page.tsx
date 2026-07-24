import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
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
    <div className="space-y-4">
      <AdminNav username={session.username} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Operatorlar</h1>
        <p className="text-muted">
          Operatorlar katalogini qo‘shing yoki yangilang.
        </p>
      </div>
      <OperatorsManager operators={operators} warehouses={warehouses} />
    </div>
  );
}

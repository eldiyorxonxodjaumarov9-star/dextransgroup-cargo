import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [items, warehouses, operators, newCount, transitCount, arrivedCount] =
    await Promise.all([
      prisma.cargoItem.count(),
      prisma.warehouse.count(),
      prisma.operator.count(),
      prisma.cargoItem.count({ where: { category: "NEW" } }),
      prisma.cargoItem.count({ where: { category: "IN_TRANSIT" } }),
      prisma.cargoItem.count({ where: { category: "ARRIVED" } }),
    ]);

  const cards = [
    { label: "Jami tovarlar", value: items, href: "/admin/items" },
    { label: "Yangi", value: newCount, href: "/admin/items" },
    { label: "Yo‘lda", value: transitCount, href: "/admin/items" },
    { label: "Kelgan", value: arrivedCount, href: "/admin/items" },
    { label: "Omborlar", value: warehouses, href: "/admin/warehouses" },
    { label: "Operatorlar", value: operators, href: "/admin/operators" },
  ];

  return (
    <div className="space-y-4">
      <AdminNav username={session.username} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Boshqaruv paneli</h1>
        <p className="text-muted">
          Tovarlar, omborlar, operatorlar va hisobotlarni shu yerdan boshqaring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="card p-5 hover:border-primary">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

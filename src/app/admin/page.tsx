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
    { label: "Jami tovarlar", value: items, href: "/admin/items", tone: "from-teal-500/20 to-cyan-500/10" },
    { label: "Yangi", value: newCount, href: "/admin/items", tone: "from-violet-500/20 to-fuchsia-500/10" },
    { label: "Yo‘lda", value: transitCount, href: "/admin/items", tone: "from-sky-500/20 to-blue-500/10" },
    { label: "Kelgan", value: arrivedCount, href: "/admin/items", tone: "from-emerald-500/20 to-teal-500/10" },
    { label: "Omborlar", value: warehouses, href: "/admin/warehouses", tone: "from-amber-500/20 to-orange-500/10" },
    { label: "Operatorlar", value: operators, href: "/admin/operators", tone: "from-cyan-500/20 to-teal-500/10" },
  ];

  return (
    <div className="space-y-4">
      <AdminNav username={session.username} />
      <div className="mb-6">
        <p className="section-kicker mb-2">Control center</p>
        <h1 className="section-title">Boshqaruv paneli</h1>
        <p className="mt-2 text-muted">
          Tovarlar, omborlar, operatorlar va hisobotlarni shu yerdan boshqaring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`premium-hover relative overflow-hidden rounded-[1.35rem] border border-border bg-gradient-to-br ${card.tone} p-5 text-[var(--text)]`}
          >
            <p className="text-sm text-[var(--muted)]">{card.label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-[var(--text)]">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

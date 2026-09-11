import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminNav";
import { AnimatedNumber } from "@/components/design/motion";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [
    items,
    warehouses,
    operators,
    newCount,
    transitCount,
    arrivedCount,
    borderCount,
  ] = await Promise.all([
    prisma.cargoItem.count(),
    prisma.warehouse.count(),
    prisma.operator.count(),
    prisma.cargoItem.count({ where: { category: "NEW" } }),
    prisma.cargoItem.count({ where: { category: "IN_TRANSIT" } }),
    prisma.cargoItem.count({ where: { category: "ARRIVED" } }),
    prisma.cargoItem.count({ where: { status: "AT_BORDER" } }),
  ]);

  const cards = [
    { label: "Jami yuklar", value: items, href: "/admin/items" },
    { label: "Yangi", value: newCount, href: "/admin/items" },
    { label: "Yo‘lda", value: transitCount, href: "/admin/items" },
    { label: "Toshkentga kelgan", value: arrivedCount, href: "/admin/items" },
    { label: "Omborlar", value: warehouses, href: "/admin/warehouses" },
    { label: "Operatorlar", value: operators, href: "/admin/operators" },
  ];

  const flow = [
    { label: "CHINA", value: newCount },
    { label: "DEPARTED", value: transitCount },
    { label: "BORDER", value: borderCount },
    { label: "TASHKENT", value: arrivedCount },
  ];

  return (
    <AdminShell
      username={session.username}
      title="Dashboard"
      description="Logistics operating system"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]"
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {card.label}
            </p>
            <p className="mt-3 font-display text-4xl font-bold tracking-tight">
              <AnimatedNumber value={card.value} />
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="section-kicker">Cargo flow</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          CHINA → TASHKENT
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {flow.map((step, i) => (
            <div
              key={step.label}
              className="relative rounded-[var(--radius-lg)] bg-[var(--surface-soft)] px-4 py-4"
            >
              <p className="tracking-id text-[10px] text-[var(--accent-secondary)]">
                {String(i + 1).padStart(2, "0")} · {step.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold">
                <AnimatedNumber value={step.value} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

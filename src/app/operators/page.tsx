import { OperatorCard } from "@/components/OperatorCard";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";

export const dynamic = "force-dynamic";

export default async function OperatorsPage() {
  const operators = await safeQuery(
    "OperatorsPage",
    () =>
      prisma.operator.findMany({
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
      }),
    []
  );

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-[var(--brand-ink)] dark:text-foreground">
          Operatorlar
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Bog‘lanish uchun telefon raqami va Telegram manzili.
        </p>
      </section>

      {operators.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {operators.map((operator) => (
            <OperatorCard key={operator.id} operator={operator} />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-border bg-card p-6 text-muted">
          Hozircha operator qo‘shilmagan.
        </div>
      )}
    </div>
  );
}

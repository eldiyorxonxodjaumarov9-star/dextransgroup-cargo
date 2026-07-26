"use client";

import Link from "next/link";
import { MapPinned, Warehouse } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export function WarehouseRegionButtons({
  chinaCount,
  tashkentCount,
}: {
  chinaCount: number;
  tashkentCount: number;
}) {
  const { t, format } = useLocale();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link
        href="/warehouses/china"
        className="group flex min-h-[140px] flex-col justify-between rounded-[24px] border border-border bg-card p-5 shadow-[0_18px_40px_-30px_rgba(8,32,64,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-teal)] hover:shadow-[0_22px_45px_-28px_rgba(8,32,64,0.4)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-teal-soft)] text-[var(--brand-teal)]">
            <Warehouse size={22} />
          </span>
          <span className="text-2xl" aria-hidden>
            🇨🇳
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--brand-ink)] dark:text-foreground">
            {t.warehouse.chinaTitle}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {format(t.warehouse.chinaHint, { n: chinaCount })}
          </p>
        </div>
      </Link>

      <Link
        href="/warehouses/tashkent"
        className="group flex min-h-[140px] flex-col justify-between rounded-[24px] border border-border bg-card p-5 shadow-[0_18px_40px_-30px_rgba(8,32,64,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-teal)] hover:shadow-[0_22px_45px_-28px_rgba(8,32,64,0.4)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-teal-soft)] text-[var(--brand-teal)]">
            <MapPinned size={22} />
          </span>
          <span className="text-2xl" aria-hidden>
            🇺🇿
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--brand-ink)] dark:text-foreground">
            {t.warehouse.tashkentTitle}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {format(t.warehouse.tashkentHint, { n: tashkentCount })}
          </p>
        </div>
      </Link>
    </div>
  );
}

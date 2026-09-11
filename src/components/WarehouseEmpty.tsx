"use client";

import { useLocale } from "@/components/LocaleProvider";

export function WarehouseEmpty({ region }: { region: "CHINA" | "TASHKENT" }) {
  const { t } = useLocale();
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text-secondary)]">
      {region === "CHINA" ? t.warehouse.emptyChina : t.warehouse.emptyTashkent}
    </div>
  );
}

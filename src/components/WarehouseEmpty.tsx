"use client";

import { useLocale } from "@/components/LocaleProvider";

export function WarehouseEmpty({ region }: { region: "CHINA" | "TASHKENT" }) {
  const { t } = useLocale();
  return (
    <div className="card p-6 text-muted">
      {region === "CHINA" ? t.warehouse.emptyChina : t.warehouse.emptyTashkent}
    </div>
  );
}

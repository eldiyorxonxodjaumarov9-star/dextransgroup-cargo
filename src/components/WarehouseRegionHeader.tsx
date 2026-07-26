"use client";

import { useLocale } from "@/components/LocaleProvider";

export function WarehouseRegionHeader({
  region,
  count,
}: {
  region: "CHINA" | "TASHKENT";
  count: number;
}) {
  const { t, format } = useLocale();
  const isChina = region === "CHINA";

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-teal)]">
        {isChina ? "🇨🇳" : "🇺🇿"} {t.regions[region]}
      </p>
      <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
        {isChina ? t.warehouse.chinaTitle : t.warehouse.tashkentTitle}
      </h1>
      <p className="max-w-2xl text-sm text-muted">
        {format(isChina ? t.warehouse.chinaHint : t.warehouse.tashkentHint, {
          n: count,
        })}
      </p>
    </div>
  );
}

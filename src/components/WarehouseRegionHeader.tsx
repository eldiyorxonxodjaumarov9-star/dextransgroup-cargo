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
      <p className="section-kicker tracking-id">
        {isChina ? "CN" : "UZ"} · {t.regions[region]}
      </p>
      <h1 className="section-title font-display">
        {isChina ? t.warehouse.chinaTitle : t.warehouse.tashkentTitle}
      </h1>
      <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
        {format(isChina ? t.warehouse.chinaHint : t.warehouse.tashkentHint, {
          n: count,
        })}
      </p>
    </div>
  );
}

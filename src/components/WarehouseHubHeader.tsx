"use client";

import { useLocale } from "@/components/LocaleProvider";

export function WarehouseHubHeader() {
  const { t } = useLocale();
  return (
    <div className="space-y-2">
      <p className="section-kicker">{t.nav.warehouses}</p>
      <h1 className="section-title font-display">{t.warehouse.hubTitle}</h1>
      <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
        {t.warehouse.hubSubtitle}
      </p>
    </div>
  );
}

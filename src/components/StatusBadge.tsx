"use client";

import { CATEGORY_COLORS, STATUS_COLORS } from "@/lib/constants";
import type { CargoCategory, CargoStatus } from "@/lib/types";
import { useLocale } from "@/components/LocaleProvider";

export function StatusBadge({ status }: { status: string }) {
  const { t } = useLocale();
  const key = status as CargoStatus;
  return (
    <span className={`badge ${STATUS_COLORS[key] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"}`}>
      {t.statuses[key] || status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const { t } = useLocale();
  const key = category as CargoCategory;
  return (
    <span className={`badge ${CATEGORY_COLORS[key] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"}`}>
      {t.categories[key] || category}
    </span>
  );
}

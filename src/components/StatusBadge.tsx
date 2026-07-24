import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import type { CargoCategory, CargoStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: string }) {
  const key = status as CargoStatus;
  return (
    <span className={`badge ${STATUS_COLORS[key] || "bg-slate-100 text-slate-700"}`}>
      {STATUS_LABELS[key] || status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const key = category as CargoCategory;
  return (
    <span className={`badge ${CATEGORY_COLORS[key] || "bg-slate-100 text-slate-700"}`}>
      {CATEGORY_LABELS[key] || category}
    </span>
  );
}

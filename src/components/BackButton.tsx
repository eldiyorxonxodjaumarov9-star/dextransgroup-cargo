"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export function BackButton({
  href = "/#warehouses",
  label,
}: {
  href?: string;
  label?: string;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const text = label || t.warehouse.back;

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(href);
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] hover:text-[var(--accent)]"
      aria-label={text}
    >
      <ArrowLeft size={16} />
      {text}
    </button>
  );
}

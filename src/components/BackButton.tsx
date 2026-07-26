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
      className="btn btn-secondary !min-h-11"
      aria-label={text}
    >
      <ArrowLeft size={16} />
      {text}
    </button>
  );
}

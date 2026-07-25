"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({
  href = "/#warehouses",
  label = "Orqaga",
}: {
  href?: string;
  label?: string;
}) {
  const router = useRouter();

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
      aria-label={label}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}

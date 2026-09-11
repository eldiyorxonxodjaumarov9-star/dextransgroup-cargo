"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

export function TrackingSearch({
  placeholder,
  ctaLabel,
  className,
  defaultValue = "",
}: {
  placeholder: string;
  ctaLabel: string;
  className?: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = q.trim();
    const hash = value
      ? `#cargo?q=${encodeURIComponent(value)}`
      : "#cargo";
    const el = document.getElementById("cargo");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.dispatchEvent(
        new CustomEvent("dextrans:cargo-search", { detail: { q: value } })
      );
      window.history.replaceState(null, "", `/${hash}`);
      return;
    }
    router.push(`/${hash}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("track-command", className)}
      role="search"
      aria-label="Cargo tracking"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-label={placeholder}
      />
      <button type="submit" className="inline-flex items-center gap-2">
        <span className="hidden sm:inline">{ctaLabel}</span>
        <ArrowRight size={18} aria-hidden />
      </button>
    </form>
  );
}

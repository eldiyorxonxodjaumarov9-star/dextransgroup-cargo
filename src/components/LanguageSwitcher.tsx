"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((item) => item.id === locale) || LOCALES[0];

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold",
          compact && "!min-h-10 !px-2.5"
        )}
        aria-label={t.lang}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {current.short}
        <ChevronDown size={14} className="text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 z-[70] mt-2 min-w-[11rem] overflow-hidden rounded-2xl border border-border bg-card py-1 shadow-xl">
          {LOCALES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => choose(item.id)}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm",
                item.id === locale
                  ? "bg-[var(--brand-teal-soft)] font-bold text-[var(--brand-teal)]"
                  : "text-foreground hover:bg-background"
              )}
            >
              <span>{item.label}</span>
              <span className="text-xs text-muted">{item.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

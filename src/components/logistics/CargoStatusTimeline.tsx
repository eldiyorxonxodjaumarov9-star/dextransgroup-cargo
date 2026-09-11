"use client";

import { motion, useReducedMotion } from "motion/react";
import { CARGO_STATUS_ORDER, STATUS_LABELS } from "@/lib/constants";
import type { CargoStatus } from "@/lib/types";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/utils";

export function CargoStatusTimeline({
  status,
  className,
  compact = false,
}: {
  status: string;
  className?: string;
  compact?: boolean;
}) {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const current = CARGO_STATUS_ORDER.includes(status as CargoStatus)
    ? (status as CargoStatus)
    : "CHINA_WAREHOUSE";
  const currentIndex = CARGO_STATUS_ORDER.indexOf(current);

  return (
    <ol className={cn("grid gap-2", className)}>
      {CARGO_STATUS_ORDER.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const label =
          t.statuses[step] || STATUS_LABELS[step] || step.replaceAll("_", " ");

        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={cn(
                "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                done &&
                  "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]",
                active &&
                  "border-[var(--accent-secondary)] bg-transparent text-[var(--accent-secondary)]",
                !done &&
                  !active &&
                  "border-[var(--border)] text-[var(--text-muted)]"
              )}
            >
              {done ? "✓" : active ? "●" : "○"}
              {active && !reduced && (
                <motion.span
                  className="absolute inset-0 rounded-full border border-[var(--accent-secondary)]"
                  animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              )}
            </span>
            {!compact && (
              <span
                className={cn(
                  "min-w-0 flex-1 text-xs sm:text-sm",
                  active
                    ? "font-semibold text-[var(--text)]"
                    : done
                      ? "text-[var(--text-secondary)]"
                      : "text-[var(--text-muted)]"
                )}
              >
                {label}
              </span>
            )}
            {index < CARGO_STATUS_ORDER.length - 1 && compact ? null : null}
          </li>
        );
      })}
    </ol>
  );
}

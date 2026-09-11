"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const STEPS = [
  { code: "CN / GZ-04", city: "GUANGZHOU", role: "WAREHOUSE" },
  { code: "ROUTE", city: "DEPARTED", role: "IN MOTION" },
  { code: "BORDER", city: "CHECKPOINT", role: "AT BORDER" },
  { code: "UZ / TAS-01", city: "TASHKENT", role: "HUB" },
] as const;

export function HeroLogisticsViz({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6",
        className
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Active corridor</p>
          <p className="mt-2 font-display text-xl font-700 tracking-tight sm:text-2xl">
            CHINA → UZBEKISTAN
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-[var(--accent)]",
              !reduced && "pulse-node"
            )}
          />
          Live route
        </span>
      </div>

      <div className="relative space-y-0">
        <div className="absolute bottom-4 left-[15px] top-4 w-px bg-[var(--border)] sm:left-[17px]" />
        {!reduced && (
          <motion.div
            className="absolute left-[13px] h-2 w-2 rounded-full bg-[var(--accent-secondary)] sm:left-[15px]"
            style={{ boxShadow: "0 0 12px rgba(82,229,255,0.8)" }}
            animate={{ top: ["8%", "88%", "8%"] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {STEPS.map((step, i) => (
          <div key={step.code} className="relative flex gap-4 py-3.5">
            <div
              className={cn(
                "relative z-[1] mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-[var(--surface)]",
                i === 0 || i === STEPS.length - 1
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--accent-secondary)]"
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="tracking-id text-[11px] text-[var(--text-muted)]">
                  {step.code}
                </p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                  {step.role}
                </p>
              </div>
              <p className="mt-1 font-display text-lg font-semibold tracking-tight">
                {step.city}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-4">
        {[
          { label: "Distance", value: "≈ 4,800 km" },
          { label: "Mode", value: "MULTIMODAL" },
          { label: "Network", value: "14 CN HUBS" },
        ].map((cell) => (
          <div
            key={cell.label}
            className="rounded-[var(--radius-md)] bg-[var(--surface-soft)] px-3 py-2.5"
          >
            <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {cell.label}
            </p>
            <p className="mt-1 tracking-id text-xs font-semibold text-[var(--text)]">
              {cell.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

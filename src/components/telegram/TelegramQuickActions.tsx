"use client";

import Link from "next/link";
import {
  Headphones,
  PackageSearch,
  Users,
  Warehouse,
} from "lucide-react";

const actions = [
  { href: "/#cargo", label: "Yukni tekshirish", icon: PackageSearch },
  { href: "/warehouses", label: "Omborlar", icon: Warehouse },
  { href: "/#operators", label: "Operatorlar", icon: Users },
  { href: "/guest-services", label: "Xizmatlar", icon: Headphones },
] as const;

export function TelegramQuickActions() {
  return (
    <div className="page-wrap pt-3">
      <p className="section-kicker mb-3">Mini App</p>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex min-h-14 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-semibold transition active:scale-[0.98]"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--accent)]">
                <Icon size={16} />
              </span>
              <span className="min-w-0 leading-tight">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

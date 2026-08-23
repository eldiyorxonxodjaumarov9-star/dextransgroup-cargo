"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  FileSpreadsheet,
  Languages,
  LayoutDashboard,
  LogOut,
  Package,
  Users,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Boshqaruv", icon: LayoutDashboard },
  { href: "/admin/items", label: "Tovarlar", icon: Package },
  { href: "/admin/warehouses", label: "Omborlar", icon: Warehouse },
  { href: "/admin/operators", label: "Operatorlar", icon: Users },
  { href: "/admin/guest-services", label: "Mehmon xizmati", icon: Languages },
  { href: "/admin/reports", label: "Hisobot", icon: FileSpreadsheet },
];

export function AdminNav({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-border bg-[var(--surface-elevated)] shadow-[var(--shadow-premium)] sm:mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-teal-soft)] text-[var(--brand-teal)]">
            <Boxes size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-bold tracking-tight">Admin panel</p>
            <p className="truncate text-sm text-muted" title={username}>
              {username}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary text-sm"
          onClick={() => void logout()}
        >
          <LogOut size={15} />
          Chiqish
        </button>
      </div>
      <div className="-mx-1 overflow-x-auto px-3 py-3">
        <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-[var(--shadow-glow)]"
                    : "bg-background/70 text-muted hover:text-foreground"
                )}
              >
                <Icon size={15} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

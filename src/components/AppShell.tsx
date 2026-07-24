"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Home,
  Menu,
  Moon,
  Package,
  Radio,
  Shield,
  Sun,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Bosh sahifa", icon: Home },
  { href: "/cargo", label: "Cargo", icon: Package },
  { href: "/warehouses", label: "Omborlar", icon: Warehouse },
  { href: "/operators", label: "Operatorlar", icon: Users },
  { href: "/channels", label: "Kanallar", icon: Radio },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Avoid hydration mismatch for theme-dependent UI
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount gate
    setMounted(true);
  }, []);
  const isDark = mounted && theme === "dark";

  return (
    <div className="min-h-screen bg-[var(--shell-bg)] text-foreground">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Menyuni yopish"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[var(--sidebar)] px-3 py-5 text-[var(--sidebar-fg)] transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-2 px-2">
          <Link
            href="/"
            className="block w-full max-w-[210px]"
            onClick={() => setSidebarOpen(false)}
          >
            <BrandLogo
              variant="worldwide"
              priority
              className="w-full max-w-[210px]"
            />
          </Link>
          <button
            type="button"
            className="shrink-0 rounded-xl border border-white/15 p-2 text-white/80 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-white/12 text-white"
                    : "text-[var(--sidebar-muted)] hover:bg-white/8 hover:text-white"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[var(--sidebar-active)]" />
                )}
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 px-2 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sidebar-muted)]">
            Integrating the Asian Frontier
          </p>
        </div>
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-border p-2.5 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Menyu"
              >
                <Menu size={18} />
              </button>
              <Link href="/" className="hidden min-w-0 sm:block">
                <BrandLogo variant="cargo" className="h-10 w-auto max-w-[200px]" />
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="rounded-xl border border-border p-2.5"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Mavzu"
              >
                {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
              </button>
              <div className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold">
                UZ
                <ChevronDown size={14} className="text-muted" />
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}

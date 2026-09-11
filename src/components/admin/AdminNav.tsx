"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  ContactRound,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/items", label: "Yuklar", icon: Package },
  { href: "/admin/customers", label: "Mijozlar", icon: ContactRound },
  { href: "/admin/warehouses", label: "Omborlar", icon: Warehouse },
  { href: "/admin/operators", label: "Operatorlar", icon: Users },
  { href: "/admin/guest-services", label: "Mehmon xizmatlari", icon: Boxes },
  { href: "/admin/reports", label: "Hisobotlar", icon: FileSpreadsheet },
];

export function AdminShell({
  username,
  children,
  title,
  description,
}: {
  username: string;
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("nav-locked", open);
    return () => document.body.classList.remove("nav-locked");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {links.map((link) => {
        const Icon = link.icon;
        const active =
          pathname === link.href ||
          (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            title={link.label}
            className={cn(
              "inline-flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]",
              collapsed && "justify-center px-2"
            )}
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span className="min-w-0 truncate">{link.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-[100dvh] w-full">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-[100dvh] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex",
          collapsed ? "w-[76px]" : "w-[248px]"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-4">
          {!collapsed && (
            <Link href="/admin" className="min-w-0">
              <BrandLogo variant="nav" className="h-7 w-auto max-w-[150px]" />
            </Link>
          )}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)]"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        {nav}
        <div className="border-t border-[var(--border)] p-3">
          {!collapsed && (
            <p className="mb-2 truncate px-2 tracking-id text-[10px] text-[var(--text-muted)]">
              {username}
            </p>
          )}
          <button
            type="button"
            onClick={logout}
            className={cn(
              "inline-flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-semibold text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)]",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut size={16} />
            {!collapsed && "Chiqish"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex min-h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_85%,transparent)] px-4 py-3 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              {title && (
                <h1 className="truncate font-display text-lg font-semibold tracking-tight sm:text-xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="truncate text-xs text-[var(--text-secondary)] sm:text-sm">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher compact variant="nav" />
            <Link href="/" className="btn btn-secondary !hidden !min-h-10 !text-xs sm:!inline-flex">
              Sayt
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-[min(88vw,300px)] flex-col bg-[var(--surface)] shadow-2xl"
              initial={reduced ? false : { x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
                <BrandLogo variant="nav" className="h-7 w-auto max-w-[140px]" />
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              {nav}
              <div className="border-t border-[var(--border)] p-3">
                <p className="mb-2 px-2 tracking-id text-[10px] text-[var(--text-muted)]">
                  {username}
                </p>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-semibold text-[var(--danger)]"
                >
                  <LogOut size={16} />
                  Chiqish
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** @deprecated Use AdminShell — kept for gradual migration */
export function AdminNav({ username }: { username: string }) {
  return (
    <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3 lg:hidden">
      <p className="tracking-id text-[10px] text-[var(--text-muted)]">{username}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="btn btn-secondary !min-h-9 !px-3 !text-xs">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

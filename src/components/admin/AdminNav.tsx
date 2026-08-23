"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes,
  FileSpreadsheet,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

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

  const navLinks = (
    <>
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
            className={cn(
              "inline-flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition sm:w-auto sm:shrink-0",
              active
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--panel-2)] text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            <Icon size={15} className="shrink-0" />
            <span className="min-w-0 break-words">{link.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="mb-4 overflow-hidden border border-[var(--border)] bg-[var(--panel)] sm:mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--accent)]/15 text-[var(--accent)]">
            <Boxes size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-bold tracking-tight">Admin panel</p>
            <p className="truncate text-sm text-[var(--muted)]" title={username}>
              {username}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--panel-2)] md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
            aria-expanded={open}
          >
            <Menu size={18} />
          </button>
          <button
            type="button"
            className="btn btn-secondary text-sm"
            onClick={() => void logout()}
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </div>

      <div className="hidden px-3 py-3 md:block">
        <div className="flex flex-wrap gap-2">{navLinks}</div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[96] md:hidden"
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
              className="absolute inset-y-0 left-0 flex w-[min(320px,88vw)] flex-col bg-[var(--panel)] text-[var(--text)] shadow-2xl"
              initial={reduced ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
                <p className="text-sm font-semibold">Admin menu</p>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--panel-2)]"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex flex-col gap-2 overflow-y-auto p-3">{navLinks}</nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

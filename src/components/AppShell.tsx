"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteFooter } from "@/components/SiteFooter";
import { cn } from "@/lib/utils";

const publicNav = [
  { id: "home", href: "/#home", label: "Bosh sahifa" },
  { id: "cargo", href: "/#cargo", label: "Cargo" },
  { id: "warehouses", href: "/#warehouses", label: "Omborlar" },
  { id: "operators", href: "/#operators", label: "Operatorlar" },
  { id: "channels", href: "/#channels", label: "Kanallar" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount gate
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  useEffect(() => {
    if (isAdmin) return;

    const ids = publicNav.map((item) => item.id);
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.15, 0.35, 0.55],
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isAdmin, pathname]);

  function scrollToSection(id: string) {
    setMenuOpen(false);
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
      window.history.replaceState(null, "", `/#${id}`);
      return;
    }
    window.location.href = `/#${id}`;
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--shell-bg)] text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link href="/" className="shrink-0">
              <BrandLogo variant="cargo" className="h-9 w-auto max-w-[180px]" />
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/#home" className="btn btn-secondary !px-3 !py-2 text-xs">
                Saytga qaytish
              </Link>
              <button
                type="button"
                className="rounded-xl border border-border p-2.5"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Mavzu"
              >
                {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--shell-bg)] text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <button
            type="button"
            className="shrink-0"
            onClick={() => scrollToSection("home")}
            aria-label="Bosh sahifa"
          >
            <BrandLogo variant="cargo" className="h-10 w-auto max-w-[190px]" />
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {publicNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold transition",
                  activeSection === item.id
                    ? "bg-[var(--brand-teal-soft)] text-[var(--brand-teal)]"
                    : "text-muted hover:bg-background hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/admin"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-background hover:text-foreground"
            >
              Admin
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl border border-border p-2.5"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Mavzu"
            >
              {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
            </button>
            <div className="hidden items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold sm:flex">
              UZ
              <ChevronDown size={14} className="text-muted" />
            </div>
            <button
              type="button"
              className="rounded-xl border border-border p-2.5 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Menyu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-card px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {publicNav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "rounded-xl px-3 py-3 text-left text-sm font-semibold",
                    activeSection === item.id
                      ? "bg-[var(--brand-teal-soft)] text-[var(--brand-teal)]"
                      : "text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-foreground"
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
      <SiteFooter />
    </div>
  );
}

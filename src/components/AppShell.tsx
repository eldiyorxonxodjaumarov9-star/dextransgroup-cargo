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
  { id: "guest-services", href: "/guest-services", label: "Mehmonlar" },
  { id: "cargo", href: "/#cargo", label: "Cargo" },
  { id: "warehouses", href: "/#warehouses", label: "Omborlar" },
  { id: "operators", href: "/#operators", label: "Operatorlar" },
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
    document.body.classList.toggle("nav-locked", menuOpen);
    return () => document.body.classList.remove("nav-locked");
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

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
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0.12, 0.3, 0.5],
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isAdmin, pathname]);

  function goNav(item: (typeof publicNav)[number]) {
    setMenuOpen(false);
    if (item.href.startsWith("/guest-services") || !item.href.includes("#")) {
      window.location.href = item.href;
      return;
    }
    const id = item.id;
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
      window.history.replaceState(null, "", `/#${id}`);
      return;
    }
    window.location.href = item.href;
  }

  if (isAdmin) {
    return (
      <div className="min-h-[100dvh] bg-[var(--shell-bg)] text-foreground">
        <header className="sticky-header border-b border-border bg-card/95 backdrop-blur">
          <div className="page-wrap flex h-16 items-center justify-between gap-3">
            <Link href="/" className="min-w-0 shrink" aria-label="DextransGroup Cargo">
              <BrandLogo
                variant="nav"
                priority
                className="h-9 w-auto max-w-[min(190px,52vw)] sm:h-10 sm:max-w-[220px]"
              />
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/#home"
                className="btn btn-secondary !min-h-10 !px-3 !py-2 text-xs"
              >
                Saytga qaytish
              </Link>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Mavzu"
              >
                {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
              </button>
            </div>
          </div>
        </header>
        <main className="page-wrap py-4 sm:py-6">{children}</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--shell-bg)] text-foreground">
      <header className="sticky-header border-b border-border bg-card/95 backdrop-blur">
        <div className="page-wrap flex h-[70px] items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            className="min-w-0 shrink"
            onClick={() => goNav({ id: "home", href: "/#home", label: "Bosh sahifa" })}
            aria-label="Bosh sahifa"
          >
            <BrandLogo
              variant="nav"
              priority
              className="h-10 w-auto max-w-[min(210px,55vw)] sm:h-11 sm:max-w-[250px]"
            />
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Asosiy menyu">
            {publicNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goNav(item)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold transition",
                  (pathname.startsWith("/guest-services")
                    ? item.id === "guest-services"
                    : activeSection === item.id)
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

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border"
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Menyuni yopish" : "Menyuni ochish"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Menyuni yopish"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(320px,88vw)] flex-col border-l border-border bg-card shadow-2xl safe-bottom">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <p className="text-sm font-bold">Menyu</p>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border"
                onClick={() => setMenuOpen(false)}
                aria-label="Yopish"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Mobil menyu">
              {publicNav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goNav(item)}
                  className={cn(
                    "min-h-11 rounded-xl px-3 py-3 text-left text-sm font-semibold",
                    (pathname.startsWith("/guest-services")
                      ? item.id === "guest-services"
                      : activeSection === item.id)
                      ? "bg-[var(--brand-teal-soft)] text-[var(--brand-teal)]"
                      : "text-foreground hover:bg-background"
                  )}
                >
                  {item.label}
                </button>
              ))}
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="min-h-11 rounded-xl px-3 py-3 text-sm font-semibold text-foreground hover:bg-background"
              >
                Admin
              </Link>
            </nav>
          </div>
        </div>
      )}

      <div className="page-wrap py-4 sm:py-6">{children}</div>
      <SiteFooter />
    </div>
  );
}

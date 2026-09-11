"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
import { LogisticsNetworkBackground } from "@/components/logistics/LogisticsNetworkBackground";
import { SiteFooter } from "@/components/SiteFooter";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  href: string;
  label: string;
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isTelegramAdminGate =
    pathname === "/telegram/admin" || pathname.startsWith("/telegram/admin/");
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const publicNav: NavItem[] = useMemo(
    () => [
      { id: "cargo", href: "/#cargo", label: t.nav.cargo },
      { id: "warehouses", href: "/#warehouses", label: t.nav.warehouses },
      { id: "guest-services", href: "/guest-services", label: t.nav.guests },
      { id: "operators", href: "/#operators", label: t.nav.operators },
    ],
    [t]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount gate
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = mounted ? theme !== "light" : true;
  const currentSection = pathname.startsWith("/guest-services")
    ? "guest-services"
    : activeSection;

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
    if (pathname.startsWith("/guest-services")) return;

    const ids = ["home", ...publicNav.map((item) => item.id)];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -55% 0px", threshold: [0.15, 0.35, 0.55] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isAdmin, pathname, publicNav]);

  function goNav(item: NavItem | { id: string; href: string }) {
    setMenuOpen(false);
    if (item.href.startsWith("/guest-services") || !item.href.includes("#")) {
      window.location.assign(item.href);
      return;
    }
    const node = document.getElementById(item.id);
    if (node) {
      node.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
      setActiveSection(item.id);
      window.history.replaceState(null, "", `/#${item.id}`);
      return;
    }
    window.location.assign(item.href);
  }

  const themeButton = (
    <button
      type="button"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)]"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t.nav.theme}
    >
      {mounted ? (
        isDark ? (
          <Sun size={16} />
        ) : (
          <Moon size={16} />
        )
      ) : (
        <Moon size={16} />
      )}
    </button>
  );

  if (isAdmin) {
    return (
      <div className="site-frame">
        <div className="relative min-h-[100dvh] w-full">
          <LogisticsNetworkBackground className="opacity-40" interactive={false} />
          <div className="relative z-[1] mx-auto min-h-[100dvh] w-full max-w-[1600px]">
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (isTelegramAdminGate) {
    return (
      <div className="site-frame">
        <div className="site-canvas min-h-[100dvh] w-full min-w-0 max-w-full">
          <main className="w-full min-w-0 max-w-full">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="site-frame">
      <LogisticsNetworkBackground />
      <div className="site-canvas">
        <header
          className={cn(
            "sticky top-0 z-[80] transition-all duration-300",
            scrolled ? "px-3 pt-3 sm:px-5 sm:pt-4" : "px-0 pt-0"
          )}
        >
          <motion.div
            className={cn(
              "mx-auto flex max-w-[1400px] items-center gap-2 transition-all duration-300",
              scrolled
                ? "glass-nav rounded-full px-3 py-2 sm:px-4"
                : "border-b border-transparent px-3 py-3 sm:px-5 lg:px-8 lg:py-5"
            )}
            initial={reduced ? false : { y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="flex min-w-0 shrink items-center gap-2"
              onClick={() => goNav({ id: "home", href: "/#home" })}
              aria-label={t.nav.home}
            >
              <BrandLogo
                variant="nav"
                priority
                className="h-7 w-auto max-w-[min(170px,42vw)] sm:h-8 lg:h-9 lg:max-w-[200px]"
              />
            </button>

            <nav
              className="mx-auto hidden items-center gap-1 lg:flex"
              aria-label={t.nav.mainMenu}
            >
              {publicNav.map((item) => {
                const active = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goNav(item)}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-[13px] font-medium transition",
                      active
                        ? "bg-[var(--surface-soft)] text-[var(--text)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text)]"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <LanguageSwitcher compact variant="nav" />
              <span className="hidden sm:inline-flex">{themeButton}</span>
              <Link
                href="/#cargo"
                className="btn btn-primary !hidden !min-h-10 !px-4 !text-xs lg:!inline-flex"
              >
                {t.home.ctaCargo}
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] lg:hidden"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </motion.div>
        </header>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="fixed inset-0 z-[95] lg:hidden"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/70"
                aria-label={t.nav.closeMenu}
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl safe-bottom"
                initial={reduced ? false : { y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 34 }}
              >
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4">
                  <p className="section-kicker !normal-case !tracking-[0.12em]">
                    {t.nav.menu}
                  </p>
                  <div className="flex items-center gap-2">
                    {themeButton}
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]"
                      onClick={() => setMenuOpen(false)}
                      aria-label={t.nav.closeMenu}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <nav className="overflow-y-auto px-3 py-3" aria-label={t.nav.mobileMenu}>
                  {publicNav.map((item, index) => {
                    const active = currentSection === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => goNav(item)}
                        initial={reduced ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * index }}
                        className={cn(
                          "mb-1 flex min-h-12 w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold",
                          active
                            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                            : "text-[var(--text)] hover:bg-[var(--surface-elevated)]"
                        )}
                      >
                        <span className="min-w-0 break-words pr-3">{item.label}</span>
                        <ArrowRight size={16} className="shrink-0" />
                      </motion.button>
                    );
                  })}
                  <Link
                    href="/#cargo"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-primary mt-3 w-full"
                  >
                    {t.home.ctaCargo}
                    <ArrowRight size={16} />
                  </Link>
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full min-w-0 max-w-full pb-8 pt-2 lg:pb-12">
          {children}
        </div>
        <SiteFooter />

        {/* Mobile bottom nav */}
        <nav
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
          aria-label={t.nav.mobileMenu}
        >
          <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
            {publicNav.map((item) => {
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goNav(item)}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center rounded-xl px-1 text-[10px] font-semibold uppercase tracking-wide",
                    active
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-muted)]"
                  )}
                >
                  <span
                    className={cn(
                      "mb-1 h-1 w-1 rounded-full",
                      active ? "bg-[var(--accent)]" : "bg-transparent"
                    )}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

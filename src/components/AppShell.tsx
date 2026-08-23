"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
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
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const publicNav: NavItem[] = useMemo(
    () => [
      { id: "home", href: "/#home", label: t.nav.home },
      { id: "guest-services", href: "/guest-services", label: t.nav.guests },
      { id: "cargo", href: "/#cargo", label: t.nav.cargo },
      { id: "warehouses", href: "/#warehouses", label: t.nav.warehouses },
      { id: "operators", href: "/#operators", label: t.nav.operators },
    ],
    [t]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount gate
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
        if (visible[0]?.target?.id) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -55% 0px", threshold: [0.15, 0.35, 0.55] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isAdmin, pathname, publicNav]);

  function goNav(item: NavItem) {
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

  if (isAdmin) {
    return (
      <div className="site-frame">
        <div className="site-canvas">
          <header className="sticky-header border-b border-[var(--border)] bg-[var(--panel)]">
            <div className="canvas-pad flex h-16 items-center justify-between gap-3">
              <Link href="/" className="min-w-0 shrink" aria-label="DextransGroup Cargo">
                <BrandLogo
                  variant="nav"
                  priority
                  className="h-8 w-auto max-w-[min(180px,50vw)]"
                />
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <LanguageSwitcher compact variant="nav" />
                <Link
                  href="/#home"
                  className="btn btn-secondary !min-h-10 !rounded-full !px-3 !py-2 !text-xs"
                >
                  {t.nav.backToSite}
                </Link>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-2)]"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  aria-label={t.nav.theme}
                >
                  {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
                </button>
              </div>
            </div>
          </header>
          <main className="canvas-pad py-4 sm:py-6">{children}</main>
          <SiteFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="site-frame">
      <div className="site-canvas">
        <div
          className={cn(
            "sticky top-0 z-[80] px-3 pt-3 sm:px-5 sm:pt-5 lg:px-8 lg:pt-6",
            scrolled && "pb-2"
          )}
        >
          <motion.header
            className={cn(
              "nav-pill mx-auto flex max-w-[1400px] items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3",
              scrolled && "shadow-[0_18px_40px_-28px_rgba(0,0,0,0.65)]"
            )}
            initial={reduced ? false : { y: -28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="flex min-w-0 shrink items-center gap-2 pl-1"
              onClick={() => goNav(publicNav[0])}
              aria-label={t.nav.home}
            >
              <BrandLogo
                variant="nav"
                priority
                className="h-8 w-auto max-w-[min(160px,42vw)] sm:h-9 sm:max-w-[190px]"
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
                        ? "text-[var(--text)]"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <LanguageSwitcher compact variant="nav" className="hidden sm:block" />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-2)] text-[var(--text)]"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label={t.nav.theme}
              >
                {mounted ? (isDark ? <Sun size={15} /> : <Moon size={15} />) : <Moon size={15} />}
              </button>
              <Link href="/admin" className="cta-capsule hidden md:inline-flex">
                <span className="cta-label">{t.nav.admin}</span>
                <span className="arrow-circle">
                  <ArrowUpRight size={16} />
                </span>
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-2)] lg:hidden"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </motion.header>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="fixed inset-0 z-[90] lg:hidden"
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
                className="absolute inset-x-3 top-[5.5rem] overflow-hidden rounded-[28px] bg-[var(--panel)] p-4 text-[var(--text)] shadow-2xl sm:inset-x-5"
                initial={reduced ? false : { y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{t.nav.menu}</p>
                  <LanguageSwitcher compact variant="nav" />
                </div>
                <nav className="grid gap-1" aria-label={t.nav.mobileMenu}>
                  {publicNav.map((item, index) => {
                    const active = currentSection === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => goNav(item)}
                        initial={reduced ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * index }}
                        className={cn(
                          "flex min-h-12 items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold",
                          active
                            ? "bg-[var(--accent)] text-white"
                            : "text-[var(--text)] hover:bg-[var(--panel-2)]"
                        )}
                      >
                        {item.label}
                        <ArrowUpRight size={16} />
                      </motion.button>
                    );
                  })}
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="cta-capsule mt-2"
                  >
                    <span className="cta-label flex-1 justify-center">{t.nav.admin}</span>
                    <span className="arrow-circle">
                      <ArrowUpRight size={16} />
                    </span>
                  </Link>
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pb-8 pt-2 lg:pb-12">{children}</div>
        <SiteFooter />
      </div>
    </div>
  );
}

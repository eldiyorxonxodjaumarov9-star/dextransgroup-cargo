"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Lock, Menu, Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MagneticButton } from "@/components/MagneticButton";
import { useLocale } from "@/components/LocaleProvider";
import { LogisticsNetworkBackground } from "@/components/logistics/LogisticsNetworkBackground";
import { SiteFooter } from "@/components/SiteFooter";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  href: string;
  label: string;
};

const DRAWER_EASE = [0.22, 1, 0.36, 1] as const;

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
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpen = useRef(false);
  const drawerId = useId();

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
    if (wasMenuOpen.current && !menuOpen) {
      menuBtnRef.current?.focus();
    }
    wasMenuOpen.current = menuOpen;
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

  function closeMenu() {
    setMenuOpen(false);
  }

  function goNav(item: NavItem | { id: string; href: string }) {
    closeMenu();
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
      className="site-header__icon-btn"
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
        <header className="site-header">
          <motion.div
            className={cn("site-header__bar", scrolled && "is-scrolled")}
            initial={reduced ? false : { y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: DRAWER_EASE }}
          >
            <button
              type="button"
              className="flex min-w-0 shrink-0 items-center"
              onClick={() => goNav({ id: "home", href: "/#home" })}
              aria-label={t.nav.home}
            >
              <BrandLogo variant="nav" priority />
            </button>

            <nav
              className="mx-auto hidden min-w-0 items-center gap-1.5 lg:flex xl:gap-2.5"
              aria-label={t.nav.mainMenu}
            >
              {publicNav.map((item) => {
                const active = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goNav(item)}
                    className={cn("site-header__link", active && "is-active")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <LanguageSwitcher compact variant="nav" />
              <span className="hidden sm:inline-flex">{themeButton}</span>
              <MagneticButton
                href="/admin/login"
                className="site-header__admin"
                aria-label={t.nav.adminLoginAria}
              >
                <Lock size={14} className="site-header__admin-icon" />
                <span className="site-header__admin-label">{t.nav.admin}</span>
              </MagneticButton>
              <MagneticButton
                href="/#cargo"
                className="btn btn-primary site-header__cta"
              >
                {t.home.ctaCargo}
                <ArrowRight size={14} className="cta-arrow" />
              </MagneticButton>
              <button
                ref={menuBtnRef}
                type="button"
                className="site-header__menu-btn lg:hidden"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
                aria-expanded={menuOpen}
                aria-controls={drawerId}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={menuOpen ? "close" : "open"}
                    initial={reduced ? false : { opacity: 0, rotate: -40, scale: 0.85 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={reduced ? undefined : { opacity: 0, rotate: 40, scale: 0.85 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex"
                  >
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </motion.div>
        </header>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id={drawerId}
              className="site-drawer lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label={t.nav.menu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.36, ease: DRAWER_EASE }}
            >
              <motion.button
                type="button"
                className="site-drawer__backdrop"
                aria-label={t.nav.closeMenu}
                onClick={closeMenu}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.36 }}
              />
              <motion.aside
                className="site-drawer__panel"
                initial={reduced ? false : { x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: reduced ? 0 : 0.38, ease: DRAWER_EASE }}
              >
                <div className="site-drawer__header">
                  <BrandLogo variant="nav" />
                  <button
                    type="button"
                    className="site-header__icon-btn"
                    onClick={closeMenu}
                    aria-label={t.nav.closeMenu}
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="site-drawer__nav" aria-label={t.nav.mobileMenu}>
                  {publicNav.map((item, index) => {
                    const active = currentSection === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => goNav(item)}
                        initial={reduced ? false : { opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: reduced ? 0 : 0.04 + index * 0.035,
                          duration: 0.28,
                          ease: DRAWER_EASE,
                        }}
                        className={cn(
                          "site-drawer__item",
                          active && "is-active"
                        )}
                      >
                        <span className="min-w-0 break-words">{item.label}</span>
                        <ArrowRight size={16} className="shrink-0 opacity-70" />
                      </motion.button>
                    );
                  })}

                  <motion.div
                    initial={reduced ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: reduced ? 0 : 0.2,
                      duration: 0.28,
                      ease: DRAWER_EASE,
                    }}
                  >
                    <Link
                      href="/#cargo"
                      onClick={closeMenu}
                      className="btn btn-primary mt-1 w-full min-h-11"
                    >
                      {t.home.ctaCargo}
                      <ArrowRight size={16} />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={reduced ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: reduced ? 0 : 0.24,
                      duration: 0.28,
                      ease: DRAWER_EASE,
                    }}
                  >
                    <Link
                      href="/admin/login"
                      onClick={closeMenu}
                      className="site-drawer__admin mt-1"
                      aria-label={t.nav.adminLoginAria}
                    >
                      {t.nav.adminLogin}
                    </Link>
                  </motion.div>
                </nav>

                <div className="site-drawer__tools">
                  <LanguageSwitcher compact variant="nav" />
                  {themeButton}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full min-w-0 max-w-full pb-8 pt-2 lg:pb-12">
          {children}
        </div>
        <SiteFooter />

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

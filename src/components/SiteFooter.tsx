"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { useLocale } from "@/components/LocaleProvider";
import { TELEGRAM_CHANNELS, TAPLINK_SOURCE } from "@/lib/channels";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { t } = useLocale();

  const footerLinks = [
    { href: "/#home", label: t.nav.home },
    { href: "/guest-services", label: t.nav.guests },
    { href: "/#cargo", label: t.nav.cargo },
    { href: "/#warehouses", label: t.nav.warehouses },
    { href: "/#operators", label: t.nav.operators },
  ];

  return (
    <footer className="mt-8 border-t border-white/10 bg-[var(--canvas)] text-[var(--text)] safe-bottom">
      <div className="canvas-pad py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-8">
            <BrandLogo
              variant="worldwide"
              className="max-w-[min(280px,80vw)]"
            />
            <p className="max-w-[14ch] text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.05] tracking-[-0.035em]">
              Dextrans Group Cargo
            </p>
            <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
              {t.footer.about}
            </p>
            <div className="h-px w-28 bg-[var(--accent)]" />
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {t.footer.menu}
              </p>
              <ul className="space-y-1">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-10 items-center text-[var(--text)]/80 transition hover:text-[var(--accent)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {t.footer.contact}
              </p>
              <ul className="space-y-1 text-sm text-[var(--text)]/75">
                {TELEGRAM_CHANNELS.filter((c) => c.kind === "telegram")
                  .slice(0, 3)
                  .map((channel) => (
                    <li key={channel.id}>
                      <a
                        href={channel.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center break-all transition hover:text-[var(--accent)]"
                      >
                        {channel.username || channel.title}
                      </a>
                    </li>
                  ))}
                <li>
                  <a
                    href={TAPLINK_SOURCE}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center transition hover:text-[var(--accent)]"
                  >
                    TapLink
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-[var(--muted)] sm:px-10">
        © {year} Dextrans Group Cargo. {t.footer.rights}
      </div>
    </footer>
  );
}

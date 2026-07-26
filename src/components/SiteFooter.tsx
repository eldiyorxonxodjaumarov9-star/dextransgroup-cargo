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
    <footer className="mt-10 border-t border-border bg-[var(--brand-navy)] text-white safe-bottom">
      <div className="page-wrap grid gap-8 py-8 sm:py-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-4">
          <BrandLogo variant="worldwide" className="max-w-[min(200px,70vw)]" />
          <p className="max-w-sm text-sm leading-relaxed text-white/70">{t.footer.about}</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            {t.footer.menu}
          </p>
          <ul className="space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center text-white/80 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            {t.footer.contact}
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            {TELEGRAM_CHANNELS.filter((c) => c.kind === "telegram")
              .slice(0, 3)
              .map((channel) => (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center break-all hover:text-white"
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
                className="inline-flex min-h-10 items-center hover:text-white"
              >
                TapLink
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/55 sm:px-6">
        © {year} Dextrans Group Cargo. {t.footer.rights}
      </div>
    </footer>
  );
}

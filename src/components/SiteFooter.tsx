"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useLocale } from "@/components/LocaleProvider";
import { TELEGRAM_CHANNELS, TAPLINK_SOURCE } from "@/lib/channels";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { t } = useLocale();
  const [open, setOpen] = useState<"nav" | "contact" | null>("nav");

  const footerLinks = [
    { href: "/#home", label: t.nav.home },
    { href: "/guest-services", label: t.nav.guests },
    { href: "/#cargo", label: t.nav.cargo },
    { href: "/#warehouses", label: t.nav.warehouses },
    { href: "/#operators", label: t.nav.operators },
  ];

  const contacts = [
    ...TELEGRAM_CHANNELS.filter((c) => c.kind === "telegram")
      .slice(0, 3)
      .map((channel) => ({
        href: channel.href,
        label: channel.username || channel.title,
        external: true as const,
      })),
    { href: TAPLINK_SOURCE, label: "TapLink", external: true as const },
  ];

  return (
    <footer className="mt-8 w-full min-w-0 max-w-full border-t border-white/10 bg-[var(--canvas)] text-[var(--text)] safe-bottom">
      <div className="canvas-pad py-12 sm:py-20 lg:py-24">
        <div className="grid w-full min-w-0 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-6 sm:space-y-8">
            <BrandLogo
              variant="worldwide"
              className="h-auto w-auto max-w-[min(240px,100%)]"
            />
            <p className="max-w-full break-words text-[clamp(1.7rem,7vw,4rem)] font-medium leading-[1.08] tracking-[-0.035em] sm:max-w-[16ch]">
              Dextrans Group Cargo
            </p>
            <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
              {t.footer.about}
            </p>
            <div className="h-px w-28 bg-[var(--accent)]" />
          </div>

          <div className="hidden gap-10 sm:grid sm:grid-cols-2">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {t.footer.menu}
              </p>
              <ul className="space-y-1">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-[var(--text)]/80 transition hover:text-[var(--accent)]"
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
                {contacts.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center break-all transition hover:text-[var(--accent)]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2 sm:hidden">
            {(
              [
                { key: "nav" as const, title: t.footer.menu, items: footerLinks },
                { key: "contact" as const, title: t.footer.contact, items: contacts },
              ] as const
            ).map((block) => (
              <div key={block.key} className="border border-white/10">
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
                  onClick={() =>
                    setOpen((value) => (value === block.key ? null : block.key))
                  }
                  aria-expanded={open === block.key}
                >
                  {block.title}
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition",
                      open === block.key && "rotate-180"
                    )}
                  />
                </button>
                {open === block.key && (
                  <ul className="space-y-1 border-t border-white/10 px-4 py-3 text-sm text-white/70">
                    {block.items.map((item) => (
                      <li key={item.href}>
                        {"external" in item && item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center break-all"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            className="inline-flex min-h-11 items-center"
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-center text-xs leading-relaxed text-[var(--muted)] sm:px-10">
        © {year} Dextrans Group Cargo. {t.footer.rights}
      </div>
    </footer>
  );
}

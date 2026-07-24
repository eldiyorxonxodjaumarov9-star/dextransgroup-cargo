import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { TELEGRAM_CHANNELS, TAPLINK_SOURCE } from "@/lib/channels";

const footerLinks = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/cargo", label: "Cargo" },
  { href: "/warehouses", label: "Omborlar" },
  { href: "/operators", label: "Operatorlar" },
  { href: "/channels", label: "Kanallar" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-border bg-[var(--brand-navy)] text-white">
      <div className="grid gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-4">
          <BrandLogo variant="worldwide" className="max-w-[200px]" />
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            Dextrans Group Cargo — Xitoy omborlari, yuk kuzatuvi va tezkor
            logistika. Integrating the Asian Frontier.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            Menyu
          </p>
          <ul className="space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/80 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            Aloqa
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
                    className="hover:text-white"
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
                className="hover:text-white"
              >
                TapLink
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/55 sm:px-6">
        © {year} Dextrans Group Cargo. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}

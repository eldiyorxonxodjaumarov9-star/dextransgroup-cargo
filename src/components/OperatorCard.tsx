"use client";

import { Phone, Send } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

type OperatorCardProps = {
  operator: {
    name: string;
    phone: string;
    telegram: string | null;
  };
};

export function OperatorCard({ operator }: OperatorCardProps) {
  const { t } = useLocale();
  const phoneHref = `tel:${operator.phone.replace(/[^\d+]/g, "")}`;
  const telegramHref = operator.telegram
    ? operator.telegram.startsWith("http")
      ? operator.telegram
      : `https://t.me/${operator.telegram.replace("@", "")}`
    : null;

  return (
    <article className="w-full min-w-0 max-w-full rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] font-display text-lg font-semibold text-[var(--accent-foreground)]">
          {operator.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="break-words font-display text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl">
            {operator.name}
          </h3>
          <p className="mt-1 tracking-id text-[10px] text-[var(--text-muted)]">
            {t.item.operator.replace(":", "").replace("：", "").trim()}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href={phoneHref}
          title={operator.phone}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:brightness-110"
        >
          <Phone size={15} className="shrink-0" />
          <span className="min-w-0 break-all">{operator.phone}</span>
        </a>

        {telegramHref && (
          <a
            href={telegramHref}
            target="_blank"
            rel="noreferrer"
            title={operator.telegram || undefined}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--accent-secondary)_40%,var(--border))] hover:text-[var(--accent-secondary)]"
          >
            <Send size={15} className="shrink-0" />
            <span className="min-w-0 break-all">{operator.telegram}</span>
          </a>
        )}
      </div>
    </article>
  );
}

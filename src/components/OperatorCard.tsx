"use client";

import { ArrowUpRight, Phone, Send } from "lucide-react";
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
    <article className="folder-card min-w-0 bg-[var(--panel)] p-6 sm:p-7">
      <div className="mb-8 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-4 flex h-12 w-12 items-center justify-center bg-[var(--accent)] text-lg font-semibold text-white">
            {operator.name.slice(0, 1).toUpperCase()}
          </div>
          <h3 className="break-words text-2xl font-medium tracking-tight text-[var(--text)]">
            {operator.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {t.item.operator.replace(":", "").replace("：", "").trim()}
          </p>
        </div>
        <span className="arrow-circle">
          <ArrowUpRight size={16} />
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <a href={phoneHref} title={operator.phone} className="cta-capsule cta-capsule-orange group">
          <span className="cta-label flex-1 justify-center gap-2">
            <Phone size={15} />
            <span className="break-all">{operator.phone}</span>
          </span>
          <span className="arrow-circle arrow-circle-light">
            <ArrowUpRight size={16} />
          </span>
        </a>

        {telegramHref && (
          <a
            href={telegramHref}
            target="_blank"
            rel="noreferrer"
            title={operator.telegram || undefined}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#111] transition hover:bg-[var(--cream)]"
          >
            <Send size={15} />
            <span className="break-all">{operator.telegram}</span>
          </a>
        )}
      </div>
    </article>
  );
}

"use client";

import Image from "next/image";
import { ArrowUpRight, FileText, MapPin, Package } from "lucide-react";
import { StatusBadge, CategoryBadge } from "./StatusBadge";
import { CargoStatusTimeline } from "@/components/logistics/CargoStatusTimeline";
import { useLocale } from "@/components/LocaleProvider";
import { formatDate } from "@/lib/utils";

type ItemCardProps = {
  item: {
    name: string;
    trackNumber: string;
    imageUrl: string | null;
    description: string | null;
    price: string | null;
    category: string;
    status: string;
    date: Date | string;
    etaDate?: Date | string | null;
    telegramUrl: string | null;
    locationUrl: string | null;
    chinaAddress: string | null;
    notes: string | null;
    entryType?: string | null;
    pdfUrl?: string | null;
    pdfFileName?: string | null;
    warehouse?: { name: string } | null;
    operator?: { name: string; phone: string } | null;
  };
};

export function ItemCard({ item }: ItemCardProps) {
  const { t } = useLocale();
  const isPdf = item.entryType === "PDF" && Boolean(item.pdfUrl);
  const fileLabel = item.pdfFileName || t.item.pdfDoc;
  const origin = item.warehouse?.name || item.chinaAddress || "CHINA";

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent-secondary)_35%,var(--border))]">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface-soft)]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className={
              isPdf
                ? "object-contain object-center p-2"
                : "object-cover transition duration-700 group-hover:scale-[1.02]"
            }
            sizes="(max-width:768px) calc(100vw - 48px), 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-[var(--text-muted)]">
            {isPdf ? <FileText size={36} /> : <Package size={36} />}
            {isPdf && (
              <span className="text-center text-xs uppercase tracking-wider">
                {t.item.pdfDoc}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <p className="tracking-id text-sm font-semibold text-[var(--accent)]">
            {item.trackNumber}
          </p>
          <h3 className="mt-1 break-words font-display text-lg font-semibold leading-snug tracking-tight sm:text-xl">
            {item.name}
          </h3>
          <p className="mt-2 tracking-id text-[11px] uppercase text-[var(--text-secondary)]">
            {origin}
            <span className="mx-2 text-[var(--accent-secondary)]">→</span>
            TASHKENT
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap gap-1.5">
          <CategoryBadge category={item.category} />
          <StatusBadge status={item.status} />
        </div>

        <CargoStatusTimeline status={item.status} />

        {isPdf ? (
          <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
            <FileText
              size={15}
              className="mt-0.5 shrink-0 text-[var(--accent)]"
              aria-hidden
            />
            <span className="line-clamp-3 min-w-0 flex-1 break-anywhere" title={fileLabel}>
              {fileLabel}
            </span>
          </div>
        ) : (
          item.description && (
            <p className="line-clamp-3 text-sm text-[var(--text-secondary)]">
              {item.description}
            </p>
          )
        )}

        <div className="mt-auto grid gap-1 text-sm text-[var(--text-secondary)]">
          <p>
            {t.item.date}{" "}
            <span className="tracking-id text-[var(--text)]">
              {formatDate(item.date)}
            </span>
          </p>
          {item.etaDate && (
            <p>
              {t.item.eta}{" "}
              <span className="tracking-id text-[var(--accent-secondary)]">
                {formatDate(item.etaDate)}
              </span>
            </p>
          )}
          {!isPdf && item.price && (
            <p>
              {t.item.price} {item.price}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 pt-1">
          {isPdf && item.pdfUrl && (
            <a
              href={item.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary w-full text-sm"
            >
              {t.item.openPdf}
              <ArrowUpRight size={14} />
            </a>
          )}
          {item.telegramUrl && (
            <a
              href={item.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary w-full text-sm"
            >
              {t.item.telegram}
            </a>
          )}
          {item.locationUrl && (
            <a
              href={item.locationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm font-semibold"
            >
              <MapPin size={14} className="shrink-0" />
              <span>{t.item.location}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

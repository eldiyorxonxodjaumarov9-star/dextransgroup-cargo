"use client";

import Image from "next/image";
import { ArrowUpRight, FileText, MapPin, Package } from "lucide-react";
import { StatusBadge, CategoryBadge } from "./StatusBadge";
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

  return (
    <article className="group min-w-0 overflow-hidden bg-[var(--panel)] text-[var(--text)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--panel-2)]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--muted)]">
            {isPdf ? <FileText size={36} /> : <Package size={36} />}
            {isPdf && <span className="text-xs uppercase tracking-wider">{t.item.pdfDoc}</span>}
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="break-words text-xl font-medium tracking-tight">{item.name}</h3>
            <p className="mt-1 break-all text-sm text-[var(--muted)]">{item.trackNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={item.category} />
            <StatusBadge status={item.status} />
          </div>
        </div>

        {isPdf ? (
          <p className="flex items-start gap-2 text-sm text-[var(--muted)]">
            <FileText size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <span>{item.pdfFileName || t.item.pdfDoc}</span>
          </p>
        ) : (
          item.description && (
            <p className="break-words text-sm text-[var(--muted)]">{item.description}</p>
          )
        )}

        <p className="text-sm text-[var(--muted)]">
          {t.item.date} {formatDate(item.date)}
        </p>

        {!isPdf && (
          <div className="grid gap-1 break-words text-sm text-[var(--muted)]">
            {item.price && (
              <p>
                {t.item.price} {item.price}
              </p>
            )}
            {item.etaDate && (
              <p>
                {t.item.eta} {formatDate(item.etaDate)}
              </p>
            )}
            <p>
              {t.item.warehouse} {item.warehouse?.name || "—"}
            </p>
            <p>
              {t.item.operator}{" "}
              {item.operator
                ? `${item.operator.name} (${item.operator.phone})`
                : "—"}
            </p>
            {item.chinaAddress && (
              <p className="break-anywhere">
                {t.item.chinaAddress} {item.chinaAddress}
              </p>
            )}
            {item.notes && (
              <p>
                {t.item.notes} {item.notes}
              </p>
            )}
          </div>
        )}

        {item.notes && isPdf && (
          <p className="break-words text-sm text-[var(--muted)]">{item.notes}</p>
        )}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
          {isPdf && item.pdfUrl && (
            <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="cta-capsule cta-capsule-orange group inline-flex w-full">
              <span className="cta-label">{t.item.openPdf}</span>
              <span className="arrow-circle arrow-circle-light">
                <ArrowUpRight size={16} />
              </span>
            </a>
          )}
          {item.telegramUrl && (
            <a
              href={item.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary w-full text-sm sm:w-auto"
            >
              {t.item.telegram}
            </a>
          )}
          {item.locationUrl && (
            <a
              href={item.locationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-2)] px-4 text-sm font-semibold sm:w-auto"
            >
              <MapPin size={14} /> {t.item.location}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

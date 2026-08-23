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
  const fileLabel = item.pdfFileName || t.item.pdfDoc;

  return (
    <article className="group box-border w-full min-w-0 max-w-full bg-[var(--panel)] text-[var(--text)]">
      <div className="relative aspect-[16/10] w-full min-w-0 overflow-hidden bg-[var(--panel-2)]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className={
              isPdf
                ? "object-contain object-center p-2"
                : "object-cover transition duration-700 group-hover:scale-105"
            }
            sizes="(max-width:768px) calc(100vw - 48px), 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-[var(--muted)]">
            {isPdf ? <FileText size={36} /> : <Package size={36} />}
            {isPdf && (
              <span className="text-center text-xs uppercase tracking-wider">
                {t.item.pdfDoc}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="box-border w-full min-w-0 space-y-3 p-4 sm:space-y-4 sm:p-5">
        <div className="min-w-0 max-w-full">
          <h3 className="break-words text-lg font-medium leading-snug tracking-tight sm:text-xl">
            {item.name}
          </h3>
          <p className="mt-1 break-all text-sm text-[var(--muted)]">
            {item.trackNumber}
          </p>
        </div>

        <div className="flex min-w-0 max-w-full flex-wrap gap-1.5">
          <CategoryBadge category={item.category} />
          <StatusBadge status={item.status} />
        </div>

        {isPdf ? (
          <div className="flex min-w-0 max-w-full items-start gap-2 text-sm text-[var(--muted)]">
            <FileText
              size={15}
              className="mt-0.5 shrink-0 text-[var(--accent)]"
              aria-hidden
            />
            <span
              className="min-w-0 flex-1 break-anywhere line-clamp-3"
              title={fileLabel}
            >
              {fileLabel}
            </span>
          </div>
        ) : (
          item.description && (
            <p className="min-w-0 max-w-full break-words text-sm text-[var(--muted)]">
              {item.description}
            </p>
          )
        )}

        <p className="min-w-0 break-words text-sm text-[var(--muted)]">
          {t.item.date} {formatDate(item.date)}
        </p>

        {!isPdf && (
          <div className="grid min-w-0 gap-1 break-words text-sm text-[var(--muted)]">
            {item.price && (
              <p className="min-w-0 break-words">
                {t.item.price} {item.price}
              </p>
            )}
            {item.etaDate && (
              <p className="min-w-0 break-words">
                {t.item.eta} {formatDate(item.etaDate)}
              </p>
            )}
            <p className="min-w-0 break-words">
              {t.item.warehouse} {item.warehouse?.name || "—"}
            </p>
            <p className="min-w-0 break-words">
              {t.item.operator}{" "}
              {item.operator
                ? `${item.operator.name} (${item.operator.phone})`
                : "—"}
            </p>
            {item.chinaAddress && (
              <p className="min-w-0 break-anywhere">
                {t.item.chinaAddress} {item.chinaAddress}
              </p>
            )}
            {item.notes && (
              <p className="min-w-0 break-words">
                {t.item.notes} {item.notes}
              </p>
            )}
          </div>
        )}

        {item.notes && isPdf && (
          <p className="min-w-0 break-words text-sm text-[var(--muted)]">
            {item.notes}
          </p>
        )}

        <div className="flex w-full min-w-0 max-w-full flex-col gap-2 pt-1">
          {isPdf && item.pdfUrl && (
            <a
              href={item.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="cta-capsule cta-capsule-orange group inline-flex w-full min-w-0 max-w-full"
            >
              <span className="cta-label min-h-12 flex-1">{t.item.openPdf}</span>
              <span className="arrow-circle arrow-circle-light shrink-0">
                <ArrowUpRight size={16} />
              </span>
            </a>
          )}
          {item.telegramUrl && (
            <a
              href={item.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary w-full min-w-0 text-sm"
            >
              {t.item.telegram}
            </a>
          )}
          {item.locationUrl && (
            <a
              href={item.locationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-2)] px-4 text-sm font-semibold"
            >
              <MapPin size={14} className="shrink-0" />
              <span className="min-w-0 break-words">{t.item.location}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

import Image from "next/image";
import { ExternalLink, FileText, MapPin, Package } from "lucide-react";
import { StatusBadge, CategoryBadge } from "./StatusBadge";
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
  const isPdf = item.entryType === "PDF" && Boolean(item.pdfUrl);

  if (isPdf) {
    return (
      <article className="card min-w-0 overflow-hidden">
        <div className="relative aspect-[16/10] bg-background">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
              <FileText size={36} className="text-[var(--brand-teal)]" />
              <span className="text-xs">PDF hujjat</span>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="break-words text-lg font-semibold">{item.name}</h3>
              <p className="break-all text-sm text-muted">{item.trackNumber}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={item.category} />
              <StatusBadge status={item.status} />
            </div>
          </div>

          <p className="flex min-w-0 items-start gap-2 break-words text-sm text-muted">
            <FileText size={15} className="mt-0.5 shrink-0 text-[var(--brand-teal)]" />
            <span>{item.pdfFileName || "PDF hujjat"}</span>
          </p>

          <p className="text-sm">
            <span className="text-muted">Sana:</span> {formatDate(item.date)}
          </p>

          {item.notes && (
            <p className="break-words text-sm text-muted">{item.notes}</p>
          )}

          <a
            href={item.pdfUrl!}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary w-full text-sm"
          >
            PDF ni ochish <ExternalLink size={14} />
          </a>
        </div>
      </article>
    );
  }

  return (
    <article className="card min-w-0 overflow-hidden">
      <div className="relative aspect-[16/10] bg-background">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <Package size={36} />
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold">{item.name}</h3>
            <p className="break-all text-sm text-muted">{item.trackNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CategoryBadge category={item.category} />
            <StatusBadge status={item.status} />
          </div>
        </div>

        {item.description && (
          <p className="break-words text-sm text-muted">{item.description}</p>
        )}

        <div className="grid gap-1 break-words text-sm">
          {item.price && (
            <p>
              <span className="text-muted">Narx:</span> {item.price}
            </p>
          )}
          <p>
            <span className="text-muted">Sana:</span> {formatDate(item.date)}
          </p>
          {item.etaDate && (
            <p>
              <span className="text-muted">Taxminiy yetib kelish:</span>{" "}
              {formatDate(item.etaDate)}
            </p>
          )}
          <p>
            <span className="text-muted">Ombor:</span>{" "}
            {item.warehouse?.name || "—"}
          </p>
          <p>
            <span className="text-muted">Operator:</span>{" "}
            {item.operator
              ? `${item.operator.name} (${item.operator.phone})`
              : "—"}
          </p>
          {item.chinaAddress && (
            <p className="break-anywhere">
              <span className="text-muted">Xitoy manzili:</span>{" "}
              {item.chinaAddress}
            </p>
          )}
          {item.notes && (
            <p>
              <span className="text-muted">Izoh:</span> {item.notes}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
          {item.telegramUrl && (
            <a
              href={item.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary w-full text-sm sm:w-auto"
            >
              Telegram <ExternalLink size={14} />
            </a>
          )}
          {item.locationUrl && (
            <a
              href={item.locationUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary w-full text-sm sm:w-auto"
            >
              <MapPin size={14} /> Lokatsiya
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

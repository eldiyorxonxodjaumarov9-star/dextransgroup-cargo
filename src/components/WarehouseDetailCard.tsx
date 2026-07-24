"use client";

import dynamic from "next/dynamic";
import {
  Clock3,
  ExternalLink,
  FileText,
  MapPinned,
  NotebookPen,
  Phone,
  UserRound,
} from "lucide-react";
import { REGION_LABELS } from "@/lib/constants";
import { buildGeocodeQuery, googleMapsSearchUrl } from "@/lib/geocode";
import type { WarehouseRegion } from "@/lib/types";

const WarehouseMap = dynamic(() => import("@/components/WarehouseMap"), {
  ssr: false,
  loading: () => (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-border sm:h-72 md:h-80">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-muted">
        Xarita yuklanmoqda...
      </div>
    </div>
  ),
});

export type WarehouseDetails = {
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  phone: string;
  telegramUrl: string | null;
  locationUrl: string | null;
  country: string | null;
  province: string | null;
  district: string | null;
  receiver: string | null;
  phone2: string | null;
  workingHours: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  entryType?: string | null;
  pdfUrl?: string | null;
  pdfFileName?: string | null;
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/70 py-2 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="break-anywhere text-sm font-medium text-foreground sm:max-w-[65%] sm:text-right">
        {value}
      </span>
    </div>
  );
}

export function WarehouseDetailCard({ warehouse }: { warehouse: WarehouseDetails }) {
  const isPdf = warehouse.entryType === "PDF" && Boolean(warehouse.pdfUrl);

  if (isPdf) {
    return (
      <article className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_10px_40px_-20px_rgba(8,32,64,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-24px_rgba(8,32,64,0.45)]">
        <div className="space-y-4 p-4 sm:p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {REGION_LABELS[warehouse.region as WarehouseRegion] || warehouse.region} · PDF
              </p>
              <h3 className="break-words text-xl font-bold tracking-tight sm:text-2xl">{warehouse.name}</h3>
              {warehouse.pdfFileName && (
                <p className="flex min-w-0 items-start gap-2 break-words text-sm text-muted">
                  <FileText size={15} className="mt-0.5 shrink-0 text-[var(--brand-teal)]" />
                  <span>{warehouse.pdfFileName}</span>
                </p>
              )}
            </div>
            <a
              href={warehouse.pdfUrl!}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary w-full shrink-0 sm:w-auto"
            >
              PDF ni yangi oynada ochish <ExternalLink size={15} />
            </a>
          </div>

          {warehouse.notes && (
            <p className="break-words rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted">
              {warehouse.notes}
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-border bg-[#f8fafc] dark:bg-background">
            <iframe
              title={`${warehouse.name} PDF`}
              src={`${warehouse.pdfUrl!}#view=FitH`}
              className="h-[min(65dvh,28rem)] w-full min-h-[280px] sm:min-h-[400px]"
            />
          </div>
        </div>
      </article>
    );
  }

  const mapsUrl = googleMapsSearchUrl(warehouse.address);
  const geocodeQuery = buildGeocodeQuery({
    address: warehouse.address,
    district: warehouse.district,
    city: warehouse.city,
    province: warehouse.province,
    country: warehouse.country,
  });

  return (
    <article className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_10px_40px_-20px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-24px_rgba(15,23,42,0.45)] dark:shadow-[0_10px_40px_-18px_rgba(0,0,0,0.65)]">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-w-0 space-y-5 p-4 sm:p-5 md:p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {REGION_LABELS[warehouse.region as WarehouseRegion] || warehouse.region}
            </p>
            <h3 className="break-words text-xl font-bold tracking-tight sm:text-2xl">{warehouse.name}</h3>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <InfoRow label="Warehouse Name" value={warehouse.name} />
            <InfoRow label="Country" value={warehouse.country} />
            <InfoRow label="Province" value={warehouse.province} />
            <InfoRow label="City" value={warehouse.city} />
            <InfoRow label="District" value={warehouse.district} />
            <InfoRow label="Full Address" value={warehouse.address} />
            <InfoRow label="Receiver" value={warehouse.receiver} />
            <InfoRow label="Phone 1" value={warehouse.phone} />
            <InfoRow label="Phone 2" value={warehouse.phone2} />
            <InfoRow label="Working Hours" value={warehouse.workingHours} />
            <InfoRow label="Notes" value={warehouse.notes} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/80 p-4 transition hover:border-primary/40">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <MapPinned size={16} className="text-primary" />
                Warehouse Location
              </div>
              <p className="break-words text-sm text-muted">
                {[warehouse.district, warehouse.city, warehouse.province, warehouse.country]
                  .filter(Boolean)
                  .join(" · ") || warehouse.address}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/80 p-4 transition hover:border-primary/40">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Phone size={16} className="text-primary" />
                Phone Numbers
              </div>
              <div className="space-y-1 break-all text-sm">
                <a href={`tel:${warehouse.phone}`} className="block hover:text-primary">
                  {warehouse.phone}
                </a>
                {warehouse.phone2 && (
                  <a href={`tel:${warehouse.phone2}`} className="block hover:text-primary">
                    {warehouse.phone2}
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/80 p-4 transition hover:border-primary/40">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <UserRound size={16} className="text-primary" />
                Receiver
              </div>
              <p className="text-sm text-muted">{warehouse.receiver || "—"}</p>
              {warehouse.workingHours && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  <Clock3 size={13} /> {warehouse.workingHours}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-background/80 p-4 transition hover:border-primary/40">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <NotebookPen size={16} className="text-primary" />
                Notes
              </div>
              <p className="break-words whitespace-pre-wrap text-sm text-muted">
                {warehouse.notes || "Qo‘shimcha izoh yo‘q"}
              </p>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary w-full sm:w-auto"
          >
            Open in Google Maps <ExternalLink size={15} />
          </a>
        </div>

        <div className="min-w-0 border-t border-border bg-background/40 p-4 sm:p-5 md:p-6 lg:border-l lg:border-t-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold">Interactive Map</h4>
            <span className="text-xs text-muted">OpenStreetMap</span>
          </div>
          <WarehouseMap
            name={warehouse.name}
            address={warehouse.address}
            latitude={warehouse.latitude}
            longitude={warehouse.longitude}
            geocodeQuery={geocodeQuery}
          />
        </div>
      </div>
    </article>
  );
}

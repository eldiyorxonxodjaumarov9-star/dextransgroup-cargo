"use client";

import { ExternalLink, MapPin, Phone, Send } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { WarehouseRegion } from "@/lib/types";

type WarehouseCardProps = {
  warehouse: {
    name: string;
    region: string;
    city: string;
    address: string;
    phone: string;
    telegramUrl: string | null;
    locationUrl: string | null;
  };
};

export function WarehouseCard({ warehouse }: WarehouseCardProps) {
  const { t } = useLocale();
  const regionKey = warehouse.region as WarehouseRegion;

  return (
    <article className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            {warehouse.name}
          </h3>
          <p className="mt-1 tracking-id text-[10px] text-[var(--text-muted)]">
            {t.regions[regionKey] || warehouse.region} · {warehouse.city}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-[var(--text-secondary)]">
        <p className="text-[var(--text)]">{warehouse.address}</p>
        <p className="flex items-center gap-2">
          <Phone size={15} className="text-[var(--accent-secondary)]" />
          <a href={`tel:${warehouse.phone}`} className="hover:text-[var(--accent)]">
            {warehouse.phone}
          </a>
        </p>
        {warehouse.telegramUrl && (
          <p className="flex items-center gap-2">
            <Send size={15} className="text-[var(--accent-secondary)]" />
            <a
              href={warehouse.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--accent)]"
            >
              Telegram
            </a>
          </p>
        )}
      </div>

      {warehouse.locationUrl && (
        <div className="mt-4">
          <a
            href={warehouse.locationUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary w-full text-sm"
          >
            <MapPin size={15} /> {t.warehouse.openMap} <ExternalLink size={14} />
          </a>
        </div>
      )}
    </article>
  );
}

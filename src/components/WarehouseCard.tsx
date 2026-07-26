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
    <article className="card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{warehouse.name}</h3>
          <p className="text-sm text-muted">
            {t.regions[regionKey] || warehouse.region} · {warehouse.city}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p>{warehouse.address}</p>
        <p className="flex items-center gap-2">
          <Phone size={15} className="text-muted" />
          <a href={`tel:${warehouse.phone}`}>{warehouse.phone}</a>
        </p>
        {warehouse.telegramUrl && (
          <p className="flex items-center gap-2">
            <Send size={15} className="text-muted" />
            <a href={warehouse.telegramUrl} target="_blank" rel="noreferrer">
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

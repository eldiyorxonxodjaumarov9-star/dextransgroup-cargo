"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coords } from "@/lib/geocode";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Recenter({ coords }: { coords: Coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView([coords.lat, coords.lng], 15);
  }, [coords.lat, coords.lng, map]);
  return null;
}

type WarehouseMapProps = {
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  geocodeQuery: string;
};

export default function WarehouseMap({
  name,
  address,
  latitude,
  longitude,
  geocodeQuery,
}: WarehouseMapProps) {
  const hasFixedCoords = latitude != null && longitude != null;
  const fixedCoords: Coords | null = hasFixedCoords
    ? { lat: latitude as number, lng: longitude as number }
    : null;

  const [geoCoords, setGeoCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(!hasFixedCoords);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasFixedCoords) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ q: geocodeQuery || address });
        const res = await fetch(`/api/geocode?${params.toString()}`);
        if (!res.ok) {
          if (!cancelled) {
            setGeoCoords(null);
            setError("Lokatsiya topilmadi. Manzilni tekshirib qayta urinib ko‘ring.");
          }
          return;
        }
        const data = (await res.json()) as Coords;
        if (!cancelled) setGeoCoords(data);
      } catch {
        if (!cancelled) {
          setGeoCoords(null);
          setError("Xaritani yuklashda xatolik yuz berdi.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [address, geocodeQuery, hasFixedCoords]);

  const coords = fixedCoords ?? geoCoords;

  if (!hasFixedCoords && loading) {
    return (
      <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-border sm:h-72 md:h-80">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm font-medium text-muted">
          Xarita yuklanmoqda...
        </div>
      </div>
    );
  }

  if (error || !coords) {
    return (
      <div className="flex h-56 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background px-4 text-center sm:h-72 sm:px-6 md:h-80">
        <p className="text-sm font-semibold text-foreground">Lokatsiya topilmadi</p>
        <p className="max-w-sm break-words text-sm text-muted">
          {error || "Bu manzil bo‘yicha marker qo‘yib bo‘lmadi."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-56 w-full overflow-hidden rounded-2xl border border-border shadow-inner sm:h-72 md:h-80">
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter coords={coords} />
        <Marker position={[coords.lat, coords.lng]} icon={markerIcon}>
          <Popup>
            <strong className="break-words">{name}</strong>
            <br />
            <span className="break-words">{address}</span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

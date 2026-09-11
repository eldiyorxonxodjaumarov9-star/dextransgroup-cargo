export type Coords = { lat: number; lng: number };

function parseCoord(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

export function toOptionalCoord(value: unknown): number | null {
  return parseCoord(value);
}

export function googleMapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function buildGeocodeQuery(parts: {
  address?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
}) {
  return [parts.address, parts.district, parts.city, parts.province, parts.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

export async function geocodeAddress(query: string): Promise<Coords | null> {
  const q = query.trim();
  if (!q) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "DextransGroupCargo/1.0 (warehouse-map; contact@dextrans.local)",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!data?.length) return null;

    const lat = Number(data[0].lat);
    const lng = Number(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

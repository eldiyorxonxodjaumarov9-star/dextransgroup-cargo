import { NextResponse } from "next/server";
import { buildGeocodeQuery, geocodeAddress } from "@/lib/geocode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const address = searchParams.get("address");
  const district = searchParams.get("district");
  const city = searchParams.get("city");
  const province = searchParams.get("province");
  const country = searchParams.get("country");

  const query =
    q ||
    buildGeocodeQuery({ address, district, city, province, country });

  if (!query) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  const coords = await geocodeAddress(query);
  if (!coords) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json(coords);
}

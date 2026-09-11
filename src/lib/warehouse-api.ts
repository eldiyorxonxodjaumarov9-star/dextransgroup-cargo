import { toOptionalCoord } from "@/lib/geocode";
import { emptyToNull } from "@/lib/utils";
import { readPdfUpload } from "@/lib/upload-pdf";

export const warehouseListSelect = {
  id: true,
  name: true,
  region: true,
  city: true,
  address: true,
  phone: true,
  telegramUrl: true,
  locationUrl: true,
  country: true,
  province: true,
  district: true,
  receiver: true,
  phone2: true,
  workingHours: true,
  notes: true,
  latitude: true,
  longitude: true,
  entryType: true,
  pdfUrl: true,
  pdfFileName: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function warehousePayload(data: {
  name: string;
  region: "CHINA" | "TASHKENT";
  entryType?: "MANUAL" | "PDF";
  city?: string;
  address?: string;
  phone?: string;
  telegramUrl?: string;
  locationUrl?: string;
  country?: string;
  province?: string;
  district?: string;
  receiver?: string;
  phone2?: string;
  workingHours?: string;
  notes?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  pdfFileName?: string;
}) {
  const entryType = data.entryType || "MANUAL";
  const isPdf = entryType === "PDF";

  return {
    name: data.name,
    region: data.region,
    entryType,
    city: isPdf ? data.city?.trim() || "PDF" : data.city!.trim(),
    address: isPdf
      ? data.address?.trim() || "PDF orqali yuklangan"
      : data.address!.trim(),
    phone: isPdf ? data.phone?.trim() || "—" : data.phone!.trim(),
    telegramUrl: isPdf ? null : emptyToNull(data.telegramUrl),
    locationUrl: isPdf ? null : emptyToNull(data.locationUrl),
    country: isPdf ? null : emptyToNull(data.country),
    province: isPdf ? null : emptyToNull(data.province),
    district: isPdf ? null : emptyToNull(data.district),
    receiver: isPdf ? null : emptyToNull(data.receiver),
    phone2: isPdf ? null : emptyToNull(data.phone2),
    workingHours: isPdf ? null : emptyToNull(data.workingHours),
    notes: emptyToNull(data.notes),
    latitude: isPdf ? null : toOptionalCoord(data.latitude),
    longitude: isPdf ? null : toOptionalCoord(data.longitude),
    pdfFileName: isPdf ? emptyToNull(data.pdfFileName) : null,
  };
}

export async function parseWarehouseRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("pdf");
    let pdfFileName = String(formData.get("pdfFileName") || "");
    let pdfData: Buffer | null = null;
    const keepExistingPdf = String(formData.get("pdfUrl") || "").length > 0;

    if (file instanceof File && file.size > 0) {
      const saved = await readPdfUpload(file);
      pdfData = saved.data;
      pdfFileName = saved.fileName;
    }

    return {
      body: {
        name: String(formData.get("name") || ""),
        region: String(formData.get("region") || "CHINA"),
        entryType: String(formData.get("entryType") || "MANUAL"),
        city: String(formData.get("city") || ""),
        address: String(formData.get("address") || ""),
        phone: String(formData.get("phone") || ""),
        telegramUrl: String(formData.get("telegramUrl") || ""),
        locationUrl: String(formData.get("locationUrl") || ""),
        country: String(formData.get("country") || ""),
        province: String(formData.get("province") || ""),
        district: String(formData.get("district") || ""),
        receiver: String(formData.get("receiver") || ""),
        phone2: String(formData.get("phone2") || ""),
        workingHours: String(formData.get("workingHours") || ""),
        notes: String(formData.get("notes") || ""),
        latitude: String(formData.get("latitude") || ""),
        longitude: String(formData.get("longitude") || ""),
        pdfUrl: pdfData || keepExistingPdf ? "pending" : "",
        pdfFileName,
      },
      pdfData,
      keepExistingPdf,
    };
  }

  const body = await request.json();
  return {
    body,
    pdfData: null as Buffer | null,
    keepExistingPdf: Boolean(body?.pdfUrl),
  };
}

import { emptyToNull } from "@/lib/utils";
import { readPdfUpload } from "@/lib/upload-pdf";

export const itemListInclude = {
  warehouse: { select: { id: true, name: true } },
  operator: { select: { id: true, name: true, phone: true } },
} as const;

export function itemPayload(data: {
  name: string;
  trackNumber: string;
  entryType?: "MANUAL" | "PDF";
  imageUrl?: string;
  description?: string;
  price?: string;
  category: "NEW" | "IN_TRANSIT" | "ARRIVED";
  status:
    | "CHINA_WAREHOUSE"
    | "DEPARTED"
    | "AT_BORDER"
    | "ARRIVED_TASHKENT";
  date: string;
  etaDate?: string;
  telegramUrl?: string;
  locationUrl?: string;
  chinaAddress?: string;
  notes?: string;
  warehouseId?: string;
  operatorId?: string;
  pdfFileName?: string;
}) {
  const entryType = data.entryType || "MANUAL";
  const isPdf = entryType === "PDF";

  return {
    name: data.name,
    trackNumber: data.trackNumber,
    entryType,
    category: data.category,
    status: data.status,
    date: new Date(data.date),
    notes: emptyToNull(data.notes),
    imageUrl: isPdf ? null : emptyToNull(data.imageUrl),
    description: isPdf ? null : emptyToNull(data.description),
    price: isPdf ? null : emptyToNull(data.price),
    etaDate: isPdf || !data.etaDate ? null : new Date(data.etaDate),
    telegramUrl: isPdf ? null : emptyToNull(data.telegramUrl),
    locationUrl: isPdf ? null : emptyToNull(data.locationUrl),
    chinaAddress: isPdf ? null : emptyToNull(data.chinaAddress),
    warehouseId: isPdf ? null : emptyToNull(data.warehouseId),
    operatorId: isPdf ? null : emptyToNull(data.operatorId),
    pdfFileName: isPdf ? emptyToNull(data.pdfFileName) : null,
  };
}

export async function parseItemRequest(request: Request) {
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
        trackNumber: String(formData.get("trackNumber") || ""),
        entryType: String(formData.get("entryType") || "MANUAL"),
        imageUrl: String(formData.get("imageUrl") || ""),
        description: String(formData.get("description") || ""),
        price: String(formData.get("price") || ""),
        category: String(formData.get("category") || "NEW"),
        status: String(formData.get("status") || "CHINA_WAREHOUSE"),
        date: String(formData.get("date") || ""),
        etaDate: String(formData.get("etaDate") || ""),
        telegramUrl: String(formData.get("telegramUrl") || ""),
        locationUrl: String(formData.get("locationUrl") || ""),
        chinaAddress: String(formData.get("chinaAddress") || ""),
        notes: String(formData.get("notes") || ""),
        warehouseId: String(formData.get("warehouseId") || ""),
        operatorId: String(formData.get("operatorId") || ""),
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

/** Strip heavy pdfData before JSON / RSC payloads */
export function sanitizeItem<T extends { pdfData?: unknown }>(item: T): Omit<T, "pdfData"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omit binary blob
  const { pdfData, ...rest } = item;
  return rest;
}

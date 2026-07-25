const MAX_PDF_BYTES = Math.floor(4.5 * 1024 * 1024);

export type StoredPdf = {
  data: Buffer;
  fileName: string;
};

export async function readPdfUpload(file: File): Promise<StoredPdf> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Faqat PDF fayl yuklash mumkin");
  }
  if (file.size <= 0) {
    throw new Error("Bo‘sh fayl yuklab bo‘lmaydi");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("PDF hajmi juda katta — brauzer avtomatik siqishi kerak edi");
  }

  return {
    data: Buffer.from(await file.arrayBuffer()),
    fileName: file.name,
  };
}

export function warehousePdfPath(id: string) {
  return `/api/warehouses/${id}/pdf`;
}

export function itemPdfPath(id: string) {
  return `/api/items/${id}/pdf`;
}

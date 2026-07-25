"use client";

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import { jsPDF } from "jspdf";

/** Vercel body limiti ~4.5 MB; PDF + preview uchun zahira qoldiramiz. */
export const PDF_UPLOAD_TARGET_BYTES = 3.5 * 1024 * 1024;
/** Brauzerda siqishdan oldin qabul qilinadigan maksimal asl hajm */
export const PDF_SOURCE_MAX_BYTES = 80 * 1024 * 1024;

export type PreparedPdf = {
  file: File;
  previewDataUrl: string;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
};

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured || typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

function formatMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function canvasToJpegDataUrl(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Rasm yaratib bo‘lmadi"));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Rasm o‘qib bo‘lmadi"));
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

async function renderPageToCanvas(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pdf.js page type
  page: any,
  maxWidthPx: number
): Promise<HTMLCanvasElement> {
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(maxWidthPx / base.width, 2);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas qo‘llab-quvvatlanmaydi");
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas;
}

async function buildCompressedPdf(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pdf.js doc
  pdf: any,
  pageMaxWidth: number,
  jpegQuality: number,
  onProgress?: (message: string) => void
): Promise<{ blob: Blob; previewDataUrl: string }> {
  let doc: jsPDF | null = null;
  let previewDataUrl = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    onProgress?.(
      `Sahifa ${pageNum}/${pdf.numPages} siqilmoqda…`
    );
    const page = await pdf.getPage(pageNum);
    const canvas = await renderPageToCanvas(page, pageMaxWidth);
    const jpeg = await canvasToJpegDataUrl(canvas, jpegQuality);
    if (pageNum === 1) previewDataUrl = jpeg;

    const widthPt = canvas.width * 0.75;
    const heightPt = canvas.height * 0.75;
    const orientation = widthPt > heightPt ? "landscape" : "portrait";

    if (!doc) {
      doc = new jsPDF({
        orientation,
        unit: "pt",
        format: [widthPt, heightPt],
        compress: true,
      });
    } else {
      doc.addPage([widthPt, heightPt], orientation);
    }
    doc.addImage(jpeg, "JPEG", 0, 0, widthPt, heightPt, undefined, "FAST");
  }

  if (!doc || !previewDataUrl) {
    throw new Error("PDF dan sahifa o‘qib bo‘lmadi");
  }

  const blob = doc.output("blob");
  return { blob, previewDataUrl };
}

async function extractPreviewOnly(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pdf.js doc
  pdf: any
): Promise<string> {
  const page = await pdf.getPage(1);
  const canvas = await renderPageToCanvas(page, 900);
  return canvasToJpegDataUrl(canvas, 0.72);
}

/**
 * Katta PDF ni brauzerda JPEG sahifalariga aylantirib siqadi
 * va birinchi sahifadan bosh sahifa uchun preview chiqaradi.
 */
export async function preparePdfForUpload(
  file: File,
  onProgress?: (message: string) => void
): Promise<PreparedPdf> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Faqat PDF fayl yuklash mumkin");
  }
  if (file.size <= 0) {
    throw new Error("Bo‘sh fayl yuklab bo‘lmaydi");
  }
  if (file.size > PDF_SOURCE_MAX_BYTES) {
    throw new Error(
      `PDF juda katta (${formatMb(file.size)}). Maksimal ${formatMb(PDF_SOURCE_MAX_BYTES)}`
    );
  }

  ensurePdfWorker();
  onProgress?.("PDF o‘qilmoqda…");

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;

  if (file.size <= PDF_UPLOAD_TARGET_BYTES) {
    onProgress?.("Sahifa rasmi tayyorlanmoqda…");
    const previewDataUrl = await extractPreviewOnly(pdf);
    return {
      file,
      previewDataUrl,
      originalSize: file.size,
      compressedSize: file.size,
      wasCompressed: false,
    };
  }

  const attempts: Array<{ width: number; quality: number }> = [
    { width: 1100, quality: 0.62 },
    { width: 900, quality: 0.52 },
    { width: 720, quality: 0.42 },
    { width: 560, quality: 0.34 },
  ];

  let lastBlob: Blob | null = null;
  let previewDataUrl = "";

  for (const attempt of attempts) {
    onProgress?.(
      `Siqilmoqda (${formatMb(file.size)} → ~${formatMb(PDF_UPLOAD_TARGET_BYTES)})…`
    );
    const result = await buildCompressedPdf(
      pdf,
      attempt.width,
      attempt.quality,
      onProgress
    );
    lastBlob = result.blob;
    previewDataUrl = result.previewDataUrl;
    if (result.blob.size <= PDF_UPLOAD_TARGET_BYTES) {
      break;
    }
  }

  if (!lastBlob || !previewDataUrl) {
    throw new Error("PDF ni siqib bo‘lmadi");
  }
  if (lastBlob.size > PDF_UPLOAD_TARGET_BYTES) {
    throw new Error(
      `PDF ni ${formatMb(PDF_UPLOAD_TARGET_BYTES)} gacha siqib bo‘lmadi (hozir ${formatMb(lastBlob.size)}). Sahifalar sonini kamaytiring.`
    );
  }

  const baseName = file.name.replace(/\.pdf$/i, "") || "document";
  const compressedFile = new File([lastBlob], `${baseName}-compressed.pdf`, {
    type: "application/pdf",
  });

  return {
    file: compressedFile,
    previewDataUrl,
    originalSize: file.size,
    compressedSize: compressedFile.size,
    wasCompressed: true,
  };
}

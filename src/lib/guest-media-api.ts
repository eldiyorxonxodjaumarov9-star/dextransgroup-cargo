import { emptyToNull } from "@/lib/utils";

const MAX_IMAGE_BYTES = Math.floor(3.5 * 1024 * 1024);
const MAX_VIDEO_BYTES = Math.floor(4 * 1024 * 1024);

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export type GuestMediaKind = "BANNER" | "IMAGE" | "VIDEO";

export function guestMediaPath(id: string) {
  return `/api/guest-services/${id}/file`;
}

export function sanitizeGuestMedia<T extends { data?: unknown }>(
  item: T
): Omit<T, "data"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omit binary
  const { data, ...rest } = item;
  return rest;
}

export async function readGuestUpload(
  file: File,
  kind: GuestMediaKind
): Promise<{ data: Buffer; fileName: string; mimeType: string }> {
  const mime = file.type || "application/octet-stream";
  const name = file.name || "upload";

  if (kind === "VIDEO") {
    if (!VIDEO_TYPES.has(mime) && !/\.(mp4|webm|mov)$/i.test(name)) {
      throw new Error("Faqat MP4 / WEBM video yuklash mumkin");
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("Video hajmi 4 MB dan oshmasin (yoki tashqi URL kiriting)");
    }
  } else {
    if (!IMAGE_TYPES.has(mime) && !/\.(jpe?g|png|webp|gif)$/i.test(name)) {
      throw new Error("Faqat JPG / PNG / WEBP rasm yuklash mumkin");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("Rasm hajmi 3.5 MB dan oshmasin");
    }
  }

  if (file.size <= 0) {
    throw new Error("Bo‘sh fayl yuklab bo‘lmaydi");
  }

  return {
    data: Buffer.from(await file.arrayBuffer()),
    fileName: name,
    mimeType: mime,
  };
}

export function parseGuestKind(value: unknown): GuestMediaKind {
  const kind = String(value || "IMAGE").toUpperCase();
  if (kind === "BANNER" || kind === "IMAGE" || kind === "VIDEO") return kind;
  return "IMAGE";
}

export async function parseGuestMediaRequest(
  request: Request,
  options?: { requireFile?: boolean }
) {
  const requireFile = options?.requireFile !== false;
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const kind = parseGuestKind(formData.get("kind"));
    const title = String(formData.get("title") || "");
    const sortOrder = Number(formData.get("sortOrder") || 0);
    const isActive = String(formData.get("isActive") || "true") !== "false";
    const externalUrl = String(formData.get("externalUrl") || "").trim();
    const file = formData.get("file");

    let data: Buffer | null = null;
    let fileName: string | null = null;
    let mimeType: string | null = null;
    let mediaUrl: string | null = emptyToNull(externalUrl);

    if (file instanceof File && file.size > 0) {
      const saved = await readGuestUpload(file, kind);
      data = saved.data;
      fileName = saved.fileName;
      mimeType = saved.mimeType;
      mediaUrl = null;
    }

    if (requireFile) {
      if (kind === "VIDEO" && !data && !mediaUrl) {
        throw new Error("Video fayl yoki tashqi URL majburiy");
      }
      if ((kind === "IMAGE" || kind === "BANNER") && !data && !mediaUrl) {
        throw new Error("Rasm fayl yuklash majburiy");
      }
    }

    return {
      body: {
        kind,
        title: emptyToNull(title),
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isActive,
        fileName,
        mimeType,
        mediaUrl,
      },
      data,
    };
  }

  const body = await request.json();
  return {
    body: {
      kind: parseGuestKind(body.kind),
      title: emptyToNull(body.title),
      sortOrder: Number(body.sortOrder || 0),
      isActive: body.isActive !== false,
      fileName: emptyToNull(body.fileName),
      mimeType: emptyToNull(body.mimeType),
      mediaUrl: emptyToNull(body.mediaUrl || body.externalUrl),
    },
    data: null as Buffer | null,
  };
}

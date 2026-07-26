"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Film, ImagePlus, Trash2, Upload } from "lucide-react";

type Media = {
  id: string;
  kind: string;
  title: string | null;
  sortOrder: number;
  mediaUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  isActive: boolean;
};

export function GuestServicesManager({ media }: { media: Media[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<"BANNER" | "IMAGE" | "VIDEO">("IMAGE");
  const [title, setTitle] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setTitle("");
    setSortOrder("0");
    setExternalUrl("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (kind !== "VIDEO" && !file) {
        setError("Rasm faylini tanlang");
        return;
      }
      if (kind === "VIDEO" && !file && !externalUrl.trim()) {
        setError("Video fayl yoki YouTube/URL kiriting");
        return;
      }

      const formData = new FormData();
      formData.set("kind", kind);
      formData.set("title", title);
      formData.set("sortOrder", sortOrder);
      formData.set("isActive", "true");
      if (externalUrl.trim()) formData.set("externalUrl", externalUrl.trim());
      if (file) formData.set("file", file);

      const res = await fetch("/api/guest-services", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Yuklashda xatolik");
        return;
      }
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("O‘chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/guest-services/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "O‘chirishda xatolik");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="card grid gap-4 p-4 sm:p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold">Yangi media qo‘shish</h2>
          <p className="text-sm text-muted">
            Banner, galereya rasmlari yoki video (MP4 ~4 MB yoki YouTube URL).
          </p>
        </div>

        <div className="field">
          <label>Turi</label>
          <select
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as "BANNER" | "IMAGE" | "VIDEO")
            }
          >
            <option value="BANNER">Banner (bosh sahifa)</option>
            <option value="IMAGE">Galereya rasmi</option>
            <option value="VIDEO">Video</option>
          </select>
        </div>

        <div className="field">
          <label>Sarlavha</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masalan: Aeroport kutib olish"
          />
        </div>

        <div className="field">
          <label>Tartib</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>

        {kind === "VIDEO" && (
          <div className="field">
            <label>Tashqi video URL (ixtiyoriy)</label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        )}

        <div className="field md:col-span-2">
          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--brand-teal)]/50 bg-[var(--brand-teal-soft)] px-4 py-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const next = e.dataTransfer.files?.[0];
              if (next) setFile(next);
            }}
          >
            <Upload className="text-[var(--brand-teal)]" size={26} />
            <div>
              <p className="text-sm font-bold">
                {kind === "VIDEO" ? "Video fayl" : "Rasm fayl"} tanlang
              </p>
              <p className="mt-1 text-xs text-muted">
                {kind === "VIDEO"
                  ? "MP4/WEBM · max ~4 MB (yoki URL)"
                  : "JPG/PNG/WEBP · max ~3.5 MB"}
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              accept={
                kind === "VIDEO"
                  ? "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  : "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp"
              }
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          {file && (
            <p className="mt-2 text-sm text-muted">
              {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>

        {error && (
          <p className="md:col-span-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="md:col-span-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Saqlash"}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-xl font-bold">Yuklangan media ({media.length})</h2>
        {!media.length && (
          <div className="card p-5 text-sm text-muted">
            Hali admin yuklamagan. Saytda default 4 ta rasm ko‘rinadi.
          </div>
        )}
        <div className="grid gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="card flex flex-wrap items-center gap-4 p-4"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-teal-soft)] text-[var(--brand-teal)]">
                {item.kind === "VIDEO" ? <Film size={18} /> : <ImagePlus size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {item.title || item.fileName || item.kind}
                </p>
                <p className="text-xs text-muted">
                  {item.kind} · tartib {item.sortOrder}
                  {item.mediaUrl ? ` · ${item.mediaUrl}` : ""}
                </p>
              </div>
              {item.mediaUrl && item.kind !== "VIDEO" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.mediaUrl}
                  alt=""
                  className="h-16 w-24 rounded-xl object-cover"
                />
              )}
              <button
                type="button"
                className="btn btn-secondary text-sm"
                onClick={() => void remove(item.id)}
              >
                <Trash2 size={14} /> O‘chirish
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

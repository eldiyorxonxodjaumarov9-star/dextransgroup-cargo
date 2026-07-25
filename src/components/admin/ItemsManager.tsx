"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { preparePdfForUpload } from "@/lib/pdf-client";
import { CARGO_CATEGORIES, CARGO_STATUSES } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";

type Warehouse = { id: string; name: string };
type Operator = { id: string; name: string };
type Item = {
  id: string;
  name: string;
  trackNumber: string;
  imageUrl: string | null;
  description: string | null;
  price: string | null;
  category: string;
  status: string;
  date: string;
  etaDate: string | null;
  telegramUrl: string | null;
  locationUrl: string | null;
  chinaAddress: string | null;
  notes: string | null;
  warehouseId: string | null;
  operatorId: string | null;
  entryType?: string | null;
  pdfUrl?: string | null;
  pdfFileName?: string | null;
  warehouse?: Warehouse | null;
  operator?: Operator | null;
};

const emptyForm = {
  name: "",
  trackNumber: "",
  imageUrl: "",
  description: "",
  price: "",
  category: "NEW",
  status: "CHINA_WAREHOUSE",
  date: new Date().toISOString().slice(0, 10),
  etaDate: "",
  telegramUrl: "",
  locationUrl: "",
  chinaAddress: "",
  notes: "",
  warehouseId: "",
  operatorId: "",
};

type EntryType = "MANUAL" | "PDF";

export function ItemsManager({
  items,
  warehouses,
  operators,
}: {
  items: Item[];
  warehouses: Warehouse[];
  operators: Operator[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entryType, setEntryType] = useState<EntryType>("MANUAL");
  const [form, setForm] = useState(emptyForm);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);
  const [existingPdfName, setExistingPdfName] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [filter, setFilter] = useState("ALL");

  const filtered = useMemo(
    () =>
      filter === "ALL" ? items : items.filter((item) => item.category === filter),
    [filter, items]
  );

  function startEdit(item: Item) {
    setEditingId(item.id);
    setEntryType(item.entryType === "PDF" ? "PDF" : "MANUAL");
    setForm({
      name: item.name,
      trackNumber: item.trackNumber,
      imageUrl: item.imageUrl || "",
      description: item.description || "",
      price: item.price || "",
      category: item.category,
      status: item.status,
      date: item.date.slice(0, 10),
      etaDate: item.etaDate ? item.etaDate.slice(0, 10) : "",
      telegramUrl: item.telegramUrl || "",
      locationUrl: item.locationUrl || "",
      chinaAddress: item.chinaAddress || "",
      notes: item.notes || "",
      warehouseId: item.warehouseId || "",
      operatorId: item.operatorId || "",
    });
    setPdfFile(null);
    setExistingPdfUrl(item.pdfUrl || null);
    setExistingPdfName(item.pdfFileName || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setEntryType("MANUAL");
    setForm(emptyForm);
    setPdfFile(null);
    setExistingPdfUrl(null);
    setExistingPdfName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProgress("");

    try {
      if (entryType === "PDF" && !pdfFile && !existingPdfUrl) {
        setError("PDF faylni tanlang");
        return;
      }

      const formData = new FormData();
      formData.set("name", form.name);
      formData.set("trackNumber", form.trackNumber);
      formData.set("entryType", entryType);
      formData.set("category", form.category);
      formData.set("status", form.status);
      formData.set("date", form.date);
      formData.set("notes", form.notes);

      if (entryType === "MANUAL") {
        formData.set("imageUrl", form.imageUrl);
        formData.set("description", form.description);
        formData.set("price", form.price);
        formData.set("etaDate", form.etaDate);
        formData.set("telegramUrl", form.telegramUrl);
        formData.set("locationUrl", form.locationUrl);
        formData.set("chinaAddress", form.chinaAddress);
        formData.set("warehouseId", form.warehouseId);
        formData.set("operatorId", form.operatorId);
      } else {
        let imageUrl = form.imageUrl;
        if (pdfFile) {
          const prepared = await preparePdfForUpload(pdfFile, setProgress);
          formData.set("pdf", prepared.file);
          imageUrl = prepared.previewDataUrl;
          setProgress(
            prepared.wasCompressed
              ? `Siqildi: ${(prepared.originalSize / 1024 / 1024).toFixed(1)} MB → ${(prepared.compressedSize / 1024 / 1024).toFixed(1)} MB`
              : "Yuklanmoqda…"
          );
        } else if (existingPdfUrl) {
          formData.set("pdfUrl", existingPdfUrl);
          if (existingPdfName) formData.set("pdfFileName", existingPdfName);
        }
        if (imageUrl) formData.set("imageUrl", imageUrl);
      }

      const res = await fetch(editingId ? `/api/items/${editingId}` : "/api/items", {
        method: editingId ? "PUT" : "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Saqlashda xatolik");
        return;
      }
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tarmoq xatosi");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  async function removeItem(id: string) {
    if (!confirm("Tovarni o‘chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
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
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-xl font-bold">
            {editingId ? "Tovarni tahrirlash" : "Yangi tovar qo‘shish"}
          </h2>

          <fieldset className="rounded-2xl border border-border bg-background/60 p-4">
            <legend className="px-1 text-sm font-semibold text-muted">
              Ma’lumot kiritish turi
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-3 py-3 has-[:checked]:border-[var(--brand-teal)] has-[:checked]:bg-[var(--brand-teal-soft)]">
                <input
                  type="radio"
                  name="itemEntryType"
                  className="mt-1 h-4 w-4 accent-[var(--brand-teal)]"
                  checked={entryType === "MANUAL"}
                  onChange={() => {
                    setEntryType("MANUAL");
                    setPdfFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
                <span>
                  <span className="block text-sm font-bold">Qo‘lda kiritish</span>
                  <span className="text-xs text-muted">
                    Trek, holat va barcha maydonlarni to‘ldirasiz
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-3 py-3 has-[:checked]:border-[var(--brand-teal)] has-[:checked]:bg-[var(--brand-teal-soft)]">
                <input
                  type="radio"
                  name="itemEntryType"
                  className="mt-1 h-4 w-4 accent-[var(--brand-teal)]"
                  checked={entryType === "PDF"}
                  onChange={() => setEntryType("PDF")}
                />
                <span>
                  <span className="block text-sm font-bold">PDF yuklash</span>
                  <span className="text-xs text-muted">
                    Tovar ma’lumoti PDF fayl sifatida saqlanadi
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="field">
          <label>Tovar nomi</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="field">
          <label>Trek raqami</label>
          <input
            required
            value={form.trackNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, trackNumber: e.target.value }))}
          />
        </div>

        <div className="field">
          <label>Kategoriya</label>
          <select
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            {CARGO_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Holat</label>
          <select
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
          >
            {CARGO_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Sana</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
        </div>

        {entryType === "PDF" ? (
          <div className="md:col-span-2 space-y-3">
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--brand-teal)]/50 bg-[var(--brand-teal-soft)] px-4 py-10 text-center transition hover:border-[var(--brand-teal)]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                if (
                  file.type !== "application/pdf" &&
                  !file.name.toLowerCase().endsWith(".pdf")
                ) {
                  setError("Faqat PDF fayl yuklash mumkin");
                  return;
                }
                setError("");
                setPdfFile(file);
                setExistingPdfUrl(null);
                setExistingPdfName(file.name);
              }}
            >
              <Upload className="text-[var(--brand-teal)]" size={28} />
              <div>
                <p className="text-sm font-bold text-[var(--brand-ink)] dark:text-foreground">
                  PDF faylni tanlang yoki shu yerga tashlang
                </p>
                <p className="mt-1 text-xs text-muted">
                  Faqat .pdf · 80 MB gacha (katta fayl avtomatik siqiladi)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPdfFile(file);
                  if (file) {
                    setExistingPdfUrl(null);
                    setExistingPdfName(file.name);
                  }
                }}
              />
            </label>

            {(pdfFile || existingPdfUrl) && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <FileText size={18} className="text-[var(--brand-teal)]" />
                <span className="font-medium">
                  {pdfFile?.name || existingPdfName || "Yuklangan PDF"}
                </span>
                {pdfFile && (
                  <span className="text-xs text-muted">
                    {(pdfFile.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                )}
                {existingPdfUrl && !pdfFile && (
                  <a
                    href={existingPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--brand-teal)] underline"
                  >
                    Ko‘rish
                  </a>
                )}
              </div>
            )}

            {form.imageUrl && entryType === "PDF" && !pdfFile && (
              <div className="overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt="PDF preview"
                  className="max-h-40 w-full object-cover"
                />
              </div>
            )}

            {progress && (
              <p className="text-sm font-medium text-[var(--brand-teal)]">{progress}</p>
            )}

            <div className="field">
              <label>Izoh (ixtiyoriy)</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        ) : (
          <>
            {(
              [
                ["imageUrl", "Rasm URL", "url"],
                ["price", "Narx", "text"],
                ["etaDate", "Taxminiy yetib kelish", "date"],
                ["telegramUrl", "Telegram havolasi", "url"],
                ["locationUrl", "Lokatsiya havolasi", "url"],
              ] as const
            ).map(([key, label, type]) => (
              <div className="field" key={key}>
                <label>{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}

            <div className="field">
              <label>Ombor</label>
              <select
                value={form.warehouseId}
                onChange={(e) => setForm((prev) => ({ ...prev, warehouseId: e.target.value }))}
              >
                <option value="">Tanlanmagan</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Operator</label>
              <select
                value={form.operatorId}
                onChange={(e) => setForm((prev) => ({ ...prev, operatorId: e.target.value }))}
              >
                <option value="">Tanlanmagan</option>
                {operators.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field md:col-span-2">
              <label>Xitoy manzili</label>
              <input
                value={form.chinaAddress}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, chinaAddress: e.target.value }))
                }
              />
            </div>

            <div className="field md:col-span-2">
              <label>Qisqa ma’lumot</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="field md:col-span-2">
              <label>Izoh</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </>
        )}

        {error && (
          <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? progress || "Saqlanmoqda..." : editingId ? "Yangilash" : "Qo‘shish"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Bekor qilish
            </button>
          )}
        </div>
      </form>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">Tovarlar ro‘yxati</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-base sm:w-auto sm:text-sm"
          >
            <option value="ALL">Barchasi</option>
            {CARGO_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 p-3 md:hidden">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-background p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words font-semibold">{item.name}</p>
                  <p className="break-all text-xs text-muted" title={item.trackNumber}>
                    {item.trackNumber}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <CategoryBadge category={item.category} />
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">{formatDate(item.date)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.entryType === "PDF" && item.pdfUrl && (
                  <a
                    href={item.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary !min-h-10 !px-3 !py-2 text-xs"
                  >
                    PDF
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-secondary !min-h-10 !px-3 !py-2 text-xs"
                  onClick={() => startEdit(item)}
                >
                  Tahrirlash
                </button>
                <button
                  type="button"
                  className="btn btn-danger !min-h-10 !px-3 !py-2 text-xs"
                  onClick={() => void removeItem(item.id)}
                >
                  O‘chirish
                </button>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <p className="py-6 text-center text-sm text-muted">Tovar topilmadi</p>
          )}
        </div>

        <div className="table-scroll hidden md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Tovar</th>
                <th className="px-4 py-3 font-medium">Trek</th>
                <th className="px-4 py-3 font-medium">Tur</th>
                <th className="px-4 py-3 font-medium">Kategoriya</th>
                <th className="px-4 py-3 font-medium">Holat</th>
                <th className="px-4 py-3 font-medium">Sana</th>
                <th className="px-4 py-3 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="max-w-[220px] px-4 py-3 font-medium">
                    <span className="line-clamp-2 break-words" title={item.name}>
                      {item.name}
                    </span>
                  </td>
                  <td className="max-w-[160px] px-4 py-3">
                    <span className="break-all" title={item.trackNumber}>
                      {item.trackNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        item.entryType === "PDF"
                          ? "bg-[var(--brand-navy)] text-white"
                          : "bg-[var(--brand-teal-soft)] text-[var(--brand-teal)]"
                      }`}
                    >
                      {item.entryType === "PDF" ? "PDF" : "Qo‘lda"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={item.category} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(item.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {item.entryType === "PDF" && item.pdfUrl && (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary !min-h-9 !px-3 !py-1 text-xs"
                        >
                          PDF
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary !min-h-9 !px-3 !py-1 text-xs"
                        onClick={() => startEdit(item)}
                      >
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger !min-h-9 !px-3 !py-1 text-xs"
                        onClick={() => void removeItem(item.id)}
                      >
                        O‘chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

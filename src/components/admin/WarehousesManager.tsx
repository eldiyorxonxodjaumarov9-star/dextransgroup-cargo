"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { REGION_LABELS } from "@/lib/constants";
import { WAREHOUSE_REGIONS } from "@/lib/types";

type Warehouse = {
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  phone: string;
  telegramUrl: string | null;
  locationUrl: string | null;
  country: string | null;
  province: string | null;
  district: string | null;
  receiver: string | null;
  phone2: string | null;
  workingHours: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  entryType: string;
  pdfUrl: string | null;
  pdfFileName: string | null;
};

const emptyForm = {
  name: "",
  region: "CHINA",
  city: "",
  address: "",
  phone: "",
  telegramUrl: "",
  locationUrl: "",
  country: "",
  province: "",
  district: "",
  receiver: "",
  phone2: "",
  workingHours: "",
  notes: "",
  latitude: "",
  longitude: "",
};

type EntryType = "MANUAL" | "PDF";

export function WarehousesManager({ warehouses }: { warehouses: Warehouse[] }) {
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

  function startEdit(item: Warehouse) {
    setEditingId(item.id);
    setEntryType(item.entryType === "PDF" ? "PDF" : "MANUAL");
    setForm({
      name: item.name,
      region: item.region,
      city: item.city === "PDF" ? "" : item.city,
      address: item.address === "PDF orqali yuklangan" ? "" : item.address,
      phone: item.phone === "—" ? "" : item.phone,
      telegramUrl: item.telegramUrl || "",
      locationUrl: item.locationUrl || "",
      country: item.country || "",
      province: item.province || "",
      district: item.district || "",
      receiver: item.receiver || "",
      phone2: item.phone2 || "",
      workingHours: item.workingHours || "",
      notes: item.notes || "",
      latitude: item.latitude != null ? String(item.latitude) : "",
      longitude: item.longitude != null ? String(item.longitude) : "",
    });
    setPdfFile(null);
    setExistingPdfUrl(item.pdfUrl);
    setExistingPdfName(item.pdfFileName);
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

    try {
      if (entryType === "PDF" && !pdfFile && !existingPdfUrl) {
        setError("PDF faylni tanlang");
        return;
      }

      const formData = new FormData();
      formData.set("name", form.name);
      formData.set("region", form.region);
      formData.set("entryType", entryType);
      formData.set("notes", form.notes);

      if (entryType === "MANUAL") {
        formData.set("city", form.city);
        formData.set("address", form.address);
        formData.set("phone", form.phone);
        formData.set("telegramUrl", form.telegramUrl);
        formData.set("locationUrl", form.locationUrl);
        formData.set("country", form.country);
        formData.set("province", form.province);
        formData.set("district", form.district);
        formData.set("receiver", form.receiver);
        formData.set("phone2", form.phone2);
        formData.set("workingHours", form.workingHours);
        formData.set("latitude", form.latitude);
        formData.set("longitude", form.longitude);
      } else {
        if (pdfFile) formData.set("pdf", pdfFile);
        if (existingPdfUrl) formData.set("pdfUrl", existingPdfUrl);
        if (existingPdfName) formData.set("pdfFileName", existingPdfName);
      }

      const res = await fetch(
        editingId ? `/api/warehouses/${editingId}` : "/api/warehouses",
        {
          method: editingId ? "PUT" : "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Saqlashda xatolik");
        return;
      }
      resetForm();
      router.refresh();
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id: string) {
    if (!confirm("Omborni o‘chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/warehouses/${id}`, { method: "DELETE" });
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
            {editingId ? "Omborni tahrirlash" : "Ombor qo‘shish"}
          </h2>

          <fieldset className="rounded-2xl border border-border bg-background/60 p-4">
            <legend className="px-1 text-sm font-semibold text-muted">
              Ma’lumot kiritish turi
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-3 py-3 has-[:checked]:border-[var(--brand-teal)] has-[:checked]:bg-[var(--brand-teal-soft)]">
                <input
                  type="radio"
                  name="entryType"
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
                    Manzil, telefon va barcha maydonlarni to‘ldirasiz
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-3 py-3 has-[:checked]:border-[var(--brand-teal)] has-[:checked]:bg-[var(--brand-teal-soft)]">
                <input
                  type="radio"
                  name="entryType"
                  className="mt-1 h-4 w-4 accent-[var(--brand-teal)]"
                  checked={entryType === "PDF"}
                  onChange={() => setEntryType("PDF")}
                />
                <span>
                  <span className="block text-sm font-bold">PDF yuklash</span>
                  <span className="text-xs text-muted">
                    Ombor ma’lumoti PDF fayl sifatida saqlanadi
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="field">
          <label>Ombor nomi</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="field">
          <label>Hudud</label>
          <select
            value={form.region}
            onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
          >
            {WAREHOUSE_REGIONS.map((region) => (
              <option key={region} value={region}>
                {REGION_LABELS[region]}
              </option>
            ))}
          </select>
        </div>

        {entryType === "PDF" ? (
          <div className="md:col-span-2 space-y-3">
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--brand-teal)]/50 bg-[var(--brand-teal-soft)] px-4 py-10 text-center transition hover:border-[var(--brand-teal)]"
              onDragOver={(e) => {
                e.preventDefault();
              }}
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
            >              <Upload className="text-[var(--brand-teal)]" size={28} />
              <div>
                <p className="text-sm font-bold text-[var(--brand-ink)] dark:text-foreground">
                  PDF faylni tanlang yoki shu yerga tashlang
                </p>
                <p className="mt-1 text-xs text-muted">Faqat .pdf · maksimal 15 MB</p>
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
            <div className="field">
              <label>Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Province</label>
              <input
                value={form.province}
                onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>City</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>District</label>
              <input
                value={form.district}
                onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Receiver</label>
              <input
                value={form.receiver}
                onChange={(e) => setForm((prev) => ({ ...prev, receiver: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Working Hours</label>
              <input
                value={form.workingHours}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, workingHours: e.target.value }))
                }
              />
            </div>

            <div className="field">
              <label>Phone 1</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Phone 2</label>
              <input
                value={form.phone2}
                onChange={(e) => setForm((prev) => ({ ...prev, phone2: e.target.value }))}
              />
            </div>

            <div className="field md:col-span-2">
              <label>Full Address</label>
              <textarea
                required
                rows={2}
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="field md:col-span-2">
              <label>Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Latitude (ixtiyoriy)</label>
              <input
                value={form.latitude}
                onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
                placeholder="Bo‘sh bo‘lsa avtomatik geocode"
              />
            </div>

            <div className="field">
              <label>Longitude (ixtiyoriy)</label>
              <input
                value={form.longitude}
                onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
                placeholder="Bo‘sh bo‘lsa avtomatik geocode"
              />
            </div>

            <div className="field">
              <label>Telegram havolasi</label>
              <input
                type="url"
                value={form.telegramUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, telegramUrl: e.target.value }))
                }
              />
            </div>

            <div className="field">
              <label>Lokatsiya havolasi</label>
              <input
                type="url"
                value={form.locationUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, locationUrl: e.target.value }))
                }
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
            {loading ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Qo‘shish"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Bekor qilish
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {warehouses.map((warehouse) => (
          <article key={warehouse.id} className="card space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{warehouse.name}</h3>
                <p className="text-sm text-muted">
                  {REGION_LABELS[warehouse.region as keyof typeof REGION_LABELS]} ·{" "}
                  {warehouse.entryType === "PDF" ? "PDF" : warehouse.city}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  warehouse.entryType === "PDF"
                    ? "bg-[var(--brand-navy)] text-white"
                    : "bg-[var(--brand-teal-soft)] text-[var(--brand-teal)]"
                }`}
              >
                {warehouse.entryType === "PDF" ? "PDF" : "Qo‘lda"}
              </span>
            </div>

            {warehouse.entryType === "PDF" && warehouse.pdfUrl ? (
              <div className="space-y-2">
                <p className="text-sm text-muted">
                  {warehouse.pdfFileName || "Ombor PDF fayli"}
                </p>
                <a
                  href={warehouse.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-teal)]"
                >
                  <FileText size={16} />
                  PDF ni ochish
                </a>
              </div>
            ) : (
              <>
                <p className="text-sm">{warehouse.address}</p>
                <p className="text-sm">{warehouse.phone}</p>
                {warehouse.receiver && (
                  <p className="text-sm text-muted">Receiver: {warehouse.receiver}</p>
                )}
              </>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-secondary text-sm"
                onClick={() => startEdit(warehouse)}
              >
                Tahrirlash
              </button>
              <button
                type="button"
                className="btn btn-danger text-sm"
                onClick={() => void removeItem(warehouse.id)}
              >
                O‘chirish
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

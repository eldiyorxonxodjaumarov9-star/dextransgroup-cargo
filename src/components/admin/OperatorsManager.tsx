"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Warehouse = { id: string; name: string };
type Operator = {
  id: string;
  name: string;
  phone: string;
  telegram: string | null;
  isActive: boolean;
  warehouseId: string | null;
  warehouse?: Warehouse | null;
};

const emptyForm = {
  name: "",
  phone: "",
  telegram: "",
  isActive: true,
  warehouseId: "",
};

export function OperatorsManager({
  operators,
  warehouses,
}: {
  operators: Operator[];
  warehouses: Warehouse[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function startEdit(item: Operator) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      phone: item.phone,
      telegram: item.telegram || "",
      isActive: item.isActive,
      warehouseId: item.warehouseId || "",
    });
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        editingId ? `/api/operators/${editingId}` : "/api/operators",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
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
    if (!confirm("Operatorni o‘chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/operators/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "O‘chirishda xatolik");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {editingId ? "Operatorni tahrirlash" : "Operator qo‘shish"}
          </h2>
        </div>

        <div className="field">
          <label>Ism</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="field">
          <label>Telefon</label>
          <input
            required
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        <div className="field">
          <label>Telegram username / havola</label>
          <input
            value={form.telegram}
            onChange={(e) => setForm((prev) => ({ ...prev, telegram: e.target.value }))}
            placeholder="@username yoki https://t.me/..."
          />
        </div>

        <div className="field">
          <label>Mas’ul ombor</label>
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

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
          />
          Faol operator
        </label>

        {error && (
          <p className="md:col-span-2 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {operators.map((operator) => (
          <article
            key={operator.id}
            className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-semibold">{operator.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{operator.phone}</p>
              </div>
              <span
                className={`badge ${
                  operator.isActive
                    ? "border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"
                    : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]"
                }`}
              >
                {operator.isActive ? "Faol" : "Nofaol"}
              </span>
            </div>
            <p className="text-sm">{operator.telegram || "Telegram yo‘q"}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {operator.warehouse?.name || "Ombor biriktirilmagan"}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-secondary text-sm"
                onClick={() => startEdit(operator)}
              >
                Tahrirlash
              </button>
              <button
                type="button"
                className="btn btn-danger text-sm"
                onClick={() => void removeItem(operator.id)}
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

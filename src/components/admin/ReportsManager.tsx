"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { CARGO_CATEGORIES, CARGO_STATUSES } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";

type Item = {
  id: string;
  name: string;
  trackNumber: string;
  category: string;
  status: string;
  date: string;
  warehouse?: { name: string } | null;
  operator?: { name: string } | null;
};

export function ReportsManager({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const query = q.trim().toLowerCase();
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.trackNumber.toLowerCase().includes(query);
      const matchesStatus = !status || item.status === status;
      const matchesCategory = !category || item.category === category;
      const itemDate = item.date.slice(0, 10);
      const matchesFrom = !from || itemDate >= from;
      const matchesTo = !to || itemDate <= to;
      return (
        matchesQuery &&
        matchesStatus &&
        matchesCategory &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [items, q, status, category, from, to]);

  function exportExcel() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.location.href = `/api/reports/export?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="card grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="field xl:col-span-2">
          <label>Qidirish</label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              className="!pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tovar yoki trek..."
            />
          </div>
        </div>

        <div className="field">
          <label>Holat</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Barchasi</option>
            {CARGO_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Kategoriya</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Barchasi</option>
            {CARGO_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Sana dan</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>

        <div className="field">
          <label>Sana gacha</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{filtered.length} ta yozuv topildi</p>
        <button type="button" className="btn btn-primary" onClick={exportExcel}>
          <Download size={16} /> Excelga yuklab olish
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-background text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Tovar nomi</th>
              <th className="px-4 py-3 font-medium">Trek raqami</th>
              <th className="px-4 py-3 font-medium">Kategoriya</th>
              <th className="px-4 py-3 font-medium">Holati</th>
              <th className="px-4 py-3 font-medium">Ombor</th>
              <th className="px-4 py-3 font-medium">Sana</th>
              <th className="px-4 py-3 font-medium">Operator</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3">{item.trackNumber}</td>
                <td className="px-4 py-3">
                  <CategoryBadge category={item.category} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3">{item.warehouse?.name || "—"}</td>
                <td className="px-4 py-3">{formatDate(item.date)}</td>
                <td className="px-4 py-3">{item.operator?.name || "—"}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  Mos yozuv topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

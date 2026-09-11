"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type CustomerRow = {
  id: string;
  telegramUserId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  normalizedPhone: string | null;
  customerCode: string;
  status: string;
  _count: { cargoItems: number; ownershipClaims: number };
};

type ClaimRow = {
  id: string;
  status: string;
  createdAt: string;
  telegramCustomer: {
    id: string;
    firstName: string;
    customerCode: string;
    normalizedPhone: string | null;
    telegramUserId: string;
  };
  cargoItem: {
    id: string;
    trackNumber: string;
    name: string;
    status: string;
  };
};

export function CustomersManager({
  customers,
  claims,
  cargoOptions,
}: {
  customers: CustomerRow[];
  claims: ClaimRow[];
  cargoOptions: Array<{ id: string; trackNumber: string; customerId: string | null }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id || "");
  const [selectedCargo, setSelectedCargo] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((c) =>
      [
        c.firstName,
        c.lastName,
        c.username,
        c.phone,
        c.normalizedPhone,
        c.customerCode,
        c.telegramUserId,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle))
    );
  }, [customers, q]);

  async function patch(body: Record<string, unknown>) {
    setError("");
    const res = await fetch("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Xatolik");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-[var(--radius-md)] border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--text)]">
          Ownership so‘rovlari
        </h2>
        {!claims.length && (
          <p className="text-sm text-[var(--text-secondary)]">Pending so‘rov yo‘q.</p>
        )}
        <div className="space-y-3">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <p className="text-sm text-[var(--text)]">
                <strong>{claim.cargoItem.trackNumber}</strong> — {claim.cargoItem.name}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {claim.telegramCustomer.firstName} · {claim.telegramCustomer.customerCode} ·{" "}
                {claim.telegramCustomer.normalizedPhone || "—"}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    patch({ action: "approveClaim", claimId: claim.id })
                  }
                  className="rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--accent-foreground)]"
                >
                  Tasdiqlash
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    patch({ action: "rejectClaim", claimId: claim.id })
                  }
                  className="rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm"
                >
                  Rad etish
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm">
            Qidiruv
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
              placeholder="ism, telefon, kod..."
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface-soft)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-3 py-2">Kod</th>
                <th className="px-3 py-2">Mijoz</th>
                <th className="px-3 py-2">Telefon</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Yuklar</th>
                <th className="px-3 py-2">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 font-mono text-xs">{c.customerCode}</td>
                  <td className="px-3 py-2">
                    {c.firstName} {c.lastName || ""}
                    <div className="text-xs text-[var(--text-secondary)]">
                      tg:{c.telegramUserId}
                    </div>
                  </td>
                  <td className="px-3 py-2">{c.normalizedPhone || c.phone || "—"}</td>
                  <td className="px-3 py-2">{c.status}</td>
                  <td className="px-3 py-2">{c._count.cargoItems}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(["PENDING", "VERIFIED", "BLOCKED"] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={pending || c.status === status}
                          onClick={() =>
                            patch({
                              action: "setStatus",
                              customerId: c.id,
                              status,
                            })
                          }
                          className="rounded border border-[var(--border)] px-2 py-1 text-[11px]"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-lg text-[var(--text)]">Yukni mijozga biriktirish</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Mijoz
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerCode} — {c.firstName}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Yuk (track)
            <select
              value={selectedCargo}
              onChange={(e) => setSelectedCargo(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            >
              <option value="">Tanlang</option>
              {cargoOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.trackNumber}
                  {c.customerId ? " (biriktirilgan)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending || !selectedCustomer || !selectedCargo}
            onClick={() =>
              patch({
                action: "assign",
                customerId: selectedCustomer,
                cargoItemId: selectedCargo,
              })
            }
            className="rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)]"
          >
            Biriktirish
          </button>
          <button
            type="button"
            disabled={pending || !selectedCargo}
            onClick={() =>
              patch({ action: "unassign", cargoItemId: selectedCargo })
            }
            className="rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2 text-sm"
          >
            Ajratish
          </button>
        </div>
      </section>
    </div>
  );
}

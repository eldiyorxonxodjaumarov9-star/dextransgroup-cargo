"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { RouteGridBackground } from "@/components/ui/RouteGridBackground";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kirish amalga oshmadi");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Tarmoq xatosi. Qayta urinib ko‘ring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-premium)]">
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_55%)]" />
      <RouteGridBackground className="opacity-40" />
      <form
        onSubmit={onSubmit}
        className="relative space-y-4 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-5 backdrop-blur-xl sm:p-7"
      >
        <div>
          <p className="section-kicker mb-2">Secure access</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Admin kirish
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Faqat vakolatli xodimlar uchun.
          </p>
        </div>

        <div className="field">
          <label htmlFor="username">Login</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Parol</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <p className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Tekshirilmoqda..." : "Kirish"}
        </button>
      </form>
    </div>
  );
}

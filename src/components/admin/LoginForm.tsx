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
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-border shadow-[var(--shadow-premium)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-navy)] via-[#0a2a44] to-teal-900" />
      <RouteGridBackground className="opacity-50" />
      <form
        onSubmit={onSubmit}
        className="relative space-y-4 bg-[var(--surface-elevated)]/95 p-5 backdrop-blur-xl sm:p-7"
      >
        <div>
          <p className="section-kicker mb-2">Secure access</p>
          <h1 className="text-2xl font-black tracking-tight">Admin kirish</h1>
          <p className="text-sm text-muted">Faqat vakolatli xodimlar uchun.</p>
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
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
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

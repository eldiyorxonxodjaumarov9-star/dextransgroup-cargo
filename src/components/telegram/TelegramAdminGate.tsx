"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getTelegramWebApp,
  loadTelegramWebAppScript,
} from "@/lib/telegram/client";
import { useTelegramMiniApp } from "@/components/telegram/TelegramMiniAppProvider";

type Status =
  | "booting"
  | "outside"
  | "authorizing"
  | "forbidden"
  | "error"
  | "redirecting";

export function TelegramAdminGate() {
  const { ready, webApp } = useTelegramMiniApp();
  const [status, setStatus] = useState<Status>("booting");
  const [message, setMessage] = useState("Admin panel tekshirilmoqda…");
  const [attempt, setAttempt] = useState(0);

  const authorize = useCallback(async () => {
    setStatus("booting");
    setMessage("Admin panel tekshirilmoqda…");

    const tg =
      webApp || getTelegramWebApp() || (await loadTelegramWebAppScript());
    const initData = tg?.initData?.trim() || "";

    if (!initData) {
      setStatus("outside");
      setMessage(
        "Bu sahifa Telegram Mini App ichida ochilishi kerak. Oddiy brauzerda admin login’dan foydalaning."
      );
      return;
    }

    setStatus("authorizing");
    setMessage("Admin panel tekshirilmoqda…");

    try {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ initData }),
      });

      if (res.status === 403) {
        setStatus("forbidden");
        setMessage("Sizda admin ruxsati mavjud emas");
        return;
      }

      if (res.status === 503) {
        setStatus("error");
        setMessage("Server konfiguratsiyasi yetishmayapti. Keyinroq urinib ko‘ring.");
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setStatus("error");
        setMessage(
          data?.error ||
            (res.status === 401
              ? "Telegram ma’lumoti yaroqsiz yoki muddati o‘tgan"
              : "Telegram orqali kirish amalga oshmadi")
        );
        return;
      }

      setStatus("redirecting");
      setMessage("Admin panelga yo‘naltirilmoqda…");
      // Hard navigation so the session cookie is reliably applied in Telegram WebView
      window.location.replace("/admin");
    } catch {
      setStatus("error");
      setMessage("Tarmoq xatosi. Qayta urinib ko‘ring.");
    }
  }, [webApp]);

  useEffect(() => {
    if (!ready && attempt === 0) return;
    let cancelled = false;

    void (async () => {
      if (cancelled) return;
      await authorize();
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, attempt, authorize]);

  return (
    <div className="mx-auto flex min-h-[60dvh] w-full min-w-0 max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="section-kicker">Telegram Admin</p>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
        Admin panel
      </h1>
      <p className="text-sm text-[var(--muted)]" role="status" aria-live="polite">
        {message}
      </p>

      {(status === "outside" ||
        status === "forbidden" ||
        status === "error") && (
        <div className="mt-4 flex w-full min-w-0 flex-col gap-2">
          {(status === "error" || status === "forbidden") && (
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Qayta urinish
            </button>
          )}
          <Link href="/admin/login" className="btn btn-primary w-full">
            Admin login
          </Link>
        </div>
      )}

      {(status === "booting" ||
        status === "authorizing" ||
        status === "redirecting") && (
        <div
          className="mt-2 h-10 w-10 animate-pulse rounded-full bg-[var(--accent)]/40"
          aria-hidden
        />
      )}
    </div>
  );
}

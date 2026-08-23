"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { ready, isTelegram, webApp } = useTelegramMiniApp();
  const [status, setStatus] = useState<Status>("booting");
  const [message, setMessage] = useState("Telegram tekshiruvi…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!ready) return;

      const tg =
        webApp || getTelegramWebApp() || (await loadTelegramWebAppScript());
      const initData = tg?.initData?.trim() || "";

      if (!initData) {
        if (!cancelled) {
          setStatus("outside");
          setMessage(
            "Bu sahifa Telegram Mini App ichida ochilishi kerak. Oddiy brauzerda admin login’dan foydalaning."
          );
        }
        return;
      }

      if (!cancelled) {
        setStatus("authorizing");
        setMessage("Admin ruxsati tekshirilmoqda…");
      }

      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });

        if (cancelled) return;

        if (res.status === 403) {
          setStatus("forbidden");
          setMessage("Sizda admin ruxsati mavjud emas");
          return;
        }

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          setStatus("error");
          setMessage(data?.error || "Telegram orqali kirish amalga oshmadi");
          return;
        }

        setStatus("redirecting");
        setMessage("Admin panelga yo‘naltirilmoqda…");
        router.replace("/admin");
        router.refresh();
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Tarmoq xatosi. Qayta urinib ko‘ring.");
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [ready, isTelegram, webApp, router]);

  return (
    <div className="mx-auto flex min-h-[60dvh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="section-kicker">Telegram Admin</p>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
        Admin panel
      </h1>
      <p className="text-sm text-[var(--muted)]" role="status">
        {message}
      </p>

      {(status === "outside" ||
        status === "forbidden" ||
        status === "error") && (
        <div className="mt-4 flex w-full flex-col gap-2">
          <Link href="/admin/login" className="btn btn-primary w-full">
            Username/parol bilan kirish
          </Link>
          <Link href="/telegram" className="btn btn-secondary w-full">
            Mini App’ga qaytish
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

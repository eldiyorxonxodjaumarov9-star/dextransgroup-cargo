"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-[var(--brand-ink)] dark:text-foreground">
        Sahifa yuklanmadi
      </h1>
      <p className="text-sm text-muted">
        Serverda xatolik yuz berdi. Baza ulanishi yoki migratsiya tekshirilmagan
        bo‘lishi mumkin. Qayta urinib ko‘ring.
      </p>
      {error.digest && (
        <p className="text-xs text-muted">Kod: {error.digest}</p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn btn-primary" onClick={reset}>
          Qayta yuklash
        </button>
        <Link href="/" className="btn btn-secondary">
          Bosh sahifa
        </Link>
      </div>
    </div>
  );
}

"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[global-error]", error);

  return (
    <html lang="uz">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#06080D",
          color: "#F4F7FB",
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding:
            "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#D7FF3F",
              marginBottom: 8,
            }}
          >
            ERROR
          </p>
          <h1 style={{ fontSize: 24, marginBottom: 8, fontWeight: 600 }}>
            Server xatosi
          </h1>
          <p style={{ color: "#8994A5", marginBottom: 16 }}>
            Ilova ishga tushmadi. Vercel environment variables va PostgreSQL
            migratsiyasini tekshiring.
          </p>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#566173" }}>Kod: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 12,
              padding: "12px 18px",
              borderRadius: 12,
              border: "none",
              background: "#D7FF3F",
              color: "#0A0D12",
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Qayta urinib ko‘rish
          </button>
        </div>
      </body>
    </html>
  );
}

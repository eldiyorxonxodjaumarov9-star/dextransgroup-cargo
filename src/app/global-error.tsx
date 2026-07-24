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
          background: "#eef2f5",
          color: "#0a1a28",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Server xatosi</h1>
          <p style={{ color: "#5b6b73", marginBottom: 16 }}>
            Ilova ishga tushmadi. Vercel environment variables va PostgreSQL
            migratsiyasini tekshiring.
          </p>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#5b6b73" }}>Kod: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 12,
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              background: "#087068",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Qayta urinib ko‘rish
          </button>
        </div>
      </body>
    </html>
  );
}

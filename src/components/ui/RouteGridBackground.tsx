"use client";

export function RouteGridBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ""}`}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-50"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="route-dash"
          d="M40 620 C220 520, 340 480, 520 420 S820 280, 1160 180"
          stroke="url(#routeGrad)"
          strokeWidth="1.5"
          strokeDasharray="8 12"
        />
        <path
          className="route-dash"
          d="M80 720 C300 640, 460 560, 680 500 S980 360, 1180 300"
          stroke="url(#routeGrad)"
          strokeWidth="1.2"
          strokeDasharray="6 14"
          opacity="0.55"
        />
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#D7FF3F" stopOpacity="0" />
            <stop offset="0.5" stopColor="#52E5FF" stopOpacity="0.85" />
            <stop offset="1" stopColor="#D7FF3F" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

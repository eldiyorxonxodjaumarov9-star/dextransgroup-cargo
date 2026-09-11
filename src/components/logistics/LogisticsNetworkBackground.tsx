"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const NODES = [
  { id: "GZ", label: "GUANGZHOU", x: 12, y: 28 },
  { id: "YW", label: "YIWU", x: 28, y: 18 },
  { id: "SZ", label: "SHENZHEN", x: 22, y: 48 },
  { id: "UR", label: "URUMQI", x: 48, y: 32 },
  { id: "BD", label: "BORDER", x: 68, y: 42 },
  { id: "TS", label: "TASHKENT", x: 88, y: 55 },
] as const;

const PATHS: Array<[number, number]> = [
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 4],
  [4, 5],
];

export function LogisticsNetworkBackground({
  className,
  interactive = true,
}: {
  className?: string;
  interactive?: boolean;
}) {
  const reduced = useReducedMotion();
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive || reduced) return;
    const layer = layerRef.current;
    if (!layer) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = layer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        layer.style.setProperty("--spot-x", `${x}%`);
        layer.style.setProperty("--spot-y", `${y}%`);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [interactive, reduced]);

  return (
    <div
      ref={layerRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [--spot-x:50%] [--spot-y:30%]",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(520px circle at var(--spot-x) var(--spot-y), rgba(82,229,255,0.07), transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 20%, rgba(215,255,63,0.05), transparent 50%), radial-gradient(ellipse 60% 40% at 85% 70%, rgba(82,229,255,0.06), transparent 55%)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {PATHS.map(([a, b], i) => {
          const from = NODES[a];
          const to = NODES[b];
          return (
            <line
              key={`p-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(82,229,255,0.28)"
              strokeWidth="0.15"
              strokeDasharray="1.2 1.2"
              className={reduced ? undefined : "route-dash"}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {NODES.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="0.55"
              fill={node.id === "TS" || node.id === "GZ" ? "#D7FF3F" : "#52E5FF"}
              className={reduced ? undefined : "pulse-node"}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="1.2"
              fill="none"
              stroke="rgba(215,255,63,0.25)"
              strokeWidth="0.12"
            />
          </g>
        ))}
      </svg>

      <div className="absolute inset-0 hidden md:block">
        {NODES.map((node) => (
          <span
            key={`lbl-${node.id}`}
            className="tracking-id absolute text-[9px] font-medium uppercase text-[var(--text-muted)]"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(10px, -6px)",
            }}
          >
            {node.label}
          </span>
        ))}
      </div>

      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

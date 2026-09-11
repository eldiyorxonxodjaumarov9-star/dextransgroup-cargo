"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  "aria-label"?: string;
  strength?: number;
  scale?: number;
};

/**
 * Light magnetic hover for pointer devices only.
 * Uses CSS vars + rAF — no React state on move.
 */
export function MagneticButton({
  children,
  className,
  href,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
  strength = 6,
  scale = 1.02,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const frame = useRef(0);
  const enabledRef = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      enabledRef.current = fine.matches && !reduced;
      const el = ref.current;
      if (!enabledRef.current && el) {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
        el.style.setProperty("--ms", "1");
      }
    };
    sync();
    fine.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      cancelAnimationFrame(frame.current);
    };
  }, [reduced]);

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
    el.style.setProperty("--ms", "1");
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!enabledRef.current || event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const clientX = event.clientX;
    const clientY = event.clientY;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      const mx = Math.max(-strength, Math.min(strength, dx * 0.22));
      const my = Math.max(-strength, Math.min(strength, dy * 0.22));
      el.style.setProperty("--mx", `${mx.toFixed(2)}px`);
      el.style.setProperty("--my", `${my.toFixed(2)}px`);
      el.style.setProperty("--ms", String(scale));
    });
  }

  const style = {
    ["--mx" as string]: "0px",
    ["--my" as string]: "0px",
    ["--ms" as string]: "1",
  } as CSSProperties;

  const shared = {
    className: cn("magnetic-btn", className),
    style,
    onPointerMove,
    onPointerLeave: reset,
    onPointerCancel: reset,
    "aria-label": ariaLabel,
  };

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as React.RefObject<HTMLAnchorElement>}
        onClick={onClick}
        {...shared}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      {...shared}
    >
      {children}
    </button>
  );
}

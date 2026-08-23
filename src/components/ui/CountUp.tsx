"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

export function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState("0");
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  const suffix = String(value).replace(/[\d.\s]/g, "");
  const isNumeric = Number.isFinite(numeric) && /\d/.test(value);

  useEffect(() => {
    if (reduced || !isNumeric) return;

    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let started = false;

    const animate = () => {
      const duration = 1200;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(numeric * eased);
        setDisplay(`${current}${suffix}`);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [isNumeric, numeric, reduced, suffix]);

  const shown = reduced || !isNumeric ? value : display;

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}

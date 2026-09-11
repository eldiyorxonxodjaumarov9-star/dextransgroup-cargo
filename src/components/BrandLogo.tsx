"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "cargo" | "worldwide" | "nav" | "mark";
  className?: string;
  priority?: boolean;
};

/**
 * Theme keys:
 * - light → asset for light page backgrounds (dark/navy ink or navy plate)
 * - dark  → asset for dark page backgrounds (white ink)
 */
const variants = {
  cargo: {
    light: "/brand/logo-cargo.png",
    dark: "/brand/logo-cargo-dark.png",
    alt: "DEXTRANS GROUP CARGO",
    width: 270,
    height: 84,
  },
  worldwide: {
    // Navy plate + white wordmark (includes Worldwide + tagline)
    light: "/brand/logo-worldwide-navy.png",
    // Transparent white wordmark for dark canvas
    dark: "/brand/logo-worldwide.png",
    alt: "dextrans Worldwide — Integrating the Asian Frontier",
    width: 681,
    height: 269,
  },
  nav: {
    // Wide wordmark — keep intrinsic ratio; constrain via CSS height/max-width only
    light: "/brand/logo-worldwide-nav.png",
    dark: "/brand/logo-worldwide-nav-dark.png",
    alt: "dextrans Worldwide",
    width: 645,
    height: 190,
  },
  mark: {
    light: "/brand/logo-mark.png",
    dark: "/brand/logo-mark.png",
    alt: "Dextrans",
    width: 44,
    height: 44,
  },
} as const;

export function BrandLogo({
  variant = "cargo",
  className,
  priority = false,
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate-safe theme logo
    setMounted(true);
  }, []);

  const meta = variants[variant];
  // defaultTheme is dark — prefer dark (white) assets until hydrated
  const isDark = !mounted || resolvedTheme !== "light";
  const src = isDark ? meta.dark : meta.light;

  if (variant === "nav") {
    return (
      <span className={cn("site-nav-logo", className)} aria-label={meta.alt}>
        <Image
          src={src}
          alt={meta.alt}
          fill
          priority={priority}
          unoptimized
          sizes="(max-width: 1023px) 135px, 165px"
          className="site-nav-logo__img"
        />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={meta.alt}
      width={meta.width}
      height={meta.height}
      priority={priority}
      unoptimized
      className={cn("h-auto max-w-full object-contain", className)}
    />
  );
}

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

const variants = {
  cargo: {
    light: "/brand/logo-cargo.png",
    dark: "/brand/logo-cargo-dark.png",
    alt: "DEXTRANS GROUP CARGO",
    width: 270,
    height: 84,
  },
  worldwide: {
    light: "/brand/logo-worldwide.png",
    dark: "/brand/logo-worldwide.png",
    alt: "dextrans Worldwide",
    width: 220,
    height: 80,
  },
  nav: {
    light: "/brand/logo-worldwide-nav.png",
    dark: "/brand/logo-worldwide-nav-dark.png",
    alt: "dextrans Worldwide",
    width: 320,
    height: 120,
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
  const isDark = mounted && resolvedTheme === "dark";
  const src =
    variant === "worldwide"
      ? meta.light
      : isDark
        ? meta.dark
        : meta.light;

  return (
    <Image
      src={src}
      alt={meta.alt}
      width={meta.width}
      height={meta.height}
      priority={priority}
      unoptimized
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}

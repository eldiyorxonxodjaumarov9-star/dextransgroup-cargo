import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "cargo" | "worldwide" | "mark";
  className?: string;
  priority?: boolean;
};

const variants = {
  cargo: {
    src: "/brand/logo-cargo.png",
    alt: "DEXTRANS GROUP CARGO",
    width: 180,
    height: 60,
  },
  worldwide: {
    src: "/brand/logo-worldwide.png",
    alt: "dextrans Worldwide",
    width: 220,
    height: 80,
  },
  mark: {
    src: "/brand/logo-mark.png",
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
  const meta = variants[variant];
  return (
    <Image
      src={meta.src}
      alt={meta.alt}
      width={meta.width}
      height={meta.height}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}

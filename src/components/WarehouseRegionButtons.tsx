"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";

export function WarehouseRegionButtons({
  chinaCount,
  tashkentCount,
}: {
  chinaCount: number;
  tashkentCount: number;
}) {
  const { t, format } = useLocale();

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
      <Reveal>
        <Link
          href="/warehouses/china"
          className="group relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[var(--accent)] p-5 text-white sm:min-h-[380px] sm:p-9"
        >
          <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-35">
            <Image
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="relative flex items-start justify-between">
            <p className="text-sm text-white/75">CN · REGION</p>
            <span className="arrow-circle arrow-circle-light">
              <ArrowUpRight size={16} />
            </span>
          </div>
          <div className="relative space-y-4">
            <p className="text-[clamp(3rem,18vw,7rem)] font-medium leading-none tracking-tight opacity-30">
              CN
            </p>
            <h3 className="break-words text-2xl font-medium tracking-tight sm:text-4xl">
              {t.warehouse.chinaTitle}
            </h3>
            <p className="text-sm text-white/75">
              {format(t.warehouse.chinaHint, { n: chinaCount })}
            </p>
            <p className="text-[clamp(2.5rem,6vw,4rem)] font-medium leading-none">
              <CountUp value={String(chinaCount)} />
            </p>
          </div>
        </Link>
      </Reveal>

      <Reveal delay={0.1}>
        <Link
          href="/warehouses/tashkent"
          className="group relative flex min-h-[280px] flex-col justify-between overflow-hidden on-cream p-5 sm:min-h-[380px] sm:p-9"
        >
          <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-25">
            <Image
              src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="relative flex items-start justify-between">
            <p className="cream-muted text-sm">UZ · REGION</p>
            <span className="arrow-circle">
              <ArrowUpRight size={16} />
            </span>
          </div>
          <div className="relative space-y-4">
            <p className="cream-faint text-[clamp(3rem,18vw,7rem)] font-medium leading-none tracking-tight">
              UZ
            </p>
            <h3 className="break-words text-2xl font-medium tracking-tight sm:text-4xl">
              {t.warehouse.tashkentTitle}
            </h3>
            <p className="cream-muted text-sm">
              {format(t.warehouse.tashkentHint, { n: tashkentCount })}
            </p>
            <p className="text-[clamp(2.5rem,6vw,4rem)] font-medium leading-none">
              <CountUp value={String(tashkentCount)} />
            </p>
          </div>
        </Link>
      </Reveal>
    </div>
  );
}

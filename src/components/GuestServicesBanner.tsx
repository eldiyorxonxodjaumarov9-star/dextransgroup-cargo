"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plane, Languages, Landmark, MapPinned } from "lucide-react";
import { DEFAULT_GUEST_BANNER, GUEST_SERVICE_COPY } from "@/lib/guest-services";

const highlights = [
  { icon: Plane, text: "Aeroport kutib olish" },
  { icon: Languages, text: "Tarjimonlik" },
  { icon: Landmark, text: "Ko‘rgazmalar" },
  { icon: MapPinned, text: "Ekskursiyalar" },
];

export function GuestServicesBanner({
  bannerSrc = DEFAULT_GUEST_BANNER,
}: {
  bannerSrc?: string;
}) {
  const uz = GUEST_SERVICE_COPY.uz;

  return (
    <section id="guest-services" className="scroll-mt-24">
      <Link
        href="/guest-services"
        className="group relative block overflow-hidden rounded-[28px] border border-border shadow-[0_24px_60px_-36px_rgba(8,32,64,0.55)]"
      >
        <div className="absolute inset-0">
          <Image
            src={bannerSrc}
            alt={uz.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            sizes="100vw"
            unoptimized
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(8,28,48,0.92)] via-[rgba(8,28,48,0.72)] to-[rgba(8,28,48,0.35)]" />
        </div>

        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:p-10">
          <div className="space-y-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-teal)]">
              Guest services · 宾客服务
            </p>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
              {uz.title}
            </h2>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              {uz.subtitle}. Aeroport, tarjimon, ko‘rgazma va ekskursiyalar — bitta
              joyda.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.text}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur"
                  >
                    <Icon size={14} className="text-[var(--brand-teal)]" />
                    {item.text}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex lg:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-teal)] px-5 py-3 text-sm font-bold text-white shadow-lg transition group-hover:translate-x-1">
              Batafsil ko‘rish
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}

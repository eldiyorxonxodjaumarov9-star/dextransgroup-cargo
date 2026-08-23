"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useLocale } from "@/components/LocaleProvider";
import { Reveal } from "@/components/ui/Reveal";
import { DEFAULT_GUEST_BANNER } from "@/lib/guest-services";
import { cn } from "@/lib/utils";

export function GuestServicesBanner({
  bannerSrc = DEFAULT_GUEST_BANNER,
}: {
  bannerSrc?: string;
}) {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-20, 20]);

  return (
    <section
      id="guest-services"
      ref={ref}
      className="scroll-mt-28 overflow-hidden border-y border-white/5"
    >
      <div className="grid lg:grid-cols-2">
        <Reveal className="relative min-h-[360px] overflow-hidden lg:min-h-[620px]">
          <motion.div style={{ y }} className="absolute inset-[-10%]">
            <Image
              src={bannerSrc}
              alt={t.guest.title}
              fill
              className="object-cover brightness-[0.85]"
              sizes="(max-width:1024px) 100vw, 50vw"
              unoptimized
            />
          </motion.div>
        </Reveal>

        <div className="flex items-center bg-[var(--canvas)] px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
          <div className="w-full">
            <Reveal>
              <h2 className="section-title max-w-[12ch] text-[clamp(2.4rem,5vw,4.2rem)]">
                {t.guest.title}
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
                {t.guest.subtitle}
              </p>
            </Reveal>

            <ul className="mt-10">
              {t.guest.highlights.map((text, index) => (
                <Reveal key={text} delay={0.1 + index * 0.05}>
                  <li
                    className={cn(
                      "group flex items-center gap-4 border-b border-white/10 py-5 transition",
                      "hover:pl-1"
                    )}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 bg-transparent transition group-hover:bg-[var(--accent)]" />
                    <span className="flex-1 text-base font-medium text-[var(--text)] sm:text-lg">
                      {text}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-[var(--muted)] opacity-0 transition group-hover:opacity-100"
                    />
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.3} className="mt-10">
              <Link href="/guest-services" className="cta-capsule cta-capsule-orange group inline-flex">
                <span className="cta-label">{t.guest.more}</span>
                <span className="arrow-circle arrow-circle-light">
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

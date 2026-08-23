"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  const [enableParallax, setEnableParallax] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced || !enableParallax ? [0, 0] : [-20, 20]
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setEnableParallax(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      id="guest-services"
      ref={ref}
      className="scroll-mt-24 overflow-hidden border-y border-white/5 sm:scroll-mt-28"
    >
      <div className="grid w-full min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Reveal className="relative min-h-[260px] min-w-0 overflow-hidden sm:min-h-[360px] lg:min-h-[620px]">
          <motion.div style={{ y }} className="absolute inset-0 lg:inset-[-10%]">
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

        <div className="flex min-w-0 items-center bg-[var(--canvas)] px-4 py-12 sm:px-10 lg:px-14 lg:py-20">
          <div className="w-full min-w-0 max-w-full">
            <Reveal>
              <h2 className="section-title max-w-full sm:max-w-[16ch]">
                {t.guest.title}
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
                {t.guest.subtitle}
              </p>
            </Reveal>

            <ul className="mt-8 sm:mt-10">
              {t.guest.highlights.map((text, index) => (
                <Reveal key={text} delay={0.1 + index * 0.05}>
                  <li
                    className={cn(
                      "group flex items-start gap-3 border-b border-white/10 py-4 transition sm:items-center sm:gap-4 sm:py-5",
                      "sm:hover:pl-1"
                    )}
                  >
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-[var(--accent)] sm:mt-0 sm:bg-transparent sm:transition sm:group-hover:bg-[var(--accent)]" />
                    <span className="min-w-0 flex-1 break-words text-base font-medium text-[var(--text)] sm:text-lg">
                      {text}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="mt-1 shrink-0 text-[var(--muted)] opacity-60 sm:mt-0 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                    />
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.3} className="mt-8 sm:mt-10">
              <Link
                href="/guest-services"
                className="cta-capsule cta-capsule-orange group inline-flex w-full sm:w-auto"
              >
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ItemCard } from "@/components/ItemCard";
import { OperatorCard } from "@/components/OperatorCard";
import { WarehouseRegionButtons } from "@/components/WarehouseRegionButtons";
import { GuestServicesBanner } from "@/components/GuestServicesBanner";
import { HashScroll } from "@/components/HashScroll";
import { useLocale } from "@/components/LocaleProvider";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type Item = React.ComponentProps<typeof ItemCard>["item"] & {
  id: string;
  category: string;
};
type Operator = React.ComponentProps<typeof OperatorCard>["operator"] & {
  id: string;
};

const channelMeta = [
  {
    id: "logistika",
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1400&q=80",
    href: "https://t.me/DEXTRANSWORLDWIDE",
    avatar: "/channels/logistika.jpg",
    featured: true,
  },
  {
    id: "foto-video",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    href: "https://t.me/dextransworld",
    avatar: "/channels/foto-video.jpg",
  },
  {
    id: "textil",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
    href: "https://t.me/DEXTRANS_TEXTIL_PRINT",
    avatar: "/channels/textil.jpg",
  },
  {
    id: "dex-car",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80",
    href: "https://t.me/dex_cars",
    avatar: "/channels/dex-car.jpg",
  },
  {
    id: "admin",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80",
    href: "/admin",
    avatar: null as string | null,
    internal: true,
  },
] as const;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2200&q=85";

export function HomePublicContent({
  warehouseCount,
  chinaCount,
  tashkentCount,
  items,
  operators,
  guestBannerUrl,
}: {
  warehouseCount: number;
  chinaCount: number;
  tashkentCount: number;
  items: Item[];
  operators: Operator[];
  guestBannerUrl: string;
}) {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const [cargoTab, setCargoTab] = useState<"NEW" | "IN_TRANSIT" | "ARRIVED">(
    "NEW"
  );

  const categoryCards = channelMeta.map((card) => {
    if (card.id === "logistika") {
      return {
        ...card,
        title: t.channels.logistikaTitle,
        description: t.channels.logistikaDesc,
        cta: t.channels.openChannel,
      };
    }
    if (card.id === "foto-video") {
      return {
        ...card,
        title: t.channels.fotoTitle,
        description: t.channels.fotoDesc,
        cta: t.channels.openChannel,
      };
    }
    if (card.id === "textil") {
      return {
        ...card,
        title: t.channels.textilTitle,
        description: t.channels.textilDesc,
        cta: t.channels.openChannel,
      };
    }
    if (card.id === "dex-car") {
      return {
        ...card,
        title: t.channels.carTitle,
        description: t.channels.carDesc,
        cta: t.channels.openChannel,
      };
    }
    return {
      ...card,
      title: t.channels.adminTitle,
      description: t.channels.adminDesc,
      cta: t.channels.category,
    };
  });

  const featured = categoryCards.find((c) => "featured" in c && c.featured)!;
  const channelRows = categoryCards.filter((c) => c.id !== featured.id);

  const values = [
    { num: "01", icon: ShieldCheck, title: t.values.safetyTitle, text: t.values.safetyText },
    { num: "02", icon: Zap, title: t.values.fastTitle, text: t.values.fastText },
    { num: "03", icon: PackageCheck, title: t.values.warehouseTitle, text: t.values.warehouseText },
    { num: "04", icon: Headphones, title: t.values.helpTitle, text: t.values.helpText },
  ];

  const cargoSections = [
    { id: "new", category: "NEW" as const },
    { id: "transit", category: "IN_TRANSIT" as const },
    { id: "arrived", category: "ARRIVED" as const },
  ];

  const activeCargo = useMemo(
    () => items.filter((item) => item.category === cargoTab),
    [cargoTab, items]
  );

  const headline = ["DEXTRANS", "GROUP", "CARGO"] as const;

  return (
    <div>
      <HashScroll />

      {/* HERO */}
      <section id="home" className="canvas-pad scroll-mt-24 pt-4 sm:scroll-mt-28 sm:pt-10 lg:pt-12">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.75fr] lg:items-end lg:gap-12">
          <h1 className="max-w-full text-[clamp(2.2rem,10vw,5.75rem)] font-medium leading-[1.05] tracking-[-0.04em] text-[var(--text)] sm:max-w-[11ch] sm:text-[clamp(2.75rem,7.5vw,5.75rem)] sm:leading-[1.02]">
            {headline.map((line, index) => (
              <motion.span
                key={line}
                className="block overflow-visible break-words"
                initial={reduced ? false : { y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12 + index * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.div
            className="max-w-md space-y-4 sm:space-y-5 lg:justify-self-end lg:pb-2"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <p className="text-[15px] leading-relaxed text-[var(--muted)]">
              {t.home.heroText}
            </p>
            <a href="#cargo" className="cta-capsule cta-capsule-orange group inline-flex w-full sm:w-auto">
              <span className="cta-label">{t.home.ctaCargo}</span>
              <span className="arrow-circle arrow-circle-light">
                <ArrowUpRight size={16} />
              </span>
            </a>
          </motion.div>
        </div>

        <div className="relative mt-8 sm:mt-14 lg:mt-16">
          <motion.div
            className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]"
            initial={reduced ? false : { clipPath: "inset(12% 0 0 0)", opacity: 0.85 }}
            animate={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={HERO_IMAGE}
              alt="Dextrans logistics"
              fill
              priority
              className="object-cover object-center brightness-[0.72] contrast-[1.05]"
              sizes="(max-width:1500px) 100vw, 1500px"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
          </motion.div>

          <div className="relative z-10 mt-4 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:w-[min(520px,48%)] lg:translate-y-1/3">
            <motion.div
              className="folder-card bg-[var(--accent)] p-4 text-white sm:p-6"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <p className="break-words text-sm text-white/80">{t.home.delivered}</p>
              <p className="mt-3 text-[clamp(2.1rem,8vw,3.75rem)] font-medium leading-none tracking-tight">
                <CountUp value="1250+" />
              </p>
            </motion.div>
            <motion.div
              className="folder-card bg-[var(--cream)] p-4 text-[#111] sm:p-6"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <p className="break-words text-sm text-[#111]/60">{t.home.happyClients}</p>
              <p className="mt-3 text-[clamp(2.1rem,8vw,3.75rem)] font-medium leading-none tracking-tight">
                <CountUp value="98%" />
              </p>
              <p className="mt-3 break-words text-xs font-semibold uppercase tracking-[0.16em] text-[#111]/45 sm:mt-4">
                {t.home.support} · 24/7
              </p>
            </motion.div>
          </div>
        </div>
        <div className="hidden h-16 lg:block" aria-hidden />
      </section>

      {/* CHANNELS */}
      <section className="canvas-pad section-space">
        <Reveal>
          <h2 className="section-title max-w-[10ch]">{t.channels.openChannel}</h2>
        </Reveal>

        <div className="mt-12 grid w-full min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <Reveal>
            {"internal" in featured && featured.internal ? (
              <Link href={featured.href} className="group relative block aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-auto lg:min-h-[520px]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="50vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-sm text-white/60">{featured.cta}</p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <h3 className="max-w-[14ch] text-3xl font-medium tracking-tight text-white sm:text-4xl">
                      {featured.title}
                    </h3>
                    <span className="arrow-circle">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                  <p className="mt-3 max-w-md text-sm text-white/65">{featured.description}</p>
                </div>
              </Link>
            ) : (
              <a
                href={featured.href}
                target="_blank"
                rel="noreferrer"
                className="group relative block aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-auto lg:min-h-[520px]"
              >
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="50vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-sm text-white/60">{featured.cta}</p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <h3 className="max-w-[14ch] text-3xl font-medium tracking-tight text-white sm:text-4xl">
                      {featured.title}
                    </h3>
                    <span className="arrow-circle">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                  <p className="mt-3 max-w-md text-sm text-white/65">{featured.description}</p>
                </div>
              </a>
            )}
          </Reveal>

          <div className="flex flex-col justify-center">
            {channelRows.map((card, index) => {
              const row = (
                <div className="group relative flex items-center gap-3 border-b border-white/10 py-5 transition sm:gap-4 sm:py-6">
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 bg-[var(--accent)] opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100" />
                  <div className="min-w-0 flex-1 pl-3">
                    <h3 className="break-words text-lg font-medium tracking-tight text-[var(--text)] sm:text-2xl">
                      {card.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                      {card.description}
                    </p>
                  </div>
                  <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden opacity-0 transition group-hover:opacity-100 md:block">
                    <Image src={card.image} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <span className="arrow-circle shrink-0">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              );

              return (
                <Reveal key={card.id} delay={index * 0.06}>
                  {"internal" in card && card.internal ? (
                    <Link href={card.href}>{row}</Link>
                  ) : (
                    <a href={card.href} target="_blank" rel="noreferrer">
                      {row}
                    </a>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="canvas-pad section-space pt-0">
        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {values.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.num} delay={index * 0.08}>
                <div className="group folder-card bg-[var(--panel)] p-6 transition hover:bg-[var(--panel-2)] sm:min-h-[280px] sm:p-7">
                  <div className="mb-10 h-1.5 w-10 bg-transparent transition group-hover:bg-[var(--accent)]" />
                  <p className="text-sm text-[var(--muted)]">{item.num}</p>
                  <div className="mt-8 flex h-11 w-11 items-center justify-center bg-[var(--panel-2)] text-[var(--text)] transition group-hover:bg-[var(--accent)] group-hover:text-white">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-6 text-xl font-medium tracking-tight text-[var(--text)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <GuestServicesBanner bannerSrc={guestBannerUrl} />

      {/* CARGO */}
      <section id="cargo" className="canvas-pad section-space scroll-mt-28">
        <Reveal className="max-w-3xl space-y-4">
          <h2 className="section-title">{t.home.cargoTitle}</h2>
          <p className="max-w-xl text-[var(--muted)]">{t.home.cargoSubtitle}</p>
        </Reveal>

        <Reveal className="mt-8 w-full min-w-0 max-w-full sm:mt-10">
          <div className="tabs-scroll border-b border-white/10">
            {cargoSections.map((section) => {
              const count = items.filter((item) => item.category === section.category).length;
              const active = cargoTab === section.category;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setCargoTab(section.category)}
                  className={cn(
                    "relative shrink-0 px-4 py-4 text-sm font-semibold transition sm:px-6",
                    active ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                  )}
                >
                  <span className="whitespace-nowrap">
                    {t.categories[section.category]}
                    <span className="ml-2 text-xs opacity-60">({count})</span>
                  </span>
                  {active && (
                    <motion.span
                      layoutId={reduced ? undefined : "cargo-underline"}
                      className="absolute inset-x-4 bottom-0 h-0.5 bg-[var(--accent)] sm:inset-x-6"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={cargoTab}
            className="mt-10"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeCargo.length ? (
              <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {activeCargo.map((item, index) => (
                    <Reveal
                      key={item.id}
                      delay={Math.min(index * 0.04, 0.2)}
                      className="min-w-0 max-w-full"
                    >
                      <ItemCard item={item} />
                    </Reveal>
                  ))}
              </div>
            ) : (
              <div className="py-20">
                <div className="mb-6 h-px w-24 bg-[var(--accent)]" />
                <p className="text-3xl font-medium tracking-tight text-[var(--text)] sm:text-4xl">
                  {t.home.noItems}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* WAREHOUSES */}
      <section id="warehouses" className="canvas-pad section-space scroll-mt-28 pt-0">
        <Reveal className="mb-12 max-w-3xl space-y-4">
          <h2 className="section-title">{t.home.warehousesTitle}</h2>
          <p className="max-w-xl text-[var(--muted)]">{t.home.warehousesSubtitle}</p>
          <p className="text-sm text-[var(--muted)]">
            {warehouseCount} · CN hub
          </p>
        </Reveal>
        <WarehouseRegionButtons chinaCount={chinaCount} tashkentCount={tashkentCount} />
      </section>

      {/* OPERATORS */}
      <section id="operators" className="canvas-pad section-space scroll-mt-28">
        <Reveal className="mb-12 max-w-3xl space-y-4">
          <h2 className="section-title">{t.home.operatorsTitle}</h2>
          <p className="max-w-xl text-sm text-[var(--muted)]">{t.home.operatorsSubtitle}</p>
        </Reveal>

        {operators.length ? (
          <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {operators.map((operator, index) => (
              <Reveal
                key={operator.id}
                delay={Math.min(index * 0.05, 0.2)}
                className="min-w-0 max-w-full"
              >
                <OperatorCard operator={operator} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="py-16">
            <div className="mb-6 h-px w-24 bg-[var(--accent)]" />
            <p className="text-3xl font-medium tracking-tight text-[var(--text)]">
              {t.home.noOperators}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

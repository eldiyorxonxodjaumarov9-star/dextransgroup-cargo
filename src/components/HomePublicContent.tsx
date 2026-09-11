"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
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
import {
  AnimatedNumber,
  FadeIn,
  Reveal,
  Stagger,
  StaggerItem,
} from "@/components/design/motion";
import { HeroLogisticsViz } from "@/components/logistics/HeroLogisticsViz";
import { TrackingSearch } from "@/components/logistics/TrackingSearch";
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
    href: "https://t.me/DEXTRANSWORLDWIDE",
    featured: true,
  },
  {
    id: "foto-video",
    href: "https://t.me/dextransworld",
  },
  {
    id: "textil",
    href: "https://t.me/DEXTRANS_TEXTIL_PRINT",
  },
  {
    id: "dex-car",
    href: "https://t.me/dex_cars",
  },
  {
    id: "admin",
    href: "/admin",
    internal: true,
  },
] as const;

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
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    const onSearch = (event: Event) => {
      const detail = (event as CustomEvent<{ q?: string }>).detail;
      const q = (detail?.q || "").trim();
      setSearchQ(q);
      if (q) setCargoTab("NEW");
    };
    window.addEventListener("dextrans:cargo-search", onSearch);
    return () => window.removeEventListener("dextrans:cargo-search", onSearch);
  }, []);

  const categoryCards = channelMeta.map((card) => {
    if (card.id === "logistika") {
      return {
        ...card,
        title: t.channels.logistikaTitle,
        description: t.channels.logistikaDesc,
      };
    }
    if (card.id === "foto-video") {
      return {
        ...card,
        title: t.channels.fotoTitle,
        description: t.channels.fotoDesc,
      };
    }
    if (card.id === "textil") {
      return {
        ...card,
        title: t.channels.textilTitle,
        description: t.channels.textilDesc,
      };
    }
    if (card.id === "dex-car") {
      return {
        ...card,
        title: t.channels.carTitle,
        description: t.channels.carDesc,
      };
    }
    return {
      ...card,
      title: t.channels.adminTitle,
      description: t.channels.adminDesc,
    };
  });

  const values = [
    {
      num: "01",
      icon: ShieldCheck,
      title: t.values.safetyTitle,
      text: t.values.safetyText,
    },
    {
      num: "02",
      icon: Zap,
      title: t.values.fastTitle,
      text: t.values.fastText,
    },
    {
      num: "03",
      icon: PackageCheck,
      title: t.values.warehouseTitle,
      text: t.values.warehouseText,
    },
    {
      num: "04",
      icon: Headphones,
      title: t.values.helpTitle,
      text: t.values.helpText,
    },
  ];

  const filteredItems = useMemo(() => {
    const base = items.filter((item) => item.category === cargoTab);
    if (!searchQ) return base;
    const q = searchQ.toLowerCase();
    return items.filter(
      (item) =>
        item.trackNumber.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
    );
  }, [items, cargoTab, searchQ]);

  const arrivedCount = items.filter((i) => i.category === "ARRIVED").length;
  const transitCount = items.filter((i) => i.category === "IN_TRANSIT").length;

  const heroLines = t.home.heroTitle.split("\n");

  return (
    <div className="w-full min-w-0 pb-20 lg:pb-0">
      <HashScroll />

      {/* 01 Hero */}
      <section id="home" className="page-wrap relative pt-6 sm:pt-10 lg:pt-14">
        <div className="home-hero">
          <div className="home-hero__copy">
            <FadeIn>
              <p className="section-kicker">{t.home.heroLabel}</p>
            </FadeIn>
            <h1 className="home-hero__title mt-5">
              {heroLines.map((line, i) => (
                <motion.span
                  key={line}
                  className="block"
                  initial={reduced ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.08 + i * 0.1,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {line}
                </motion.span>
              ))}
            </h1>
            <FadeIn delay={0.25}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                {t.home.heroText}
              </p>
            </FadeIn>
            <FadeIn delay={0.32}>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#cargo" className="btn btn-primary">
                  {t.home.ctaCargo}
                  <ArrowRight size={16} />
                </a>
                <a href="#warehouses" className="btn btn-secondary">
                  {t.home.ctaWarehouses}
                </a>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="mt-8 max-w-xl">
                <TrackingSearch
                  placeholder={t.home.trackPlaceholder}
                  ctaLabel={t.home.trackCta}
                />
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.2} className="home-hero__viz">
            <HeroLogisticsViz />
          </FadeIn>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: t.home.chinaWarehouses,
              value: chinaCount || warehouseCount,
            },
            { label: t.categories.IN_TRANSIT, value: transitCount },
            { label: t.categories.ARRIVED, value: arrivedCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
            >
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">
                <AnimatedNumber value={stat.value} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 02 Network / channels */}
      <section className="section-space page-wrap" id="network">
        <Reveal>
          <p className="section-kicker">{t.home.networkKicker}</p>
          <h2 className="section-title mt-3">{t.home.networkTitle}</h2>
        </Reveal>
        <Stagger className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {categoryCards.map((card, index) => {
            const Comp = "internal" in card && card.internal ? Link : "a";
            const props =
              "internal" in card && card.internal
                ? { href: card.href }
                : {
                    href: card.href,
                    target: "_blank",
                    rel: "noreferrer",
                  };
            return (
              <StaggerItem key={card.id}>
                <Comp
                  {...(props as { href: string })}
                  className={cn(
                    "group flex h-full flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[color-mix(in_srgb,var(--accent-secondary)_40%,var(--border))]",
                    index === 0 && "md:col-span-2 xl:col-span-1"
                  )}
                >
                  <div>
                    <p className="tracking-id text-[10px] text-[var(--accent-secondary)]">
                      CH-{String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      {card.description}
                    </p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                    {t.channels.openChannel}
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </Comp>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* 03 Cargo */}
      <section id="cargo" className="section-space page-wrap">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">03 · Cargo</p>
              <h2 className="section-title mt-3">{t.home.cargoTitle}</h2>
              <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
                {t.home.cargoSubtitle}
              </p>
            </div>
            {searchQ && (
              <button
                type="button"
                className="btn btn-secondary !min-h-10 !text-xs"
                onClick={() => setSearchQ("")}
              >
                Clear · {searchQ}
              </button>
            )}
          </div>
        </Reveal>

        <div className="tabs-scroll mt-8 gap-2">
          {(
            [
              ["NEW", t.categories.NEW],
              ["IN_TRANSIT", t.categories.IN_TRANSIT],
              ["ARRIVED", t.categories.ARRIVED],
            ] as const
          ).map(([id, label]) => {
            const active = cargoTab === id && !searchQ;
            const count = items.filter((item) => item.category === id).length;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchQ("");
                  setCargoTab(id);
                }}
                className={cn(
                  "relative shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                )}
              >
                {label}
                <span className="ml-2 tracking-id text-[11px] opacity-70">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${cargoTab}-${searchQ}`}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredItems.length ? (
              filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div className="col-span-full rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
                <p className="section-kicker">Empty</p>
                <p className="mt-3 font-display text-2xl">{t.home.noItems}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 04 Why Dextrans */}
      <section className="section-space page-wrap">
        <Reveal>
          <p className="section-kicker">{t.home.processKicker}</p>
          <h2 className="section-title mt-3 max-w-3xl">{t.home.processTitle}</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <Reveal key={value.num} delay={i * 0.05}>
                <article className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="tracking-id text-sm text-[var(--accent)]">
                      {value.num}
                    </span>
                    <Icon
                      size={20}
                      className="text-[var(--accent-secondary)]"
                    />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {value.text}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 05 Warehouses */}
      <section id="warehouses" className="section-space page-wrap">
        <Reveal>
          <p className="section-kicker">05 · Hubs</p>
          <h2 className="section-title mt-3">{t.home.warehousesTitle}</h2>
          <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
            {t.home.warehousesSubtitle}
          </p>
        </Reveal>
        <div className="mt-8">
          <WarehouseRegionButtons
            chinaCount={chinaCount}
            tashkentCount={tashkentCount}
          />
        </div>
      </section>

      {/* 06 Guest */}
      <section className="section-space page-wrap">
        <GuestServicesBanner bannerSrc={guestBannerUrl} />
      </section>

      {/* 07 Operators */}
      <section id="operators" className="section-space page-wrap">
        <Reveal>
          <p className="section-kicker">07 · Contacts</p>
          <h2 className="section-title mt-3">{t.home.operatorsTitle}</h2>
          <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
            {t.home.operatorsSubtitle}
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {operators.length ? (
            operators.map((op) => <OperatorCard key={op.id} operator={op} />)
          ) : (
            <p className="text-[var(--text-secondary)]">{t.home.noOperators}</p>
          )}
        </div>
      </section>

      {/* 10 Final CTA */}
      <section className="page-wrap pb-16 pt-8">
        <Reveal>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-6 py-10 sm:px-10 sm:py-14">
            <p className="section-kicker">Command</p>
            <h2 className="mt-4 max-w-2xl font-display text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight">
              {t.home.finalCtaTitle}
            </h2>
            <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
              {t.home.finalCtaText}
            </p>
            <div className="mt-8 max-w-xl">
              <TrackingSearch
                placeholder={t.home.trackPlaceholder}
                ctaLabel={t.home.trackCta}
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

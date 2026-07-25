import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ItemCard } from "@/components/ItemCard";
import { OperatorCard } from "@/components/OperatorCard";
import { WarehouseRegionButtons } from "@/components/WarehouseRegionButtons";
import { HashScroll } from "@/components/HashScroll";
import { CATEGORY_LABELS } from "@/lib/constants";
import { itemListInclude, sanitizeItem } from "@/lib/item-api";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";
import { warehouseListSelect } from "@/lib/warehouse-api";

export const dynamic = "force-dynamic";

const categoryCards = [
  {
    id: "logistika",
    title: "Logistika transport bo‘yicha",
    description: "Yuklar, yo‘nalishlar va tezkor logistika yangiliklari",
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80",
    href: "https://t.me/DEXTRANSWORLDWIDE",
    cta: "Kanalga o‘tish",
    ctaClass: "bg-[var(--brand-teal)] text-white",
    avatar: "/channels/logistika.jpg",
  },
  {
    id: "foto-video",
    title: "Foto video uchun aksessuarlar",
    description: "Kamera, studio va multimedia mahsulotlari",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    href: "https://t.me/dextransworld",
    cta: "Kanalga o‘tish",
    ctaClass: "bg-[var(--brand-navy)] text-white",
    avatar: "/channels/foto-video.jpg",
  },
  {
    id: "textil",
    title: "Textil print uchun aksessuarlar",
    description: "Tekstil, print va brend aksessuarlari",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
    href: "https://t.me/DEXTRANS_TEXTIL_PRINT",
    cta: "Kanalga o‘tish",
    ctaClass: "bg-[var(--brand-teal-dark)] text-white",
    avatar: "/channels/textil.jpg",
  },
  {
    id: "dex-car",
    title: "DEX CAR",
    description: "Avtomobil yo‘nalishi va maxsus takliflar",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80",
    href: "https://t.me/dex_cars",
    cta: "Kanalga o‘tish",
    ctaClass: "bg-[var(--brand-navy)] text-white",
    avatar: "/channels/dex-car.jpg",
  },
  {
    id: "admin",
    title: "ADMIN",
    description: "Boshqaruv paneli va xavfsiz kirish",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80",
    href: "/admin",
    cta: "Kategoriya",
    ctaClass: "bg-[var(--brand-teal)] text-white",
    avatar: null,
    internal: true,
  },
];

const values = [
  { icon: ShieldCheck, title: "Xavfsizlik kafolati", text: "Yuklar himoyalangan" },
  { icon: Zap, title: "Tez yetkazish", text: "Optimallashtirilgan marshrut" },
  { icon: PackageCheck, title: "Ombor nazorati", text: "Xitoy va Toshkent" },
  { icon: Headphones, title: "24/7 yordam", text: "Operator bilan aloqa" },
];

export default async function HomePage() {
  const [warehouseCount, rawItems, warehouses, operators] = await Promise.all([
    safeQuery(
      "Home.warehouseCount",
      () => prisma.warehouse.count({ where: { region: "CHINA" } }),
      0
    ),
    safeQuery(
      "Home.cargo",
      () =>
        prisma.cargoItem.findMany({
          include: itemListInclude,
          orderBy: { date: "desc" },
        }),
      []
    ),
    safeQuery(
      "Home.warehouses",
      () =>
        prisma.warehouse.findMany({
          select: warehouseListSelect,
          orderBy: [{ region: "asc" }, { name: "asc" }],
        }),
      []
    ),
    safeQuery(
      "Home.operators",
      () =>
        prisma.operator.findMany({
          orderBy: [{ isActive: "desc" }, { name: "asc" }],
        }),
      []
    ),
  ]);

  const items = rawItems.map(sanitizeItem);
  const chinaCount = warehouses.filter((w) => w.region === "CHINA").length;
  const tashkentCount = warehouses.filter((w) => w.region === "TASHKENT").length;
  const cargoSections = [
    { id: "new", category: "NEW" as const },
    { id: "transit", category: "IN_TRANSIT" as const },
    { id: "arrived", category: "ARRIVED" as const },
  ];

  return (
    <div className="space-y-16 pb-6">
      <HashScroll />

      {/* HOME */}
      <section id="home" className="scroll-mt-24 space-y-6">
        <div className="relative overflow-hidden rounded-[22px] border border-border bg-card shadow-[0_25px_60px_-40px_rgba(8,32,64,0.45)] sm:rounded-[28px]">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1800&q=80"
              alt="Dextrans logistics"
              fill
              priority
              className="object-cover object-[center_35%] sm:object-center"
              sizes="100vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-navy)] via-[var(--brand-navy)]/94 to-[var(--brand-navy)]/88 sm:bg-gradient-to-r sm:from-[var(--brand-navy)] sm:via-[var(--brand-navy)]/92 sm:to-[var(--brand-teal)]/35" />
          </div>

          <div className="relative grid gap-6 p-4 sm:p-6 md:p-8 lg:grid-cols-[1.35fr_0.75fr] lg:p-10">
            <div className="min-w-0 max-w-2xl space-y-4 sm:space-y-5">
              <Image
                src="/brand/logo-worldwide.png"
                alt="dextrans Worldwide"
                width={240}
                height={88}
                priority
                className="h-11 w-auto max-w-[min(200px,70vw)] sm:h-14 sm:max-w-[240px]"
              />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] sm:text-xs sm:tracking-[0.24em]">
                Sifat • Tezkorlik • Ishonch
              </p>
              <h1
                className="font-black leading-[1.08] tracking-tight text-white text-balance"
                style={{ fontSize: "clamp(1.75rem, 6.5vw, 3.5rem)" }}
              >
                DEXTRANS GROUP
                <br />
                <span className="text-[var(--accent)]">CARGO</span>
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                Xitoy omborlari, yuk kuzatuvi va rasmiy Telegram kanallar — bitta
                professional platformada.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#cargo"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-teal)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/25 sm:w-auto"
                >
                  Cargo yuklar
                </a>
                <a
                  href="#warehouses"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur sm:w-auto"
                >
                  Omborlar
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
                {[
                  { icon: PackageCheck, value: "1250+", label: "Yuk yetkazib berildi" },
                  { icon: ShieldCheck, value: "98%", label: "Mamnun mijozlar" },
                  { icon: Clock3, value: "24/7", label: "Qo‘llab-quvvatlash" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-sm backdrop-blur last:col-span-2 sm:last:col-span-1"
                    >
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-teal)] text-white">
                        <Icon size={16} />
                      </div>
                      <p className="text-lg font-black text-white sm:text-xl">{item.value}</p>
                      <p className="break-words text-[11px] text-white/65">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-end justify-stretch lg:justify-end">
              <div className="w-full max-w-none rounded-[24px] border border-white/20 bg-[var(--brand-navy-deep)]/85 p-4 text-white shadow-2xl backdrop-blur-xl sm:p-5 lg:max-w-sm">
                <p className="mb-4 text-sm font-bold">Tezkor menyu</p>
                <div className="space-y-3">
                  <a
                    href="#warehouses"
                    className="flex min-h-11 items-center gap-3 rounded-2xl bg-white/10 px-3 py-3 transition hover:bg-white/15"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg">
                      🇨🇳
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Xitoy omborlari</p>
                      <p className="text-xs text-white/70">{warehouseCount} ta manzil</p>
                    </div>
                  </a>
                  <a
                    href="#warehouses"
                    className="flex min-h-11 items-center gap-3 rounded-2xl bg-white/10 px-3 py-3 transition hover:bg-white/15"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg">
                      🇺🇿
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Toshkent omborlari</p>
                      <p className="text-xs text-white/70">Admin orqali boshqariladi</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {categoryCards.map((card) => {
            const inner = (
              <>
                <div className="flex min-w-0 items-start justify-between gap-3 p-4 pb-2">
                  <div className="min-w-0">
                    <h3 className="break-words text-[15px] font-bold leading-snug text-[var(--brand-ink)] dark:text-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {card.description}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[var(--brand-teal)] shadow-sm">
                    <ArrowRight size={14} />
                  </span>
                </div>
                <div className="relative mx-4 mb-3 aspect-[5/4] overflow-hidden rounded-2xl bg-[var(--shell-bg)]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 20vw"
                    unoptimized
                  />
                  {card.avatar && (
                    <span className="absolute bottom-3 left-3 h-12 w-12 overflow-hidden rounded-2xl border-2 border-white shadow-lg">
                      <Image
                        src={card.avatar}
                        alt="Kanal profil"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </span>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold ${card.ctaClass}`}
                  >
                    {card.cta}
                  </span>
                </div>
              </>
            );

            const className =
              "group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_18px_40px_-30px_rgba(8,32,64,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(8,32,64,0.45)]";

            if (card.internal) {
              return (
                <Link key={card.id} href={card.href} className={className}>
                  {inner}
                </Link>
              );
            }

            return (
              <a
                key={card.id}
                href={card.href}
                target="_blank"
                rel="noreferrer"
                className={className}
              >
                {inner}
              </a>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {values.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`flex items-center gap-3 px-5 py-5 ${
                    index < values.length - 1
                      ? "border-b border-border sm:border-b-0 lg:border-r"
                      : ""
                  }`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-teal-soft)] text-[var(--brand-teal)]">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--brand-ink)] dark:text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CARGO */}
      <section id="cargo" className="scroll-mt-24 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold sm:text-3xl">Cargo bo‘limi</h2>
          <p className="max-w-2xl text-muted">
            Yangi, yo‘ldagi va Toshkentga kelgan tovarlarni kuzating.
          </p>
        </div>
        {cargoSections.map((section) => {
          const list = items.filter((item) => item.category === section.category);
          return (
            <div key={section.id} className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">
                  {CATEGORY_LABELS[section.category]}
                </h3>
                <p className="text-sm text-muted">{list.length} ta tovar</p>
              </div>
              {list.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="card p-6 text-muted">Hozircha tovar yo‘q.</div>
              )}
            </div>
          );
        })}
      </section>

      {/* WAREHOUSES */}
      <section id="warehouses" className="scroll-mt-24 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold sm:text-3xl">Omborlar</h2>
          <p className="max-w-2xl text-muted">
            Xitoy yoki Toshkent omborlarini tanlang — xaritalar alohida sahifada
            ochiladi.
          </p>
        </div>
        <WarehouseRegionButtons
          chinaCount={chinaCount}
          tashkentCount={tashkentCount}
        />
      </section>

      {/* OPERATORS */}
      <section id="operators" className="scroll-mt-24 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-[var(--brand-ink)] dark:text-foreground sm:text-3xl">
            Operatorlar
          </h2>
          <p className="max-w-2xl text-sm text-muted">
            Bog‘lanish uchun telefon raqami va Telegram manzili.
          </p>
        </div>
        {operators.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {operators.map((operator) => (
              <OperatorCard key={operator.id} operator={operator} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-border bg-card p-6 text-muted">
            Hozircha operator qo‘shilmagan.
          </div>
        )}
      </section>
    </div>
  );
}

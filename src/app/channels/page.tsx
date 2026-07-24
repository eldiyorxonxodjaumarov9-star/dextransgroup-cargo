import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { TAPLINK_SOURCE, TELEGRAM_CHANNELS } from "@/lib/channels";

export const metadata = {
  title: "Kanallar | DEXTRANS GROUP CARGO",
};

const cardMeta: Record<
  string,
  { description: string; image: string; ctaClass: string; cta: string }
> = {
  logistika: {
    description: "Yuklar, yo‘nalishlar va tezkor logistika yangiliklari",
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80",
    ctaClass: "bg-[var(--brand-teal)] text-white",
    cta: "Kanalga o‘tish",
  },
  "foto-video": {
    description: "Kamera, studio va multimedia mahsulotlari",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    ctaClass: "bg-[var(--brand-navy)] text-white",
    cta: "Kanalga o‘tish",
  },
  textil: {
    description: "Tekstil, print va brend aksessuarlari",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
    ctaClass: "bg-[var(--brand-teal-dark)] text-white",
    cta: "Kanalga o‘tish",
  },
  "dex-car": {
    description: "Avtomobil yo‘nalishi va maxsus takliflar",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80",
    ctaClass: "bg-[var(--brand-navy)] text-white",
    cta: "Kanalga o‘tish",
  },
  admin: {
    description: "Admin bilan bog‘lanish",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80",
    ctaClass: "bg-[var(--brand-teal)] text-white",
    cta: "Email yozish",
  },
};

export default function ChannelsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-teal)]">
              Aloqa kanallari
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--brand-ink)] dark:text-foreground">
              DEXTRANS
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Rasmiy Telegram kanallar — premium kartalar va profil rasmlari bilan.
            </p>
          </div>
          <a
            href={TAPLINK_SOURCE}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-[var(--brand-ink)] dark:text-foreground"
          >
            Asl TapLink <ArrowRight size={14} />
          </a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TELEGRAM_CHANNELS.map((channel) => {
          const meta = cardMeta[channel.id] || cardMeta.admin;
          return (
            <a
              key={channel.id}
              href={channel.href}
              target={channel.kind === "email" ? undefined : "_blank"}
              rel="noreferrer"
              className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_18px_40px_-30px_rgba(8,32,64,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(8,32,64,0.45)]"
            >
              <div className="flex items-start justify-between gap-3 p-4 pb-2">
                <div>
                  <h3 className="text-[15px] font-bold leading-snug text-[var(--brand-ink)] dark:text-foreground">
                    {channel.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {meta.description}
                  </p>
                  {channel.username && (
                    <p className="mt-1 text-xs font-semibold text-[var(--brand-teal)]">
                      {channel.username}
                    </p>
                  )}
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[var(--brand-teal)] shadow-sm">
                  <ArrowRight size={14} />
                </span>
              </div>

              <div className="relative mx-4 mb-3 aspect-[5/4] overflow-hidden rounded-2xl bg-[var(--shell-bg)]">
                <Image
                  src={meta.image}
                  alt={channel.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width:768px) 100vw, 33vw"
                  unoptimized
                />
                {channel.image && (
                  <span className="absolute bottom-3 left-3 h-14 w-14 overflow-hidden rounded-2xl border-[3px] border-white shadow-xl">
                    <Image
                      src={channel.image}
                      alt={`${channel.title} profil`}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  </span>
                )}
              </div>

              <div className="px-4 pb-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold ${meta.ctaClass}`}
                >
                  {meta.cta}
                </span>
              </div>
            </a>
          );
        })}
      </section>
    </div>
  );
}

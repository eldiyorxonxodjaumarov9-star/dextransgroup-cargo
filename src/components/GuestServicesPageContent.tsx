"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  DEFAULT_GUEST_IMAGES,
  GUEST_SERVICE_COPY,
  GUEST_SERVICE_LANGUAGES,
  type GuestServiceLang,
} from "@/lib/guest-services";

export type GuestMediaItem = {
  id: string;
  kind: string;
  title: string | null;
  mediaUrl: string | null;
  mimeType?: string | null;
};

function youtubeEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function GuestServicesPageContent({
  media,
}: {
  media: GuestMediaItem[];
}) {
  const [lang, setLang] = useState<GuestServiceLang>("uz");
  const copy = GUEST_SERVICE_COPY[lang];

  const { images, videos, banner } = useMemo(() => {
    const active = media.filter((m) => m.mediaUrl);
    const dbImages = active.filter((m) => m.kind === "IMAGE");
    const dbVideos = active.filter((m) => m.kind === "VIDEO");
    const dbBanner = active.find((m) => m.kind === "BANNER");

    return {
      banner: dbBanner?.mediaUrl || DEFAULT_GUEST_IMAGES[0].src,
      images:
        dbImages.length > 0
          ? dbImages.map((m) => ({
              id: m.id,
              title: m.title || "Rasm",
              src: m.mediaUrl!,
            }))
          : DEFAULT_GUEST_IMAGES,
      videos: dbVideos,
    };
  }, [media]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/#guest-services" className="btn btn-secondary text-sm">
          <ArrowLeft size={16} /> Orqaga
        </Link>
        <div className="flex flex-wrap gap-2">
          {GUEST_SERVICE_LANGUAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLang(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                lang === item.id
                  ? "bg-[var(--brand-teal)] text-white"
                  : "border border-border bg-card text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[28px] border border-border">
        <div className="relative min-h-[240px] sm:min-h-[320px]">
          <Image
            src={banner}
            alt={copy.title}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,28,48,0.9)] via-[rgba(8,28,48,0.45)] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{copy.title}</h1>
            <p className="max-w-2xl text-sm text-white/85 sm:text-base">{copy.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="text-xl font-bold">Xizmatlar / Services</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {copy.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-relaxed"
            >
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-[var(--brand-teal)]"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Galereya</h2>
          <p className="text-sm text-muted">Xizmatlardan lavhalar</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((img) => (
            <figure
              key={img.id}
              className="overflow-hidden rounded-[24px] border border-border bg-card"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 50vw"
                  unoptimized
                />
              </div>
              <figcaption className="px-4 py-3 text-sm font-medium">
                {img.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {videos.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Video</h2>
            <p className="text-sm text-muted">Mehmon xizmatlari haqida</p>
          </div>
          <div className="grid gap-4">
            {videos.map((video) => {
              const src = video.mediaUrl!;
              const embed = youtubeEmbed(src);
              return (
                <div
                  key={video.id}
                  className="overflow-hidden rounded-[24px] border border-border bg-card"
                >
                  {embed ? (
                    <iframe
                      title={video.title || "Video"}
                      src={embed}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      className="aspect-video w-full bg-black"
                      src={src}
                    >
                      Brauzeringiz video formatini qo‘llab-quvvatlamaydi.
                    </video>
                  )}
                  {video.title && (
                    <p className="px-4 py-3 text-sm font-medium">{video.title}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

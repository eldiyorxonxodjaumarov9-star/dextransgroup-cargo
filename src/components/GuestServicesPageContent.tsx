"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { DEFAULT_GUEST_IMAGES } from "@/lib/guest-services";

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
  const { t, locale, setLocale } = useLocale();

  const { images, videos, banner } = useMemo(() => {
    const active = media.filter((m) => m.mediaUrl);
    const dbImages = active.filter((m) => m.kind === "IMAGE");
    const dbVideos = active.filter((m) => m.kind === "VIDEO");
    const dbBanner = active.find((m) => m.kind === "BANNER");
    const captions = t.guest.galleryCaptions;

    return {
      banner: dbBanner?.mediaUrl || DEFAULT_GUEST_IMAGES[0].src,
      images:
        dbImages.length > 0
          ? dbImages.map((m) => ({
              id: m.id,
              title: m.title || t.guest.imageFallback,
              src: m.mediaUrl!,
            }))
          : DEFAULT_GUEST_IMAGES.map((img) => ({
              id: img.id,
              title: captions[img.captionKey],
              src: img.src,
            })),
      videos: dbVideos,
    };
  }, [media, t.guest.galleryCaptions, t.guest.imageFallback]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/#guest-services"
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] hover:text-[var(--accent)]"
        >
          <ArrowLeft size={16} /> {t.guest.back}
        </Link>
        <div className="tabs-scroll max-w-full gap-2 pb-1">
          {LOCALES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLocale(item.id)}
              className={`min-h-11 shrink-0 rounded-full px-3 py-2 text-xs font-bold transition ${
                locale === item.id
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text)]"
              }`}
            >
              {item.short}
            </button>
          ))}
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)]">
        <div className="relative min-h-[240px] sm:min-h-[320px]">
          <Image
            src={banner}
            alt={t.guest.title}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[color-mix(in_srgb,var(--background)_55%,transparent)] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-6 sm:p-8">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
              {t.guest.title}
            </h1>
            <p className="max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">
              {t.guest.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold">{t.guest.services}</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {t.guest.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-sm leading-relaxed"
            >
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-[var(--accent)]"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold">{t.guest.gallery}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t.guest.gallerySub}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((img) => (
            <figure
              key={img.id}
              className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]"
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
            <h2 className="font-display text-xl font-semibold">{t.guest.video}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{t.guest.videoSub}</p>
          </div>
          <div className="grid gap-4">
            {videos.map((video) => {
              const src = video.mediaUrl!;
              const embed = youtubeEmbed(src);
              return (
                <div
                  key={video.id}
                  className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]"
                >
                  {embed ? (
                    <iframe
                      title={video.title || t.guest.video}
                      src={embed}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      className="aspect-video w-full bg-[var(--background)]"
                      src={src}
                    />
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

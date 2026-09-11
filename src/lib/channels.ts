export type ChannelLink = {
  id: string;
  title: string;
  href: string;
  kind: "telegram" | "email";
  description?: string;
  image?: string;
  username?: string;
};

export const TELEGRAM_CHANNELS: ChannelLink[] = [
  {
    id: "logistika",
    title: "LOGISTIKA TRANSPORT BOYICHA",
    href: "https://t.me/DEXTRANSWORLDWIDE",
    kind: "telegram",
    description: "Logistika va transport kanali",
    username: "@DEXTRANSWORLDWIDE",
    image: "/channels/logistika.jpg",
  },
  {
    id: "foto-video",
    title: "FOTO VIDEO UCHUN AKSESSUARLAR",
    href: "https://t.me/dextransworld",
    kind: "telegram",
    description: "Foto va video aksessuarlar",
    username: "@dextransworld",
    image: "/channels/foto-video.jpg",
  },
  {
    id: "textil",
    title: "TEXTIL PRINT UCHUN AKSESSUARLAR",
    href: "https://t.me/DEXTRANS_TEXTIL_PRINT",
    kind: "telegram",
    description: "Tekstil va print aksessuarlar",
    username: "@DEXTRANS_TEXTIL_PRINT",
    image: "/channels/textil.jpg",
  },
  {
    id: "dex-car",
    title: "DEX CAR",
    href: "https://t.me/dex_cars",
    kind: "telegram",
    description: "Avtomobil yo‘nalishi",
    username: "@dex_cars",
    image: "/channels/dex-car.jpg",
  },
  {
    id: "admin",
    title: "ADMIN",
    href: "mailto:DEXTRANSWORLD@GMAIL.COM",
    kind: "email",
    description: "DEXTRANSWORLD@GMAIL.COM",
    image: undefined,
  },
];

export const TAPLINK_SOURCE = "https://taplink.cc/dex.telegram";

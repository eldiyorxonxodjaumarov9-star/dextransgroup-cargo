import type { CargoStatus } from "@/lib/types";
import { CARGO_STATUS_ORDER } from "@/lib/constants";

export const STATUS_UZ: Record<CargoStatus, string> = {
  CHINA_WAREHOUSE: "Xitoy omborida",
  DEPARTED: "Jo‘natildi",
  AT_BORDER: "Chegarada",
  ARRIVED_TASHKENT: "Toshkentga yetib keldi",
};

export const CATEGORY_UZ = {
  NEW: "Yangi",
  IN_TRANSIT: "Yo‘lda",
  ARRIVED: "Kelgan",
} as const;

export const STATUS_SHORT: Record<string, CargoStatus> = {
  CW: "CHINA_WAREHOUSE",
  DP: "DEPARTED",
  BD: "AT_BORDER",
  AT: "ARRIVED_TASHKENT",
};

export const STATUS_TO_SHORT: Record<CargoStatus, string> = {
  CHINA_WAREHOUSE: "CW",
  DEPARTED: "DP",
  AT_BORDER: "BD",
  ARRIVED_TASHKENT: "AT",
};

export const CATEGORY_SHORT: Record<string, "NEW" | "IN_TRANSIT" | "ARRIVED"> = {
  N: "NEW",
  T: "IN_TRANSIT",
  A: "ARRIVED",
};

export function formatStatusProgress(status: string): string {
  const current = CARGO_STATUS_ORDER.includes(status as CargoStatus)
    ? (status as CargoStatus)
    : "CHINA_WAREHOUSE";
  const idx = CARGO_STATUS_ORDER.indexOf(current);
  return CARGO_STATUS_ORDER.map((step, i) => {
    const label = STATUS_UZ[step];
    if (i < idx) return `✅ ${label}`;
    if (i === idx) return `🟡 ${label}`;
    return `⚪ ${label}`;
  }).join("\n");
}

export function formatDateUz(value?: Date | string | null): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function welcomeText(isAdmin: boolean) {
  const lines = [
    "Assalomu alaykum! 👋",
    "",
    "Dextrans Group Cargo botiga xush kelibsiz.",
    "Kerakli bo‘limni pastdagi menyudan tanlang.",
  ];
  if (isAdmin) {
    lines.push("", "⚙️ Admin menyusi mavjud.");
  }
  return lines.join("\n");
}

export function menuHintText() {
  return "Kerakli bo‘limni pastdagi menyudan tanlang.";
}

export function trackAskText() {
  return "📦 Trek raqamingizni yuboring.\n\nBekor qilish: /cancel";
}

export function cargoNotFoundText(track: string) {
  return `❌ Yuk topilmadi.\n\nTrek: ${track}\n\nQayta yuboring yoki /menu bosing.`;
}

export function formatPublicCargo(item: {
  trackNumber: string;
  name: string;
  status: string;
  etaDate?: Date | string | null;
  warehouse?: { name?: string | null; city?: string | null } | null;
  operator?: { name?: string | null; phone?: string | null } | null;
}) {
  const warehouse =
    item.warehouse?.name ||
    item.warehouse?.city ||
    "—";
  const origin = item.warehouse?.city || item.warehouse?.name || "CHINA";
  return [
    `📦 ${item.trackNumber}`,
    item.name,
    "",
    `${origin} → TASHKENT`,
    `Ombor: ${warehouse}`,
    item.operator?.name
      ? `Operator: ${item.operator.name}${item.operator.phone ? ` (${item.operator.phone})` : ""}`
      : "Operator: —",
    `Holat: ${STATUS_UZ[item.status as CargoStatus] || item.status}`,
    `ETA: ${formatDateUz(item.etaDate)}`,
    "",
    formatStatusProgress(item.status),
  ].join("\n");
}

export function formatWarehouseCard(wh: {
  name: string;
  city: string;
  address: string;
  receiver?: string | null;
  phone: string;
  phone2?: string | null;
  workingHours?: string | null;
}) {
  return [
    `🏢 ${wh.name}`,
    `📍 ${wh.city}`,
    wh.address,
    wh.receiver ? `👤 ${wh.receiver}` : null,
    `📞 ${wh.phone}${wh.phone2 ? ` / ${wh.phone2}` : ""}`,
    wh.workingHours ? `🕒 ${wh.workingHours}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatOperatorCard(op: {
  name: string;
  phone: string;
  telegram?: string | null;
  warehouse?: { name?: string | null } | null;
}) {
  return [
    `👨‍💼 ${op.name}`,
    `📞 ${op.phone}`,
    op.telegram ? `✈️ ${op.telegram}` : null,
    op.warehouse?.name ? `🏢 ${op.warehouse.name}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function guestServicesText(titles?: string[]) {
  const lines = ["🛎 Mehmonlar uchun xizmatlar", ""];
  if (titles?.length) {
    for (const title of titles) {
      lines.push(`• ${title}`);
    }
  } else {
    lines.push("Hozircha faol xizmatlar ro‘yxati bo‘sh.");
  }
  lines.push("", "Batafsil media uchun Mini Appni oching.");
  return lines.join("\n");
}

export function comingSoonText(feature: string) {
  return `⏳ ${feature}\n\nBu xizmat tez orada ishga tushadi.`;
}

export function adminMenuText() {
  return "⚙️ Admin boshqaruvi\n\nKerakli amalni tanlang.";
}

export function onboardIntroText() {
  return [
    "🚚 Mening yuklarim",
    "",
    "Yuklaringizni ko‘rish uchun telefon raqamingizni Telegram orqali yuboring.",
    "Faqat “Telefon raqamni yuborish” tugmasidan foydalaning.",
    "",
    "Chatga yozilgan raqam qabul qilinmaydi.",
  ].join("\n");
}

export function profilePreviewText(options: {
  firstName: string;
  phone: string;
  customerCode: string;
}) {
  return [
    "Profil tasdiqlash:",
    "",
    `👤 ${options.firstName}`,
    `📞 ${options.phone}`,
    `🆔 ${options.customerCode}`,
    "",
    "Tasdiqlaysizmi?",
  ].join("\n");
}

export function statusChangedNotice(options: {
  trackNumber: string;
  name?: string;
  status: CargoStatus;
  origin?: string;
}) {
  const arrived = options.status === "ARRIVED_TASHKENT";
  return [
    "📦 Yukingiz holati yangilandi",
    "",
    options.trackNumber,
    options.origin ? `${options.origin} → TASHKENT` : null,
    "",
    arrived
      ? "✅ Yukingiz Toshkentga yetib keldi."
      : `Yangi holat:\n🟡 ${STATUS_UZ[options.status]}`,
  ]
    .filter(Boolean)
    .join("\n");
}

import type { CargoStatus } from "@/lib/types";
import { STATUS_TO_SHORT, CATEGORY_UZ, STATUS_UZ } from "@/lib/telegram/messages";

export type InlineButton =
  | { text: string; callback_data: string }
  | { text: string; url: string }
  | { text: string; web_app: { url: string } };

export type InlineKeyboardMarkup = {
  inline_keyboard: InlineButton[][];
};

export type ReplyKeyboardMarkup = {
  keyboard: Array<Array<{ text: string }>>;
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
};

export function publicReplyKeyboard(isAdmin: boolean): ReplyKeyboardMarkup {
  const rows: Array<Array<{ text: string }>> = [
    [{ text: "📦 Yukimni tekshirish" }],
    [{ text: "🏢 Omborlar" }, { text: "👨‍💼 Operatorlar" }],
    [{ text: "🛎 Xizmatlar" }, { text: "🌐 Saytni ochish" }],
  ];
  if (isAdmin) {
    rows.push([{ text: "⚙️ Admin boshqaruvi" }]);
  }
  return { keyboard: rows, resize_keyboard: true };
}

export function homeInline(appUrl: string): InlineKeyboardMarkup {
  const base = appUrl.replace(/\/$/, "");
  return {
    inline_keyboard: [
      [{ text: "📦 Yukimni tekshirish", callback_data: "p:track" }],
      [
        { text: "🏢 Omborlar", callback_data: "p:wh" },
        { text: "👨‍💼 Operatorlar", callback_data: "p:op" },
      ],
      [
        { text: "🛎 Xizmatlar", callback_data: "p:svc" },
        { text: "🌐 Saytni ochish", web_app: { url: `${base}/telegram` } },
      ],
      [{ text: "🏠 Menyuga", callback_data: "p:home" }],
    ],
  };
}

/** Single site open button — not the full main menu. */
export function openSiteKeyboard(appUrl: string): InlineKeyboardMarkup {
  const base = appUrl.replace(/\/$/, "");
  return {
    inline_keyboard: [
      [{ text: "🌐 Saytni ochish", web_app: { url: `${base}/telegram` } }],
    ],
  };
}

export function warehouseRegionsKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "🇨🇳 Xitoy omborlari", callback_data: "p:wh:CN:0" }],
      [{ text: "🇺🇿 Toshkent omborlari", callback_data: "p:wh:UZ:0" }],
      [{ text: "⬅️ Orqaga", callback_data: "p:home" }],
    ],
  };
}

export function warehouseListKeyboard(options: {
  region: "CN" | "UZ";
  page: number;
  totalPages: number;
  items: Array<{ id: string; name: string }>;
}): InlineKeyboardMarkup {
  const rows: InlineButton[][] = options.items.map((item) => [
    { text: item.name, callback_data: `p:whd:${item.id}` },
  ]);
  const nav: InlineButton[] = [];
  if (options.page > 0) {
    nav.push({
      text: "⬅️",
      callback_data: `p:wh:${options.region}:${options.page - 1}`,
    });
  }
  if (options.page < options.totalPages - 1) {
    nav.push({
      text: "➡️",
      callback_data: `p:wh:${options.region}:${options.page + 1}`,
    });
  }
  if (nav.length) rows.push(nav);
  rows.push([
    { text: "⬅️ Regionlar", callback_data: "p:wh" },
    { text: "🏠 Menyuga", callback_data: "p:home" },
  ]);
  return { inline_keyboard: rows };
}

export function warehouseDetailKeyboard(options: {
  id: string;
  phone?: string | null;
  telegramUrl?: string | null;
  locationUrl?: string | null;
  regionCode: "CN" | "UZ";
  page: number;
}): InlineKeyboardMarkup {
  const rows: InlineButton[][] = [];
  rows.push([{ text: "📋 Manzilni ko‘rish", callback_data: `p:wha:${options.id}` }]);
  if (options.phone) {
    rows.push([{ text: "📞 Qo‘ng‘iroq", callback_data: `p:whp:${options.id}` }]);
  }
  if (options.locationUrl) {
    rows.push([{ text: "📍 Xarita", url: options.locationUrl }]);
  }
  if (options.telegramUrl) {
    rows.push([{ text: "✈️ Telegram", url: options.telegramUrl }]);
  }
  rows.push([
    {
      text: "⬅️ Ro‘yxat",
      callback_data: `p:wh:${options.regionCode}:${options.page}`,
    },
    { text: "🏠 Menyuga", callback_data: "p:home" },
  ]);
  return { inline_keyboard: rows };
}

export function cargoResultKeyboard(options: {
  cargoId: string;
  appUrl: string;
  subscribed?: boolean;
}): InlineKeyboardMarkup {
  const base = options.appUrl.replace(/\/$/, "");
  const rows: InlineButton[][] = [
    [
      {
        text: options.subscribed ? "✅ Obuna bor" : "🔔 Status o‘zgarsa xabar ber",
        callback_data: options.subscribed ? "p:home" : `p:sub:${options.cargoId}`,
      },
    ],
    [
      { text: "🔎 Yana qidirish", callback_data: "p:track" },
      { text: "🌐 Saytda", web_app: { url: `${base}/telegram` } },
    ],
    [{ text: "🏠 Menyuga", callback_data: "p:home" }],
  ];
  return { inline_keyboard: rows };
}

export function guestServicesKeyboard(appUrl: string): InlineKeyboardMarkup {
  const base = appUrl.replace(/\/$/, "");
  return {
    inline_keyboard: [
      [
        {
          text: "🖼 Mini Appda ochish",
          web_app: { url: `${base}/telegram` },
        },
      ],
      [
        {
          text: "🌐 Saytda ochish",
          url: `${base}/guest-services`,
        },
      ],
      [{ text: "🏠 Menyuga", callback_data: "p:home" }],
    ],
  };
}

export function adminMenuKeyboard(appUrl: string): InlineKeyboardMarkup {
  const base = appUrl.replace(/\/$/, "");
  return {
    inline_keyboard: [
      [{ text: "➕ Yuk qo‘shish", callback_data: "a:add" }],
      [
        { text: "🔎 Yukni topish", callback_data: "a:find" },
        { text: "📦 Yuklar", callback_data: "a:list" },
      ],
      [{ text: "🔄 Status o‘zgartirish", callback_data: "a:status" }],
      [
        { text: "🏢 Omborlar", callback_data: "a:wh" },
        { text: "👨‍💼 Operatorlar", callback_data: "a:op" },
      ],
      [{ text: "📊 Statistika", callback_data: "a:stats" }],
      [
        {
          text: "🌐 Web admin",
          web_app: { url: `${base}/telegram/admin` },
        },
      ],
      [{ text: "🏠 Foydalanuvchi menyu", callback_data: "p:home" }],
    ],
  };
}

export function categoryKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: CATEGORY_UZ.NEW, callback_data: "a:cat:N" }],
      [{ text: CATEGORY_UZ.IN_TRANSIT, callback_data: "a:cat:T" }],
      [{ text: CATEGORY_UZ.ARRIVED, callback_data: "a:cat:A" }],
      [{ text: "❌ Bekor", callback_data: "a:cancel" }],
    ],
  };
}

export function statusKeyboard(prefix = "a:st"): InlineKeyboardMarkup {
  const entries: CargoStatus[] = [
    "CHINA_WAREHOUSE",
    "DEPARTED",
    "AT_BORDER",
    "ARRIVED_TASHKENT",
  ];
  return {
    inline_keyboard: [
      ...entries.map((status) => [
        {
          text: STATUS_UZ[status],
          callback_data: `${prefix}:${STATUS_TO_SHORT[status]}`,
        },
      ]),
      [{ text: "❌ Bekor", callback_data: "a:cancel" }],
    ],
  };
}

export function warehousePickKeyboard(
  items: Array<{ id: string; name: string }>,
  page: number,
  totalPages: number
): InlineKeyboardMarkup {
  const rows: InlineButton[][] = items.map((item) => [
    { text: item.name, callback_data: `a:whset:${item.id}` },
  ]);
  const nav: InlineButton[] = [];
  if (page > 0) nav.push({ text: "⬅️", callback_data: `a:whpage:${page - 1}` });
  if (page < totalPages - 1)
    nav.push({ text: "➡️", callback_data: `a:whpage:${page + 1}` });
  if (nav.length) rows.push(nav);
  rows.push([
    { text: "⏭ O‘tkazib yuborish", callback_data: "a:whskip" },
    { text: "❌ Bekor", callback_data: "a:cancel" },
  ]);
  return { inline_keyboard: rows };
}

export function operatorPickKeyboard(
  items: Array<{ id: string; name: string }>
): InlineKeyboardMarkup {
  const rows: InlineButton[][] = items.map((item) => [
    { text: item.name, callback_data: `a:opset:${item.id}` },
  ]);
  rows.push([
    { text: "⏭ O‘tkazib yuborish", callback_data: "a:opskip" },
    { text: "❌ Bekor", callback_data: "a:cancel" },
  ]);
  return { inline_keyboard: rows };
}

export function previewKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "✅ Saqlash", callback_data: "a:save" }],
      [
        { text: "✏️ Tahrirlash", callback_data: "a:edit" },
        { text: "❌ Bekor qilish", callback_data: "a:cancel" },
      ],
    ],
  };
}

export function adminCargoKeyboard(options: {
  cargoId: string;
  appUrl: string;
}): InlineKeyboardMarkup {
  const base = options.appUrl.replace(/\/$/, "");
  return {
    inline_keyboard: [
      [{ text: "🔄 Status", callback_data: `a:stpick:${options.cargoId}` }],
      [
        {
          text: "🌐 Saytda ochish",
          web_app: { url: `${base}/telegram` },
        },
      ],
      [{ text: "⬅️ Admin menyu", callback_data: "a:menu" }],
    ],
  };
}

export function adminCargoListKeyboard(
  items: Array<{ id: string; trackNumber: string }>
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      ...items.map((item) => [
        {
          text: item.trackNumber,
          callback_data: `a:show:${item.id}`,
        },
      ]),
      [{ text: "⬅️ Admin menyu", callback_data: "a:menu" }],
    ],
  };
}

export function skipOrCancelKeyboard(skipData: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "⏭ O‘tkazib yuborish", callback_data: skipData }],
      [{ text: "❌ Bekor", callback_data: "a:cancel" }],
    ],
  };
}

/** @deprecated legacy start keyboard — kept for tests */
export function buildStartInlineKeyboard(options: {
  appUrl: string;
  isAdmin: boolean;
}): InlineKeyboardMarkup {
  const appUrl = options.appUrl.replace(/\/$/, "");
  const rows: InlineButton[][] = [
    [{ text: "🚚 Saytni ochish", web_app: { url: `${appUrl}/telegram` } }],
  ];
  if (options.isAdmin) {
    rows.push([
      { text: "🔐 Admin panel", web_app: { url: `${appUrl}/telegram/admin` } },
    ]);
  }
  return { inline_keyboard: rows };
}

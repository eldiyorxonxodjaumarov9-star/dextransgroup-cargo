import { prisma } from "@/lib/prisma";
import {
  createCargoItem,
  findCargoByTrackNumber,
  getCargoStats,
  listRecentCargo,
  updateCargoStatus,
} from "@/lib/cargo-service";
import {
  answerCallbackQuery,
  sendMessage,
  type TelegramReplyMarkup,
} from "@/lib/telegram/bot-api";
import {
  clearSession,
  getSession,
  patchSession,
  upsertSession,
  type SessionPayload,
} from "@/lib/telegram/conversation";
import {
  adminCargoKeyboard,
  adminCargoListKeyboard,
  adminMenuKeyboard,
  cargoResultKeyboard,
  categoryKeyboard,
  guestServicesKeyboard,
  homeInline,
  operatorPickKeyboard,
  previewKeyboard,
  publicReplyKeyboard,
  skipOrCancelKeyboard,
  statusKeyboard,
  warehouseDetailKeyboard,
  warehouseListKeyboard,
  warehousePickKeyboard,
  warehouseRegionsKeyboard,
} from "@/lib/telegram/keyboards";
import {
  CATEGORY_SHORT,
  CATEGORY_UZ,
  STATUS_SHORT,
  STATUS_UZ,
  adminMenuText,
  cargoNotFoundText,
  formatOperatorCard,
  formatPublicCargo,
  formatWarehouseCard,
  guestServicesText,
  menuHintText,
  trackAskText,
  welcomeText,
} from "@/lib/telegram/messages";
import { assertTelegramAdmin } from "@/lib/telegram/permissions";
import { isSubscribed, subscribeToCargo } from "@/lib/telegram/subscriptions";
import type { CargoCategory, CargoStatus } from "@/lib/types";
import { googleMapsSearchUrl } from "@/lib/geocode";

export type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: { id?: number; type?: string };
    from?: { id?: number; username?: string; is_bot?: boolean };
  };
  callback_query?: {
    id: string;
    data?: string;
    from?: { id?: number; username?: string; is_bot?: boolean };
    message?: {
      message_id?: number;
      chat?: { id?: number; type?: string };
      text?: string;
    };
  };
};

const PAGE_SIZE = 6;

type Ctx = {
  appUrl: string;
  botToken: string;
  adminIds: string[];
};

async function reply(
  chatId: number | string,
  text: string,
  markup?: TelegramReplyMarkup,
  botToken?: string
) {
  await sendMessage(chatId, text, {
    replyMarkup: markup,
    botToken,
  });
}

function isPrivateChat(type?: string) {
  return !type || type === "private";
}

function normalizeCommand(text: string) {
  return text.trim().split(/\s+/)[0]?.split("@")[0]?.toLowerCase() || "";
}

async function sendHome(options: {
  chatId: number | string;
  userId: number;
  appUrl: string;
  botToken: string;
  adminIds: string[];
  greet?: boolean;
}) {
  const isAdmin = assertTelegramAdmin(options.userId, options.adminIds);
  await clearSession(String(options.userId));
  await reply(
    options.chatId,
    options.greet ? welcomeText(isAdmin) : menuHintText(),
    publicReplyKeyboard(isAdmin),
    options.botToken
  );
  await reply(
    options.chatId,
    "Tezkor tugmalar:",
    homeInline(options.appUrl),
    options.botToken
  );
}

async function listWarehousesPage(
  regionCode: "CN" | "UZ",
  page: number
) {
  const region = regionCode === "CN" ? "CHINA" : "TASHKENT";
  const total = await prisma.warehouse.count({ where: { region } });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const items = await prisma.warehouse.findMany({
    where: { region },
    orderBy: { name: "asc" },
    skip: safePage * PAGE_SIZE,
    take: PAGE_SIZE,
    select: { id: true, name: true },
  });
  return { items, page: safePage, totalPages, total, region };
}

function buildPreview(payload: SessionPayload) {
  return [
    "📦 Yangi yuk",
    "",
    `Trek: ${payload.trackNumber || "—"}`,
    `Nomi: ${payload.name || "—"}`,
    `Kategoriya: ${CATEGORY_UZ[(payload.category as keyof typeof CATEGORY_UZ) || "NEW"] || payload.category}`,
    `Holat: ${STATUS_UZ[(payload.status as CargoStatus) || "CHINA_WAREHOUSE"] || payload.status}`,
    `Ombor: ${payload.warehouseName || "—"}`,
    `Operator: ${payload.operatorName || "—"}`,
    `ETA: ${payload.etaDate || "—"}`,
    `Izoh: ${payload.notes || "—"}`,
  ].join("\n");
}

async function handleTrackLookup(options: {
  chatId: number | string;
  userId: number;
  track: string;
  ctx: Ctx;
}) {
  const item = await findCargoByTrackNumber(options.track);
  if (!item) {
    await reply(
      options.chatId,
      cargoNotFoundText(options.track),
      homeInline(options.ctx.appUrl),
      options.ctx.botToken
    );
    await upsertSession({
      telegramUserId: String(options.userId),
      chatId: String(options.chatId),
      mode: "track_search",
      step: "track",
      payload: {},
    });
    return;
  }

  const subscribed = await isSubscribed(String(options.userId), item.id);
  await clearSession(String(options.userId));
  await reply(
    options.chatId,
    formatPublicCargo(item),
    cargoResultKeyboard({
      cargoId: item.id,
      appUrl: options.ctx.appUrl,
      subscribed,
    }),
    options.ctx.botToken
  );
}

async function startAddCargo(chatId: number | string, userId: number, ctx: Ctx) {
  if (!assertTelegramAdmin(userId, ctx.adminIds)) {
    await reply(chatId, "⛔ Ruxsat yo‘q.", homeInline(ctx.appUrl), ctx.botToken);
    return;
  }
  await upsertSession({
    telegramUserId: String(userId),
    chatId: String(chatId),
    mode: "admin_add",
    step: "track",
    payload: {},
  });
  await reply(
    chatId,
    "➕ Yangi yuk\n\n1/8 Trek raqamini yuboring.\n/cancel — bekor",
    undefined,
    ctx.botToken
  );
}

async function handleAdminAddText(options: {
  chatId: number | string;
  userId: number;
  text: string;
  ctx: Ctx;
}) {
  if (!assertTelegramAdmin(options.userId, options.ctx.adminIds)) {
    await reply(options.chatId, "⛔ Ruxsat yo‘q.", undefined, options.ctx.botToken);
    return;
  }
  const session = await getSession(String(options.userId));
  if (!session || session.mode !== "admin_add") return;

  const text = options.text.trim();
  if (session.step === "track") {
    if (text.length < 3) {
      await reply(options.chatId, "Trek raqami juda qisqa.", undefined, options.ctx.botToken);
      return;
    }
    const exists = await findCargoByTrackNumber(text);
    if (exists) {
      await reply(
        options.chatId,
        "Bu trek raqami allaqachon mavjud. Boshqa raqam yuboring.",
        undefined,
        options.ctx.botToken
      );
      return;
    }
    await patchSession(String(options.userId), {
      step: "name",
      payload: { trackNumber: text },
    });
    await reply(options.chatId, "2/8 Yuk nomini yuboring.", undefined, options.ctx.botToken);
    return;
  }

  if (session.step === "name") {
    if (text.length < 2) {
      await reply(options.chatId, "Nom kamida 2 belgi bo‘lsin.", undefined, options.ctx.botToken);
      return;
    }
    await patchSession(String(options.userId), {
      step: "category",
      payload: { name: text },
    });
    await reply(
      options.chatId,
      "3/8 Kategoriyani tanlang:",
      categoryKeyboard(),
      options.ctx.botToken
    );
    return;
  }

  if (session.step === "eta") {
    const eta = text.toLowerCase() === "-" ? "" : text;
    await patchSession(String(options.userId), {
      step: "notes",
      payload: { etaDate: eta },
    });
    await reply(
      options.chatId,
      "8/8 Izoh (ixtiyoriy). O‘tkazib yuborish uchun - yuboring yoki tugmani bosing.",
      skipOrCancelKeyboard("a:notesskip"),
      options.ctx.botToken
    );
    return;
  }

  if (session.step === "notes") {
    const notes = text.toLowerCase() === "-" ? "" : text;
    await patchSession(String(options.userId), {
      step: "preview",
      payload: { notes },
    });
    const next = await getSession(String(options.userId));
    await reply(
      options.chatId,
      buildPreview(next?.payload || {}),
      previewKeyboard(),
      options.ctx.botToken
    );
  }
}

export async function handleTelegramUpdate(options: {
  update: TelegramUpdate;
  appUrl: string;
  botToken: string;
  adminIds?: string[];
}): Promise<{ handled: boolean }> {
  const ctx: Ctx = {
    appUrl: options.appUrl,
    botToken: options.botToken,
    adminIds: options.adminIds || [],
  };

  const cq = options.update.callback_query;
  if (cq?.id) {
    const userId = cq.from?.id;
    const chatId = cq.message?.chat?.id;
    const data = (cq.data || "").trim();
    if (!userId || !chatId || !isPrivateChat(cq.message?.chat?.type)) {
      await answerCallbackQuery(cq.id, { botToken: ctx.botToken }).catch(() => null);
      return { handled: true };
    }

    try {
      await handleCallback({ userId, chatId, data, ctx, callbackId: cq.id });
    } catch (error) {
      console.error("[telegram] callback error", error);
      await reply(chatId, "Xatolik yuz berdi. /menu bosing.", undefined, ctx.botToken);
    }
    await answerCallbackQuery(cq.id, { botToken: ctx.botToken }).catch(() => null);
    return { handled: true };
  }

  const message = options.update.message;
  if (!message?.text || !message.chat?.id || !message.from?.id) {
    return { handled: false };
  }
  if (!isPrivateChat(message.chat.type)) return { handled: false };

  const chatId = message.chat.id;
  const userId = message.from.id;
  const text = message.text.trim();
  const cmd = normalizeCommand(text);

  if (cmd === "/start" || cmd === "/menu") {
    await sendHome({
      chatId,
      userId,
      appUrl: ctx.appUrl,
      botToken: ctx.botToken,
      adminIds: ctx.adminIds,
      greet: cmd === "/start",
    });
    return { handled: true };
  }

  if (cmd === "/cancel") {
    await clearSession(String(userId));
    await reply(chatId, "Jarayon bekor qilindi.", homeInline(ctx.appUrl), ctx.botToken);
    return { handled: true };
  }

  // Reply keyboard labels
  if (text === "📦 Yukimni tekshirish") {
    await upsertSession({
      telegramUserId: String(userId),
      chatId: String(chatId),
      mode: "track_search",
      step: "track",
      payload: {},
    });
    await reply(chatId, trackAskText(), undefined, ctx.botToken);
    return { handled: true };
  }
  if (text === "🏢 Omborlar") {
    await reply(chatId, "Ombor regionini tanlang:", warehouseRegionsKeyboard(), ctx.botToken);
    return { handled: true };
  }
  if (text === "👨‍💼 Operatorlar") {
    await sendOperators(chatId, ctx);
    return { handled: true };
  }
  if (text === "🛎 Xizmatlar") {
    await reply(
      chatId,
      guestServicesText(),
      guestServicesKeyboard(ctx.appUrl),
      ctx.botToken
    );
    return { handled: true };
  }
  if (text === "🌐 Saytni ochish") {
    await reply(
      chatId,
      "Sayt / Mini App:",
      homeInline(ctx.appUrl),
      ctx.botToken
    );
    return { handled: true };
  }
  if (text === "⚙️ Admin boshqaruvi") {
    if (!assertTelegramAdmin(userId, ctx.adminIds)) {
      await reply(chatId, "⛔ Admin ruxsati yo‘q.", homeInline(ctx.appUrl), ctx.botToken);
      return { handled: true };
    }
    await reply(chatId, adminMenuText(), adminMenuKeyboard(ctx.appUrl), ctx.botToken);
    return { handled: true };
  }

  const session = await getSession(String(userId));
  if (session?.mode === "track_search" && session.step === "track") {
    await handleTrackLookup({ chatId, userId, track: text, ctx });
    return { handled: true };
  }
  if (session?.mode === "admin_find" && session.step === "track") {
    if (!assertTelegramAdmin(userId, ctx.adminIds)) {
      await reply(chatId, "⛔ Ruxsat yo‘q.", undefined, ctx.botToken);
      return { handled: true };
    }
    const item = await findCargoByTrackNumber(text);
    if (!item) {
      await reply(chatId, cargoNotFoundText(text), adminMenuKeyboard(ctx.appUrl), ctx.botToken);
      return { handled: true };
    }
    await clearSession(String(userId));
    await reply(
      chatId,
      formatPublicCargo(item),
      adminCargoKeyboard({ cargoId: item.id, appUrl: ctx.appUrl }),
      ctx.botToken
    );
    return { handled: true };
  }
  if (session?.mode === "admin_add") {
    await handleAdminAddText({ chatId, userId, text, ctx });
    return { handled: true };
  }

  await reply(
    chatId,
    "Tushunmadim. Menyudan tanlang yoki /menu bosing.",
    homeInline(ctx.appUrl),
    ctx.botToken
  );
  return { handled: true };
}

async function sendOperators(chatId: number | string, ctx: Ctx) {
  const operators = await prisma.operator.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { warehouse: { select: { name: true } } },
    take: 20,
  });
  if (!operators.length) {
    await reply(chatId, "Hozircha operator yo‘q.", homeInline(ctx.appUrl), ctx.botToken);
    return;
  }
  for (const op of operators) {
    await reply(chatId, formatOperatorCard(op), undefined, ctx.botToken);
  }
  await reply(chatId, "Asosiy menyu:", homeInline(ctx.appUrl), ctx.botToken);
}

async function handleCallback(options: {
  userId: number;
  chatId: number;
  data: string;
  ctx: Ctx;
  callbackId: string;
}) {
  const { userId, chatId, data, ctx } = options;
  const uid = String(userId);

  if (data === "p:home") {
    await sendHome({
      chatId,
      userId,
      appUrl: ctx.appUrl,
      botToken: ctx.botToken,
      adminIds: ctx.adminIds,
    });
    return;
  }

  if (data === "p:track") {
    await upsertSession({
      telegramUserId: uid,
      chatId: String(chatId),
      mode: "track_search",
      step: "track",
      payload: {},
    });
    await reply(chatId, trackAskText(), undefined, ctx.botToken);
    return;
  }

  if (data === "p:wh") {
    await reply(chatId, "Ombor regionini tanlang:", warehouseRegionsKeyboard(), ctx.botToken);
    return;
  }

  if (data.startsWith("p:wh:")) {
    const [, , regionCode, pageRaw] = data.split(":");
    const code = regionCode === "UZ" ? "UZ" : "CN";
    const page = Number(pageRaw || 0) || 0;
    const result = await listWarehousesPage(code, page);
    if (!result.total) {
      await reply(
        chatId,
        code === "CN" ? "Xitoy omborlari topilmadi." : "Toshkent omborlari topilmadi.",
        warehouseRegionsKeyboard(),
        ctx.botToken
      );
      return;
    }
    await reply(
      chatId,
      `${code === "CN" ? "🇨🇳 Xitoy" : "🇺🇿 Toshkent"} omborlari (${result.page + 1}/${result.totalPages})`,
      warehouseListKeyboard({
        region: code,
        page: result.page,
        totalPages: result.totalPages,
        items: result.items,
      }),
      ctx.botToken
    );
    return;
  }

  if (data.startsWith("p:whd:")) {
    const id = data.slice("p:whd:".length);
    const wh = await prisma.warehouse.findUnique({ where: { id } });
    if (!wh) {
      await reply(chatId, "Ombor topilmadi.", warehouseRegionsKeyboard(), ctx.botToken);
      return;
    }
    const regionCode = wh.region === "TASHKENT" ? "UZ" : "CN";
    await reply(
      chatId,
      formatWarehouseCard(wh),
      warehouseDetailKeyboard({
        id: wh.id,
        phone: wh.phone,
        telegramUrl: wh.telegramUrl,
        locationUrl: wh.locationUrl || googleMapsSearchUrl(wh.address),
        regionCode,
        page: 0,
      }),
      ctx.botToken
    );
    return;
  }

  if (data.startsWith("p:wha:")) {
    const id = data.slice("p:wha:".length);
    const wh = await prisma.warehouse.findUnique({ where: { id } });
    if (!wh) return;
    await reply(chatId, `📋 Manzil:\n${wh.address}`, undefined, ctx.botToken);
    return;
  }

  if (data.startsWith("p:whp:")) {
    const id = data.slice("p:whp:".length);
    const wh = await prisma.warehouse.findUnique({ where: { id } });
    if (!wh) return;
    await reply(
      chatId,
      `📞 ${wh.phone}${wh.phone2 ? `\n📞 ${wh.phone2}` : ""}`,
      undefined,
      ctx.botToken
    );
    return;
  }

  if (data === "p:op") {
    await sendOperators(chatId, ctx);
    return;
  }

  if (data === "p:svc") {
    await reply(
      chatId,
      guestServicesText(),
      guestServicesKeyboard(ctx.appUrl),
      ctx.botToken
    );
    return;
  }

  if (data.startsWith("p:sub:")) {
    const cargoId = data.slice("p:sub:".length);
    const cargo = await prisma.cargoItem.findUnique({
      where: { id: cargoId },
      select: { id: true, trackNumber: true },
    });
    if (!cargo) {
      await reply(chatId, "Yuk topilmadi.", homeInline(ctx.appUrl), ctx.botToken);
      return;
    }
    await subscribeToCargo({
      telegramUserId: uid,
      chatId: String(chatId),
      cargoItemId: cargo.id,
    });
    await reply(
      chatId,
      `🔔 Obuna qilindi.\n${cargo.trackNumber}\nStatus o‘zgarsa xabar beramiz.`,
      homeInline(ctx.appUrl),
      ctx.botToken
    );
    return;
  }

  // ---- Admin callbacks: ALWAYS re-check admin IDs ----
  if (data.startsWith("a:")) {
    if (!assertTelegramAdmin(userId, ctx.adminIds)) {
      await reply(chatId, "⛔ Admin ruxsati yo‘q.", homeInline(ctx.appUrl), ctx.botToken);
      return;
    }

    if (data === "a:menu" || data === "a:cancel") {
      await clearSession(uid);
      if (data === "a:cancel") {
        await reply(chatId, "Bekor qilindi.", adminMenuKeyboard(ctx.appUrl), ctx.botToken);
      } else {
        await reply(chatId, adminMenuText(), adminMenuKeyboard(ctx.appUrl), ctx.botToken);
      }
      return;
    }

    if (data === "a:add") {
      await startAddCargo(chatId, userId, ctx);
      return;
    }

    if (data === "a:find") {
      await upsertSession({
        telegramUserId: uid,
        chatId: String(chatId),
        mode: "admin_find",
        step: "track",
        payload: {},
      });
      await reply(chatId, "🔎 Trek raqamini yuboring.", undefined, ctx.botToken);
      return;
    }

    if (data === "a:list") {
      const items = await listRecentCargo(8);
      if (!items.length) {
        await reply(chatId, "Yuklar yo‘q.", adminMenuKeyboard(ctx.appUrl), ctx.botToken);
        return;
      }
      await reply(
        chatId,
        "📦 So‘nggi yuklar:",
        adminCargoListKeyboard(
          items.map((i) => ({ id: i.id, trackNumber: i.trackNumber }))
        ),
        ctx.botToken
      );
      return;
    }

    if (data === "a:status") {
      await upsertSession({
        telegramUserId: uid,
        chatId: String(chatId),
        mode: "admin_status",
        step: "pick_cargo",
        payload: {},
      });
      const items = await listRecentCargo(8);
      if (!items.length) {
        await reply(chatId, "Yuklar yo‘q.", adminMenuKeyboard(ctx.appUrl), ctx.botToken);
        return;
      }
      await reply(
        chatId,
        "Statusni o‘zgartirish uchun yukni tanlang:",
        adminCargoListKeyboard(
          items.map((i) => ({ id: i.id, trackNumber: i.trackNumber }))
        ),
        ctx.botToken
      );
      return;
    }

    if (data === "a:wh") {
      const count = await prisma.warehouse.count();
      await reply(
        chatId,
        `🏢 Omborlar: ${count} ta\nBatafsil web admin orqali.`,
        adminMenuKeyboard(ctx.appUrl),
        ctx.botToken
      );
      return;
    }

    if (data === "a:op") {
      const count = await prisma.operator.count({ where: { isActive: true } });
      await reply(
        chatId,
        `👨‍💼 Faol operatorlar: ${count} ta`,
        adminMenuKeyboard(ctx.appUrl),
        ctx.botToken
      );
      return;
    }

    if (data === "a:stats") {
      const stats = await getCargoStats();
      const cat = stats.byCategory
        .map((row) => `• ${row.category}: ${row._count}`)
        .join("\n");
      const st = stats.byStatus
        .map((row) => `• ${STATUS_UZ[row.status as CargoStatus] || row.status}: ${row._count}`)
        .join("\n");
      await reply(
        chatId,
        `📊 Statistika\n\nJami: ${stats.total}\n\nKategoriya:\n${cat || "—"}\n\nHolat:\n${st || "—"}`,
        adminMenuKeyboard(ctx.appUrl),
        ctx.botToken
      );
      return;
    }

    if (data.startsWith("a:show:") || data.startsWith("a:stpick:")) {
      const cargoId = data.includes("stpick")
        ? data.slice("a:stpick:".length)
        : data.slice("a:show:".length);
      const item = await prisma.cargoItem.findUnique({
        where: { id: cargoId },
        include: {
          warehouse: { select: { name: true, city: true } },
          operator: { select: { name: true, phone: true } },
        },
      });
      if (!item) {
        await reply(chatId, "Yuk topilmadi.", adminMenuKeyboard(ctx.appUrl), ctx.botToken);
        return;
      }
      if (data.startsWith("a:stpick:") || (await getSession(uid))?.mode === "admin_status") {
        await upsertSession({
          telegramUserId: uid,
          chatId: String(chatId),
          mode: "admin_status",
          step: "status",
          payload: { cargoId: item.id, trackNumber: item.trackNumber },
        });
        await reply(
          chatId,
          `🔄 ${item.trackNumber}\nYangi holatni tanlang:`,
          statusKeyboard("a:setst"),
          ctx.botToken
        );
        return;
      }
      await reply(
        chatId,
        formatPublicCargo(item),
        adminCargoKeyboard({ cargoId: item.id, appUrl: ctx.appUrl }),
        ctx.botToken
      );
      return;
    }

    if (data.startsWith("a:setst:")) {
      const short = data.slice("a:setst:".length);
      const status = STATUS_SHORT[short];
      const session = await getSession(uid);
      const cargoId = session?.payload.cargoId;
      if (!status || !cargoId) {
        await reply(chatId, "Sessiya tugagan. Qayta boshlang.", adminMenuKeyboard(ctx.appUrl), ctx.botToken);
        return;
      }
      const result = await updateCargoStatus({ cargoId, status });
      await clearSession(uid);
      if (!result.ok) {
        await reply(chatId, result.error, adminMenuKeyboard(ctx.appUrl), ctx.botToken);
        return;
      }
      await reply(
        chatId,
        `✅ Status yangilandi.\n${result.item.trackNumber}\n${STATUS_UZ[status]}`,
        adminCargoKeyboard({ cargoId: result.item.id, appUrl: ctx.appUrl }),
        ctx.botToken
      );
      return;
    }

    // Add-cargo flow callbacks
    if (data.startsWith("a:cat:")) {
      const category = CATEGORY_SHORT[data.slice("a:cat:".length)];
      if (!category) return;
      await patchSession(uid, { step: "status", payload: { category } });
      await reply(chatId, "4/8 Holatni tanlang:", statusKeyboard("a:st"), ctx.botToken);
      return;
    }

    if (data.startsWith("a:st:") && !data.startsWith("a:stpick") && !data.startsWith("a:setst")) {
      const status = STATUS_SHORT[data.slice("a:st:".length)];
      if (!status) return;
      await patchSession(uid, { step: "warehouse", payload: { status, page: 0 } });
      const total = await prisma.warehouse.count();
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const items = await prisma.warehouse.findMany({
        orderBy: { name: "asc" },
        take: PAGE_SIZE,
        select: { id: true, name: true },
      });
      await reply(
        chatId,
        "5/8 Omborni tanlang:",
        warehousePickKeyboard(items, 0, totalPages),
        ctx.botToken
      );
      return;
    }

    if (data.startsWith("a:whpage:")) {
      const page = Number(data.slice("a:whpage:".length)) || 0;
      const total = await prisma.warehouse.count();
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const safePage = Math.min(Math.max(page, 0), totalPages - 1);
      const items = await prisma.warehouse.findMany({
        orderBy: { name: "asc" },
        skip: safePage * PAGE_SIZE,
        take: PAGE_SIZE,
        select: { id: true, name: true },
      });
      await patchSession(uid, { payload: { page: safePage } });
      await reply(
        chatId,
        "5/8 Omborni tanlang:",
        warehousePickKeyboard(items, safePage, totalPages),
        ctx.botToken
      );
      return;
    }

    if (data.startsWith("a:whset:") || data === "a:whskip") {
      let payload: SessionPayload = {};
      if (data.startsWith("a:whset:")) {
        const warehouseId = data.slice("a:whset:".length);
        const wh = await prisma.warehouse.findUnique({
          where: { id: warehouseId },
          select: { id: true, name: true },
        });
        if (!wh) return;
        payload = { warehouseId: wh.id, warehouseName: wh.name };
      } else {
        payload = { warehouseId: "", warehouseName: "" };
      }
      await patchSession(uid, { step: "operator", payload });
      const operators = await prisma.operator.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        take: 15,
        select: { id: true, name: true },
      });
      await reply(
        chatId,
        "6/8 Operatorni tanlang:",
        operatorPickKeyboard(operators),
        ctx.botToken
      );
      return;
    }

    if (data.startsWith("a:opset:") || data === "a:opskip") {
      let payload: SessionPayload = {};
      if (data.startsWith("a:opset:")) {
        const operatorId = data.slice("a:opset:".length);
        const op = await prisma.operator.findUnique({
          where: { id: operatorId },
          select: { id: true, name: true },
        });
        if (!op) return;
        payload = { operatorId: op.id, operatorName: op.name };
      } else {
        payload = { operatorId: "", operatorName: "" };
      }
      await patchSession(uid, { step: "eta", payload });
      await reply(
        chatId,
        "7/8 ETA sanasini yuboring (YYYY-MM-DD) yoki o‘tkazing:",
        skipOrCancelKeyboard("a:etaskip"),
        ctx.botToken
      );
      return;
    }

    if (data === "a:etaskip") {
      await patchSession(uid, { step: "notes", payload: { etaDate: "" } });
      await reply(
        chatId,
        "8/8 Izoh (ixtiyoriy):",
        skipOrCancelKeyboard("a:notesskip"),
        ctx.botToken
      );
      return;
    }

    if (data === "a:notesskip") {
      await patchSession(uid, { step: "preview", payload: { notes: "" } });
      const session = await getSession(uid);
      await reply(
        chatId,
        buildPreview(session?.payload || {}),
        previewKeyboard(),
        ctx.botToken
      );
      return;
    }

    if (data === "a:edit") {
      await startAddCargo(chatId, userId, ctx);
      return;
    }

    if (data === "a:save") {
      const session = await getSession(uid);
      const p = session?.payload || {};
      if (!p.trackNumber || !p.name || !p.category || !p.status) {
        await reply(chatId, "Ma’lumot to‘liq emas.", adminMenuKeyboard(ctx.appUrl), ctx.botToken);
        return;
      }
      const result = await createCargoItem({
        trackNumber: p.trackNumber,
        name: p.name,
        category: p.category as CargoCategory,
        status: p.status as CargoStatus,
        warehouseId: p.warehouseId || null,
        operatorId: p.operatorId || null,
        etaDate: p.etaDate || null,
        notes: p.notes || null,
      });
      await clearSession(uid);
      if (!result.ok) {
        await reply(chatId, `❌ ${result.error}`, adminMenuKeyboard(ctx.appUrl), ctx.botToken);
        return;
      }
      await reply(
        chatId,
        `✅ Yuk saqlandi.\n${result.item.trackNumber}\n${result.item.name}`,
        adminCargoKeyboard({ cargoId: result.item.id, appUrl: ctx.appUrl }),
        ctx.botToken
      );
    }
  }
}

/** Backward-compatible /start-only helper used by older tests */
export function isPrivateStartCommand(update: TelegramUpdate): boolean {
  const message = update.message;
  if (!message?.text || !message.chat?.id) return false;
  if (message.chat.type && message.chat.type !== "private") return false;
  const text = message.text.trim();
  return text === "/start" || text.startsWith("/start@") || text.startsWith("/start ");
}

export function extractStartFromUserId(update: TelegramUpdate): number | null {
  const id = update.message?.from?.id;
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function handleTelegramStartUpdate(options: {
  update: TelegramUpdate;
  appUrl: string;
  botToken: string;
  adminIds?: string[];
}): Promise<{ handled: boolean; isAdmin: boolean }> {
  if (!isPrivateStartCommand(options.update)) {
    return { handled: false, isAdmin: false };
  }
  const chatId = options.update.message?.chat?.id;
  const fromId = extractStartFromUserId(options.update);
  if (!chatId || !fromId) return { handled: false, isAdmin: false };
  const isAdmin = assertTelegramAdmin(fromId, options.adminIds);
  await handleTelegramUpdate(options);
  return { handled: true, isAdmin };
}

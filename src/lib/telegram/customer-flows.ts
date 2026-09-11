import { prisma } from "@/lib/prisma";
import {
  assignCargoToCustomer,
  createOwnershipClaim,
  findCustomerByTelegramId,
  listCustomerCargo,
  listPendingClaims,
  approveOwnershipClaim,
  rejectOwnershipClaim,
  enqueueClaimDecisionNotification,
  upsertTelegramCustomer,
} from "@/lib/customer-service";
import { normalizePhone } from "@/lib/phone";
import { findCargoById } from "@/lib/cargo-service";
import { sendMessage } from "@/lib/telegram/bot-api";
import {
  clearSession,
  upsertSession,
  patchSession,
  getSession,
} from "@/lib/telegram/conversation";
import {
  claimReviewKeyboard,
  myCargoFilterKeyboard,
  myCargoItemKeyboard,
  publicReplyKeyboard,
  requestContactKeyboard,
} from "@/lib/telegram/keyboards";
import {
  formatPublicCargo,
  onboardIntroText,
  profilePreviewText,
} from "@/lib/telegram/messages";
import { assertTelegramAdmin } from "@/lib/telegram/permissions";
import {
  isSubscribed,
  subscribeToCargo,
  unsubscribeFromCargo,
} from "@/lib/telegram/subscriptions";

type Ctx = {
  botToken: string;
  appUrl: string;
  adminIds: string[];
};

export async function startCustomerOnboarding(options: {
  chatId: number | string;
  userId: number;
  from?: { first_name?: string; last_name?: string; username?: string };
  ctx: Ctx;
  returnTo?: string;
}) {
  await upsertSession({
    telegramUserId: String(options.userId),
    chatId: String(options.chatId),
    mode: "customer_onboard",
    step: "await_contact",
    payload: { returnTo: options.returnTo || "my_cargo" },
  });
  await sendMessage(options.chatId, onboardIntroText(), {
    replyMarkup: requestContactKeyboard(),
    botToken: options.ctx.botToken,
  });
}

export async function handleSharedContact(options: {
  chatId: number | string;
  userId: number;
  from: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  contact: {
    phone_number?: string;
    user_id?: number;
    first_name?: string;
    last_name?: string;
  };
  ctx: Ctx;
}) {
  const session = await getSession(String(options.userId));
  if (session?.mode !== "customer_onboard") {
    return { handled: false as const };
  }

  if (
    !options.contact.user_id ||
    Number(options.contact.user_id) !== Number(options.userId)
  ) {
    await sendMessage(
      options.chatId,
      "❌ Faqat o‘zingizning telefon kartangizni yuboring.",
      { replyMarkup: requestContactKeyboard(), botToken: options.ctx.botToken }
    );
    return { handled: true as const };
  }

  const normalized = normalizePhone(options.contact.phone_number);
  if (!normalized) {
    await sendMessage(
      options.chatId,
      "❌ Telefon raqami noto‘g‘ri. Qayta yuboring.",
      { replyMarkup: requestContactKeyboard(), botToken: options.ctx.botToken }
    );
    return { handled: true as const };
  }

  const result = await upsertTelegramCustomer({
    telegramUserId: options.userId,
    chatId: options.chatId,
    firstName:
      options.contact.first_name ||
      options.from.first_name ||
      "Mijoz",
    lastName: options.contact.last_name || options.from.last_name || null,
    username: options.from.username || null,
    phone: options.contact.phone_number || normalized,
    markVerified: true,
  });

  if (!result.ok) {
    await sendMessage(options.chatId, `⛔ ${result.error}`, {
      replyMarkup: publicReplyKeyboard(
        assertTelegramAdmin(options.userId, options.ctx.adminIds)
      ),
      botToken: options.ctx.botToken,
    });
    await clearSession(String(options.userId));
    return { handled: true as const };
  }

  await patchSession(String(options.userId), {
    step: "confirm_profile",
    payload: {
      ...(session.payload || {}),
      phone: options.contact.phone_number || normalized,
      normalizedPhone: normalized,
    },
  });

  await sendMessage(
    options.chatId,
    profilePreviewText({
      firstName: result.customer.firstName,
      phone: normalized,
      customerCode: result.customer.customerCode,
    }),
    {
      replyMarkup: {
        inline_keyboard: [
          [
            { text: "✅ Tasdiqlash", callback_data: "p:profile:ok" },
            { text: "❌ Bekor", callback_data: "p:profile:cancel" },
          ],
        ],
      },
      botToken: options.ctx.botToken,
    }
  );
  return { handled: true as const };
}

export async function openMyCargo(options: {
  chatId: number | string;
  userId: number;
  ctx: Ctx;
  filter?: "NEW" | "IN_TRANSIT" | "AT_BORDER" | "ARRIVED" | "ALL";
  page?: number;
}) {
  const customer = await findCustomerByTelegramId(options.userId);
  if (!customer || customer.status === "BLOCKED") {
    if (customer?.status === "BLOCKED") {
      await sendMessage(options.chatId, "⛔ Profilingiz bloklangan.", {
        botToken: options.ctx.botToken,
      });
      return;
    }
    await startCustomerOnboarding({
      chatId: options.chatId,
      userId: options.userId,
      ctx: options.ctx,
      returnTo: "my_cargo",
    });
    return;
  }

  const filter = options.filter || "ALL";
  const page = options.page ?? 0;
  const result = await listCustomerCargo({
    customerId: customer.id,
    statusFilter: filter,
    page,
  });

  if (!result.items.length) {
    await sendMessage(
      options.chatId,
      "Hozircha biriktirilgan yuk yo‘q.\nTrek orqali topib, “Mening yuklarimga qo‘shish” so‘rovini yuboring.",
      {
        replyMarkup: myCargoFilterKeyboard(),
        botToken: options.ctx.botToken,
      }
    );
    return;
  }

  await sendMessage(
    options.chatId,
    `🚚 Mening yuklarim (${result.total}) · sahifa ${result.page + 1}/${result.totalPages}`,
    { replyMarkup: myCargoFilterKeyboard(), botToken: options.ctx.botToken }
  );

  for (const item of result.items) {
    const subscribed = await isSubscribed(String(options.userId), item.id);
    await sendMessage(options.chatId, formatPublicCargo(item), {
      replyMarkup: myCargoItemKeyboard({
        cargoId: item.id,
        subscribed,
      }),
      botToken: options.ctx.botToken,
    });
  }

  if (result.totalPages > 1) {
    const nav = [];
    if (result.page > 0) {
      nav.push({
        text: "⬅️",
        callback_data: `p:myc:${filter}:${result.page - 1}`,
      });
    }
    if (result.page < result.totalPages - 1) {
      nav.push({
        text: "➡️",
        callback_data: `p:myc:${filter}:${result.page + 1}`,
      });
    }
    if (nav.length) {
      await sendMessage(options.chatId, "Sahifalar:", {
        replyMarkup: { inline_keyboard: [nav] },
        botToken: options.ctx.botToken,
      });
    }
  }
}

export async function requestCargoClaim(options: {
  chatId: number | string;
  userId: number;
  cargoId: string;
  ctx: Ctx;
  from?: { first_name?: string; username?: string };
}) {
  const customer = await findCustomerByTelegramId(options.userId);
  if (!customer) {
    await startCustomerOnboarding({
      chatId: options.chatId,
      userId: options.userId,
      from: options.from,
      ctx: options.ctx,
      returnTo: `claim:${options.cargoId}`,
    });
    return;
  }
  if (customer.status === "BLOCKED") {
    await sendMessage(options.chatId, "⛔ Profilingiz bloklangan.", {
      botToken: options.ctx.botToken,
    });
    return;
  }

  const created = await createOwnershipClaim({
    telegramCustomerId: customer.id,
    cargoItemId: options.cargoId,
  });
  if (!created.ok) {
    await sendMessage(options.chatId, `ℹ️ ${created.error}`, {
      botToken: options.ctx.botToken,
    });
    return;
  }

  await sendMessage(
    options.chatId,
    "So‘rovingiz operatorga yuborildi. Tasdiqlangach yuk “Mening yuklarim” bo‘limida ko‘rinadi.",
    {
      replyMarkup: publicReplyKeyboard(
        assertTelegramAdmin(options.userId, options.ctx.adminIds)
      ),
      botToken: options.ctx.botToken,
    }
  );

  // Notify admins in-chat if we can — list pending for admin who opens menu later
}

export async function sendPendingClaimsToAdmin(options: {
  chatId: number | string;
  userId: number;
  ctx: Ctx;
}) {
  if (!assertTelegramAdmin(options.userId, options.ctx.adminIds)) {
    await sendMessage(options.chatId, "⛔ Admin ruxsati yo‘q.", {
      botToken: options.ctx.botToken,
    });
    return;
  }
  const claims = await listPendingClaims(15);
  if (!claims.length) {
    await sendMessage(options.chatId, "Pending ownership so‘rov yo‘q.", {
      botToken: options.ctx.botToken,
    });
    return;
  }
  for (const claim of claims) {
    const text = [
      "📝 Ownership so‘rovi",
      "",
      `Mijoz: ${claim.telegramCustomer.firstName} (${claim.telegramCustomer.customerCode})`,
      `Tel: ${claim.telegramCustomer.normalizedPhone || claim.telegramCustomer.phone || "—"}`,
      `TG: ${claim.telegramCustomer.telegramUserId}`,
      "",
      `Yuk: ${claim.cargoItem.trackNumber}`,
      claim.cargoItem.name,
      `Status: ${claim.cargoItem.status}`,
    ].join("\n");
    await sendMessage(options.chatId, text, {
      replyMarkup: claimReviewKeyboard(claim.id),
      botToken: options.ctx.botToken,
    });
  }
}

export async function handleClaimAdminAction(options: {
  chatId: number | string;
  userId: number;
  claimId: string;
  approve: boolean;
  ctx: Ctx;
}) {
  if (!assertTelegramAdmin(options.userId, options.ctx.adminIds)) {
    await sendMessage(options.chatId, "⛔ Admin ruxsati yo‘q.", {
      botToken: options.ctx.botToken,
    });
    return;
  }

  const reviewedBy = `tg:${options.userId}`;
  if (options.approve) {
    const result = await approveOwnershipClaim({
      claimId: options.claimId,
      reviewedBy,
    });
    if (!result.ok) {
      await sendMessage(options.chatId, `❌ ${result.error}`, {
        botToken: options.ctx.botToken,
      });
      return;
    }
    await enqueueClaimDecisionNotification({
      chatId: result.customer.chatId,
      telegramUserId: result.customer.telegramUserId,
      cargoItemId: result.cargo.id,
      trackNumber: result.cargo.trackNumber,
      approved: true,
    });
    await sendMessage(
      options.chatId,
      `✅ Tasdiqlandi: ${result.cargo.trackNumber} → ${result.customer.customerCode}`,
      { botToken: options.ctx.botToken }
    );
    return;
  }

  const result = await rejectOwnershipClaim({
    claimId: options.claimId,
    reviewedBy,
  });
  if (!result.ok) {
    await sendMessage(options.chatId, `❌ ${result.error}`, {
      botToken: options.ctx.botToken,
    });
    return;
  }
  await enqueueClaimDecisionNotification({
    chatId: result.customer.chatId,
    telegramUserId: result.customer.telegramUserId,
    cargoItemId: result.cargo.id,
    trackNumber: result.cargo.trackNumber,
    approved: false,
  });
  await sendMessage(options.chatId, "Rad etildi.", {
    botToken: options.ctx.botToken,
  });
}

export async function refreshMyCargoItem(options: {
  chatId: number | string;
  userId: number;
  cargoId: string;
  ctx: Ctx;
}) {
  const customer = await findCustomerByTelegramId(options.userId);
  if (!customer) return;
  if (customer.status === "BLOCKED") {
    await sendMessage(options.chatId, "⛔ Profilingiz bloklangan.", {
      botToken: options.ctx.botToken,
    });
    return;
  }
  const item = await findCargoById(options.cargoId);
  if (!item || item.customerId !== customer.id) {
    await sendMessage(options.chatId, "⛔ Bu yuk sizga biriktirilmagan.", {
      botToken: options.ctx.botToken,
    });
    return;
  }
  const subscribed = await isSubscribed(String(options.userId), item.id);
  await sendMessage(options.chatId, formatPublicCargo(item), {
    replyMarkup: myCargoItemKeyboard({ cargoId: item.id, subscribed }),
    botToken: options.ctx.botToken,
  });
}

export { subscribeToCargo, unsubscribeFromCargo, assignCargoToCustomer, prisma };

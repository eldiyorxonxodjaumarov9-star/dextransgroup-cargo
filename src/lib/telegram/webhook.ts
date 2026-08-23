import { isTelegramAdminId } from "@/lib/telegram/config";
import { buildStartInlineKeyboard, sendMessage } from "@/lib/telegram/bot-api";

export type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: { id?: number; type?: string };
    from?: { id?: number; username?: string; is_bot?: boolean };
  };
};

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
  if (!chatId || !fromId) {
    return { handled: false, isAdmin: false };
  }

  const isAdmin = isTelegramAdminId(fromId, options.adminIds);
  const keyboard = buildStartInlineKeyboard({
    appUrl: options.appUrl,
    isAdmin,
  });

  await sendMessage(
    chatId,
    isAdmin
      ? "DextransGroup Cargo Mini App. Saytni oching yoki admin panelga kiring."
      : "DextransGroup Cargo Mini App. Saytni ochish uchun tugmani bosing.",
    {
      replyMarkup: keyboard,
      botToken: options.botToken,
    }
  );

  return { handled: true, isAdmin };
}

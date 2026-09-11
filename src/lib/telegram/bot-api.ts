import { getTelegramBotToken, getAppUrl } from "@/lib/telegram/config";
import {
  buildStartInlineKeyboard,
  type InlineKeyboardMarkup,
  type ReplyKeyboardMarkup,
} from "@/lib/telegram/keyboards";

export { buildStartInlineKeyboard };
export type { InlineKeyboardMarkup, ReplyKeyboardMarkup };

const DEFAULT_TIMEOUT_MS = 12_000;

export type TelegramReplyMarkup = InlineKeyboardMarkup | ReplyKeyboardMarkup | { remove_keyboard: true };

export function sanitizeTelegramApiError(error: unknown): string {
  if (!error) return "Unknown Telegram API error";
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Telegram API request failed";
  return message.replace(/\d{8,}:[A-Za-z0-9_-]{20,}/g, "[redacted-token]");
}

export async function telegramBotRequest<T = unknown>(
  method: string,
  body: Record<string, unknown>,
  options?: { timeoutMs?: number; botToken?: string }
): Promise<T> {
  const botToken = options?.botToken ?? getTelegramBotToken();
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/${method}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );

    const data = (await response.json().catch(() => null)) as {
      ok?: boolean;
      description?: string;
      result?: T;
    } | null;

    if (!response.ok || !data?.ok) {
      throw new Error(
        sanitizeTelegramApiError(
          data?.description || `Telegram API ${method} failed (${response.status})`
        )
      );
    }

    return data.result as T;
  } catch (error) {
    throw new Error(sanitizeTelegramApiError(error));
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendMessage(
  chatId: number | string,
  text: string,
  options?: {
    replyMarkup?: TelegramReplyMarkup;
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
    botToken?: string;
  }
) {
  return telegramBotRequest(
    "sendMessage",
    {
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
      ...(options?.parseMode ? { parse_mode: options.parseMode } : {}),
      ...(options?.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
    },
    { botToken: options?.botToken }
  );
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  options?: { text?: string; showAlert?: boolean; botToken?: string }
) {
  return telegramBotRequest(
    "answerCallbackQuery",
    {
      callback_query_id: callbackQueryId,
      ...(options?.text ? { text: options.text } : {}),
      ...(options?.showAlert ? { show_alert: true } : {}),
    },
    { botToken: options?.botToken }
  );
}

export function resolvePublicMiniAppUrl() {
  const appUrl = getAppUrl();
  if (!appUrl) return null;
  return `${appUrl}/telegram`;
}

import {
  getTelegramBotToken,
  getAppUrl,
} from "@/lib/telegram/config";

const DEFAULT_TIMEOUT_MS = 12_000;

export type InlineWebAppButton = {
  text: string;
  web_app: { url: string };
};

export type InlineKeyboardMarkup = {
  inline_keyboard: InlineWebAppButton[][];
};

export function buildStartInlineKeyboard(options: {
  appUrl: string;
  isAdmin: boolean;
}): InlineKeyboardMarkup {
  const appUrl = options.appUrl.replace(/\/$/, "");
  const publicUrl = `${appUrl}/telegram`;
  const adminUrl = `${appUrl}/telegram/admin`;
  if (publicUrl === adminUrl) {
    throw new Error("Public and admin Mini App URLs must differ");
  }

  const rows: InlineWebAppButton[][] = [
    [{ text: "🚚 Saytni ochish", web_app: { url: publicUrl } }],
  ];
  if (options.isAdmin) {
    rows.push([
      {
        text: "🔐 Admin panel",
        web_app: { url: adminUrl },
      },
    ]);
  }
  return { inline_keyboard: rows };
}

export function sanitizeTelegramApiError(error: unknown): string {
  if (!error) return "Unknown Telegram API error";
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Telegram API request failed";
  // Strip anything that looks like a bot token pattern
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
  const timeout = windowSetTimeout(
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
    clearWindowTimeout(timeout);
  }
}

function windowSetTimeout(fn: () => void, ms: number) {
  return setTimeout(fn, ms);
}

function clearWindowTimeout(id: ReturnType<typeof setTimeout>) {
  clearTimeout(id);
}

export async function sendMessage(
  chatId: number | string,
  text: string,
  options?: {
    replyMarkup?: InlineKeyboardMarkup;
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
    botToken?: string;
  }
) {
  return telegramBotRequest("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
    ...(options?.parseMode ? { parse_mode: options.parseMode } : {}),
    ...(options?.replyMarkup
      ? { reply_markup: options.replyMarkup }
      : {}),
  }, { botToken: options?.botToken });
}

export function resolvePublicMiniAppUrl() {
  const appUrl = getAppUrl();
  if (!appUrl) return null;
  return `${appUrl}/telegram`;
}

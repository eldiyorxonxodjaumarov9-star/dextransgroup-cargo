import type { TelegramWebApp } from "@/types/telegram-webapp";

const SCRIPT_SRC = "https://telegram.org/js/telegram-web-app.js?63";

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function isTelegramMiniApp(): boolean {
  const webApp = getTelegramWebApp();
  return Boolean(webApp?.initData);
}

export function loadTelegramWebAppScript(): Promise<TelegramWebApp | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  const existing = getTelegramWebApp();
  if (existing) return Promise.resolve(existing);

  const already = document.querySelector<HTMLScriptElement>(
    `script[src="${SCRIPT_SRC}"]`
  );

  return new Promise((resolve) => {
    const finish = () => resolve(getTelegramWebApp());

    if (already) {
      if (getTelegramWebApp()) {
        finish();
        return;
      }
      already.addEventListener("load", finish, { once: true });
      already.addEventListener("error", () => resolve(null), { once: true });
      // Script may already be loaded without WebApp (outside Telegram)
      window.setTimeout(finish, 120);
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = finish;
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

export function readTelegramInsets(webApp: TelegramWebApp) {
  const safe = webApp.safeAreaInset || {};
  const content = webApp.contentSafeAreaInset || {};
  return {
    safeTop: Number(safe.top) || 0,
    safeBottom: Number(safe.bottom) || 0,
    safeLeft: Number(safe.left) || 0,
    safeRight: Number(safe.right) || 0,
    contentTop: Number(content.top) || 0,
    contentBottom: Number(content.bottom) || 0,
    contentLeft: Number(content.left) || 0,
    contentRight: Number(content.right) || 0,
    viewportHeight: Number(webApp.viewportHeight) || 0,
    viewportStableHeight: Number(webApp.viewportStableHeight) || 0,
  };
}

/** Sync Telegram chrome colors to the current site theme — does not write localStorage. */
export function syncTelegramChrome(
  webApp: TelegramWebApp,
  isDark: boolean
) {
  const header = isDark ? "#06080D" : "#F4F7FB";
  const background = isDark ? "#06080D" : "#F4F7FB";
  try {
    webApp.setHeaderColor(header);
  } catch {
    // Older clients may reject arbitrary colors
  }
  try {
    webApp.setBackgroundColor(background);
  } catch {
    // ignore
  }
}

export function applyTelegramCssVars(webApp: TelegramWebApp) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const insets = readTelegramInsets(webApp);
  root.classList.add("telegram-mini-app");
  root.style.setProperty("--tg-safe-area-inset-top", `${insets.safeTop}px`);
  root.style.setProperty(
    "--tg-safe-area-inset-bottom",
    `${insets.safeBottom}px`
  );
  root.style.setProperty("--tg-safe-area-inset-left", `${insets.safeLeft}px`);
  root.style.setProperty("--tg-safe-area-inset-right", `${insets.safeRight}px`);
  root.style.setProperty(
    "--tg-content-safe-area-inset-top",
    `${insets.contentTop}px`
  );
  root.style.setProperty(
    "--tg-content-safe-area-inset-bottom",
    `${insets.contentBottom}px`
  );
  root.style.setProperty(
    "--tg-viewport-height",
    `${insets.viewportHeight || insets.viewportStableHeight}px`
  );
  root.style.setProperty(
    "--tg-viewport-stable-height",
    `${insets.viewportStableHeight || insets.viewportHeight}px`
  );
  root.dataset.tgPlatform = webApp.platform || "";
  root.dataset.tgColorScheme = webApp.colorScheme || "";
}

export function clearTelegramCssVars() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("telegram-mini-app");
  [
    "--tg-safe-area-inset-top",
    "--tg-safe-area-inset-bottom",
    "--tg-safe-area-inset-left",
    "--tg-safe-area-inset-right",
    "--tg-content-safe-area-inset-top",
    "--tg-content-safe-area-inset-bottom",
    "--tg-viewport-height",
    "--tg-viewport-stable-height",
  ].forEach((key) => root.style.removeProperty(key));
  delete root.dataset.tgPlatform;
  delete root.dataset.tgColorScheme;
}

export { SCRIPT_SRC as TELEGRAM_WEB_APP_SCRIPT_SRC };

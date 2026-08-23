"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import {
  applyTelegramCssVars,
  clearTelegramCssVars,
  getTelegramWebApp,
  loadTelegramWebAppScript,
  syncTelegramChrome,
} from "@/lib/telegram/client";
import type { TelegramWebApp } from "@/types/telegram-webapp";

type TelegramMiniAppContextValue = {
  ready: boolean;
  isTelegram: boolean;
  webApp: TelegramWebApp | null;
  platform: string | null;
  colorScheme: "light" | "dark" | null;
};

const TelegramMiniAppContext = createContext<TelegramMiniAppContextValue>({
  ready: false,
  isTelegram: false,
  webApp: null,
  platform: null,
  colorScheme: null,
});

export function useTelegramMiniApp() {
  return useContext(TelegramMiniAppContext);
}

export function TelegramMiniAppProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let onTheme: (() => void) | null = null;
    let onViewport: (() => void) | null = null;
    let active: TelegramWebApp | null = null;

    async function boot() {
      const tg =
        getTelegramWebApp() || (await loadTelegramWebAppScript());
      if (cancelled || !tg) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        tg.ready();
        tg.expand();
      } catch {
        // Outside Telegram some methods may throw
      }

      applyTelegramCssVars(tg);
      const isDark = resolvedTheme !== "light";
      syncTelegramChrome(tg, isDark);

      onTheme = () => {
        applyTelegramCssVars(tg);
        setWebApp(tg);
      };
      onViewport = () => {
        applyTelegramCssVars(tg);
        setWebApp(tg);
      };

      tg.onEvent("themeChanged", onTheme);
      tg.onEvent("viewportChanged", onViewport);

      active = tg;
      if (!cancelled) {
        setWebApp(tg);
        setReady(true);
      }
    }

    void boot();

    return () => {
      cancelled = true;
      if (active) {
        if (onTheme) active.offEvent("themeChanged", onTheme);
        if (onViewport) active.offEvent("viewportChanged", onViewport);
      }
      clearTelegramCssVars();
    };
    // Intentionally mount-once for listeners; theme sync handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!webApp) return;
    applyTelegramCssVars(webApp);
    syncTelegramChrome(webApp, resolvedTheme !== "light");
  }, [resolvedTheme, webApp]);

  const value = useMemo<TelegramMiniAppContextValue>(
    () => ({
      ready,
      isTelegram: Boolean(webApp?.initData),
      webApp,
      platform: webApp?.platform ?? null,
      colorScheme: webApp?.colorScheme ?? null,
    }),
    [ready, webApp]
  );

  return (
    <TelegramMiniAppContext.Provider value={value}>
      {children}
    </TelegramMiniAppContext.Provider>
  );
}

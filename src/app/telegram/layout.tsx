import Script from "next/script";
import { TelegramMiniAppProvider } from "@/components/telegram/TelegramMiniAppProvider";
import { TELEGRAM_WEB_APP_SCRIPT_SRC } from "@/lib/telegram/client";

export default function TelegramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src={TELEGRAM_WEB_APP_SCRIPT_SRC}
        strategy="afterInteractive"
      />
      <TelegramMiniAppProvider>{children}</TelegramMiniAppProvider>
    </>
  );
}

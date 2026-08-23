export type TelegramThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  bottom_bar_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
};

export type TelegramSafeAreaInset = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export type TelegramWebAppUser = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramWebAppUser;
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled?: boolean;
  safeAreaInset?: TelegramSafeAreaInset;
  contentSafeAreaInset?: TelegramSafeAreaInset;
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: "bg_color" | "secondary_bg_color" | string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  onEvent: (
    eventType: "themeChanged" | "viewportChanged" | string,
    eventHandler: (...args: unknown[]) => void
  ) => void;
  offEvent: (
    eventType: "themeChanged" | "viewportChanged" | string,
    eventHandler: (...args: unknown[]) => void
  ) => void;
};

export type TelegramNamespace = {
  WebApp: TelegramWebApp;
};

declare global {
  interface Window {
    Telegram?: TelegramNamespace;
  }
}

export {};

"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes reads localStorage / applies class on <html> before React hydrates.
 * Root <html> must keep suppressHydrationWarning for that intentional class/style diff.
 * Do not render theme-dependent UI until mounted (see AppShell / BrandLogo).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  );
}

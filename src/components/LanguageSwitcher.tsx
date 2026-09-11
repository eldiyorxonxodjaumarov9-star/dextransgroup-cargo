"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type Placement = "bottom-end" | "right-start" | "top-end";

function useIsNarrow(breakpoint = 768) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return narrow;
}

export function LanguageSwitcher({
  className,
  compact = false,
  placement = "bottom-end",
  variant = "default",
}: {
  className?: string;
  compact?: boolean;
  placement?: Placement;
  variant?: "default" | "dock" | "ghost" | "nav";
}) {
  const { locale, setLocale, t } = useLocale();
  const reduced = useReducedMotion();
  const narrow = useIsNarrow();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 196 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const current = LOCALES.find((item) => item.id === locale) || LOCALES[0];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal needs document
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn || narrow) return;
    const rect = btn.getBoundingClientRect();
    const menuWidth = Math.max(196, rect.width);
    const menuHeight = 240;
    let top = rect.bottom + 8;
    let left = rect.right - menuWidth;

    if (placement === "right-start") {
      top = rect.top;
      left = rect.right + 10;
    }
    if (placement === "top-end") {
      top = Math.max(8, rect.top - menuHeight - 8);
      left = rect.right - menuWidth;
    }

    left = Math.min(Math.max(8, left), window.innerWidth - menuWidth - 8);
    if (placement !== "top-end") {
      top = Math.min(top, window.innerHeight - menuHeight - 8);
    }

    setCoords({ top, left, width: menuWidth });
  }, [narrow, placement]);

  useLayoutEffect(() => {
    if (!open || narrow) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, narrow, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const buttons = menuRef.current?.querySelectorAll<HTMLButtonElement>(
      "[data-locale-option]"
    );
    if (!buttons?.length) return;
    const list = Array.from(buttons);
    const index = list.findIndex((el) => el === document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      list[(index + 1) % list.length]?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    }
    if (event.key === "Home") {
      event.preventDefault();
      list[0]?.focus();
    }
    if (event.key === "End") {
      event.preventDefault();
      list[list.length - 1]?.focus();
    }
  }

  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLButtonElement>(
      "[data-locale-option][aria-selected='true'], [data-locale-option]"
    );
    first?.focus();
  }, [open]);

  const options = LOCALES.map((item) => {
    const selected = item.id === locale;
    return (
      <button
        key={item.id}
        type="button"
        role="option"
        data-locale-option
        aria-selected={selected}
        onClick={() => choose(item.id)}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left text-sm outline-none transition",
          selected
            ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] font-bold text-[var(--accent)]"
            : "text-[var(--text)]/90 hover:bg-[var(--surface-soft)] focus:bg-[var(--surface-soft)]"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <Check size={14} className="shrink-0 text-[var(--accent)]" />
          ) : (
            <span className="inline-block w-3.5 shrink-0" />
          )}
          <span className="break-words">{item.label}</span>
        </span>
        <span className="shrink-0 text-xs text-[var(--text-muted)]">{item.short}</span>
      </button>
    );
  });

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "inline-flex h-10 max-w-full shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:gap-1.5 sm:px-3 sm:text-[13px]",
          compact && "px-2.5",
          variant === "default" &&
            "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)]",
          variant === "dock" &&
            "border-transparent bg-[var(--surface-elevated)] text-[var(--text)] hover:bg-[var(--surface-soft)]",
          variant === "nav" &&
            "h-10 min-h-10 w-auto border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-[13px] text-[var(--text)] hover:bg-[var(--surface-soft)]",
          variant === "ghost" && "border-transparent bg-transparent text-[var(--text)]"
        )}
        aria-label={t.lang}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onButtonKeyDown}
      >
        {current.short}
        <ChevronDown
          size={14}
          className={cn("opacity-70 transition", open && "rotate-180")}
        />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open &&
              (narrow ? (
                <motion.div
                  className="fixed inset-0 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    type="button"
                    className="absolute inset-0 bg-black/60"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                  />
                  <motion.div
                    ref={menuRef}
                    id={listboxId}
                    role="listbox"
                    aria-label={t.lang}
                    tabIndex={-1}
                    onKeyDown={onMenuKeyDown}
                    initial={reduced ? false : { y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 360, damping: 34 }}
                    className="absolute inset-x-0 bottom-0 max-h-[70dvh] overflow-y-auto rounded-t-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-elevated)] py-2 text-[var(--text)] shadow-2xl safe-bottom"
                  >
                    <div className="mx-auto mb-2 mt-1 h-1 w-10 rounded-full bg-[var(--text-muted)]/40" />
                    <p className="px-4 pb-2 tracking-id text-[10px] text-[var(--text-muted)]">
                      {t.lang}
                    </p>
                    {options}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  ref={menuRef}
                  id={listboxId}
                  role="listbox"
                  aria-label={t.lang}
                  tabIndex={-1}
                  onKeyDown={onMenuKeyDown}
                  initial={reduced ? false : { opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  style={{
                    position: "fixed",
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                    zIndex: 9999,
                  }}
                  className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-elevated)] py-1.5 text-[var(--text)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]"
                >
                  {options}
                </motion.div>
              ))}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
